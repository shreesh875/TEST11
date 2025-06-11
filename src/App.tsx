import React, { useState } from 'react';
import { ConversationMessage } from './types/tavus';
import TavusService from './services/tavusService';
import ChatInterface from './components/ChatInterface';
import TavusVideoInterface from './components/TavusVideoInterface';
import EventLog from './components/EventLog';
import ConversationSettings from './components/ConversationSettings';
import { useDeepSeekChat } from './hooks/useDeepSeekChat';
import { MessageCircle, Video as VideoIcon, Loader, Activity } from 'lucide-react';

const OPENROUTER_API_KEY = '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';

function App() {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [activeTab, setActiveTab] = useState<'video' | 'chat' | 'events'>('video');
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [events, setEvents] = useState<any[]>([]);

  // Initialize Tavus Service
  const tavusService = new TavusService();
  
  // Initialize DeepSeek chat via OpenRouter
  const { sendMessage: sendDeepSeekMessage, isLoading: isAiTyping } = useDeepSeekChat(OPENROUTER_API_KEY);

  const addEvent = (message: string, eventType: string = 'system.notification') => {
    const event = {
      event_type: eventType,
      conversation_id: conversationId || 'unknown',
      timestamp: new Date().toISOString(),
      properties: { message },
    };
    
    setEvents(prev => [...prev.slice(-49), event]);
  };

  const startConversation = async (options?: any) => {
    try {
      setIsLoading(true);
      
      const conversationOptions = {
        conversation_name: 'AI Video Chat Session',
        conversational_context: 'You are a helpful AI assistant in a video chat. Be engaging, natural, and respond to the user with both voice and gestures. Introduce yourself when the conversation starts.',
        custom_greeting: 'Hello! I\'m your AI assistant. I can see and hear you through this video chat. How can I help you today?',
        properties: {
          max_call_duration: 3600, // 1 hour
          enable_recording: false,
          enable_closed_captions: true,
          language: 'english',
        },
        ...options,
      };

      console.log('Creating new Tavus conversation with options:', conversationOptions);
      const response = await tavusService.createConversation(conversationOptions);
      
      setConversationUrl(response.conversation_url);
      setConversationId(response.conversation_id);
      setIsConnected(true);
      
      console.log('New Tavus conversation created:', {
        id: response.conversation_id,
        url: response.conversation_url,
      });
      
      addEvent('Conversation started successfully', 'system.conversation_started');
      setShowSettings(false);
    } catch (error) {
      console.error('Failed to start conversation:', error);
      addEvent(`Failed to start conversation: ${error}`, 'system.error');
      alert('Failed to start conversation. Please check your API credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const endConversation = async () => {
    try {
      if (conversationId) {
        await tavusService.endConversation(conversationId);
        addEvent('Conversation ended', 'system.conversation_ended');
      }
      setConversationUrl(null);
      setConversationId(null);
      setIsConnected(false);
      setMessages([]);
      console.log('Conversation ended');
    } catch (error) {
      console.error('Failed to end conversation:', error);
      addEvent(`Failed to end conversation: ${error}`, 'system.error');
    }
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: ConversationMessage = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    // Send to DeepSeek AI via OpenRouter for chat response
    await sendDeepSeekMessage(
      [...messages, userMessage],
      (aiResponse) => {
        setMessages(prev => [...prev, aiResponse]);
        setStreamingResponse('');
      },
      (chunk) => {
        setStreamingResponse(prev => prev + chunk);
      }
    );

    // Also send to Tavus if connected (for video response)
    if (isConnected && conversationId) {
      try {
        await tavusService.sendMessage(conversationId, content);
        addEvent('Message sent to Tavus AI', 'conversation.message_sent');
        console.log('Message sent to Tavus AI');
      } catch (error) {
        console.error('Error sending message to Tavus:', error);
        addEvent(`Error sending message to Tavus: ${error}`, 'system.error');
      }
    }
  };

  const tabs = [
    { id: 'video', label: 'Video', icon: VideoIcon },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'events', label: 'Events', icon: Activity },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <VideoIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-xl">AI Video Chat</h1>
                <p className="text-white/60 text-sm">
                  Powered by Tavus + DeepSeek V3
                </p>
              </div>
            </div>
            
            {/* Connection Status & Controls */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white/70">
                <div className={`w-3 h-3 rounded-full ${
                  isConnected ? 'bg-green-400' :
                  isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-gray-400'
                }`}></div>
                <span className="text-sm">
                  {isConnected ? 'Connected' : isLoading ? 'Connecting...' : 'Disconnected'}
                </span>
              </div>

              {/* Tab Navigation */}
              <div className="hidden lg:flex space-x-1 bg-white/10 rounded-lg p-1">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === id
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 inline mr-2" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Mobile Tab Selector */}
              <div className="lg:hidden">
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value as any)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {tabs.map(({ id, label }) => (
                    <option key={id} value={id} className="bg-gray-800">
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Call Controls */}
              <div className="flex space-x-2">
                {!isConnected ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Settings
                    </button>
                    <button
                      onClick={() => startConversation()}
                      disabled={isLoading}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 disabled:scale-100 flex items-center space-x-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          <span>Starting...</span>
                        </>
                      ) : (
                        <>
                          <VideoIcon className="w-4 h-4" />
                          <span>Start Video</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={endConversation}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center space-x-2"
                  >
                    <VideoIcon className="w-4 h-4" />
                    <span>End Video</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-8">
            <ConversationSettings
              onStartConversation={startConversation}
              isLoading={isLoading}
            />
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 h-[calc(100vh-12rem)]">
          {/* Primary Content Area */}
          <div className="xl:col-span-2">
            {activeTab === 'video' && (
              <TavusVideoInterface
                conversationUrl={conversationUrl}
                isConnected={isConnected}
                isLoading={isLoading}
                onStartConversation={() => startConversation()}
              />
            )}
            
            {activeTab === 'chat' && (
              <ChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                isConnected={true} // Chat is always available
                isAiTyping={isAiTyping}
                streamingResponse={streamingResponse}
              />
            )}
            
            {activeTab === 'events' && (
              <EventLog events={events} />
            )}
          </div>

          {/* Sidebar (Desktop) */}
          <div className="hidden xl:block space-y-6">
            {/* Show event log or chat based on active tab */}
            <div className="h-full">
              {activeTab === 'video' ? (
                <EventLog events={events} />
              ) : (
                <ChatInterface
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isConnected={true} // Chat is always available
                  isAiTyping={isAiTyping}
                  streamingResponse={streamingResponse}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;