import React, { useState, useMemo, useCallback } from 'react';
import { ConversationMessage } from './types/tavus';
import MCPTavusService from './services/mcpTavusService';
import ChatInterface from './components/ChatInterface';
import TavusVideoInterface from './components/TavusVideoInterface';
import InteractionControls from './components/InteractionControls';
import EventLog from './components/EventLog';
import ConversationSettings from './components/ConversationSettings';
import MCPToolsPanel from './components/MCPToolsPanel';
import { useMCPInteractions } from './hooks/useMCPInteractions';
import { useDeepSeekChat } from './hooks/useDeepSeekChat';
import { MessageCircle, Video as VideoIcon, Loader, Zap, Activity, Wrench } from 'lucide-react';

const OPENROUTER_API_KEY = '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';

function App() {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [activeTab, setActiveTab] = useState<'video' | 'chat' | 'interactions' | 'events' | 'tools'>('video');
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Initialize MCP Tavus Service
  const mcpTavusService = useMemo(() => new MCPTavusService(), []);
  
  // Initialize DeepSeek chat via OpenRouter
  const { sendMessage: sendDeepSeekMessage, isLoading: isAiTyping } = useDeepSeekChat(OPENROUTER_API_KEY);

  // MCP-powered interactions hook
  const {
    interactionState,
    events,
    sendEcho,
    sendTextResponse,
    interrupt,
    overwriteContext,
    setSensitivity,
    getParticipants,
    getAIParticipant,
    getAvailableTools,
    addSystemEvent,
  } = useMCPInteractions(conversationUrl, conversationId, mcpTavusService);

  const startConversation = async (options?: any) => {
    try {
      setIsLoading(true);
      
      // Create a fresh conversation using MCP
      const conversationOptions = {
        conversation_name: 'MCP AI Video Chat Session',
        conversational_context: 'You are a helpful AI assistant in a video chat powered by MCP (Model Context Protocol). Be engaging, natural, and respond to the user with both voice and gestures. You have access to advanced tools through MCP. Introduce yourself when the conversation starts.',
        custom_greeting: 'Hello! I\'m your MCP-powered AI assistant. I can see and hear you through this video chat and have access to advanced tools. How can I help you today?',
        properties: {
          max_call_duration: 3600, // 1 hour
          enable_recording: false,
          enable_closed_captions: true,
          language: 'english',
        },
        ...options,
      };

      console.log('Creating new MCP Tavus conversation with options:', conversationOptions);
      const response = await mcpTavusService.startConversation(conversationOptions);
      
      setConversationUrl(response.conversation_url);
      setConversationId(response.conversation_id);
      setIsConnected(true);
      
      console.log('New MCP Tavus conversation created:', {
        id: response.conversation_id,
        url: response.conversation_url,
      });
      
      addSystemEvent('MCP conversation started successfully', 'system.conversation_started');
      setShowSettings(false);
    } catch (error) {
      console.error('Failed to start MCP conversation:', error);
      addSystemEvent(`Failed to start MCP conversation: ${error}`, 'system.error');
      alert('Failed to start conversation. Please check your MCP server and API credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const endConversation = async () => {
    try {
      if (conversationId) {
        await mcpTavusService.endConversation();
        addSystemEvent('MCP conversation ended', 'system.conversation_ended');
      }
      setConversationUrl(null);
      setConversationId(null);
      setIsConnected(false);
      setMessages([]);
      console.log('MCP conversation ended');
    } catch (error) {
      console.error('Failed to end MCP conversation:', error);
      addSystemEvent(`Failed to end MCP conversation: ${error}`, 'system.error');
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

    // Also send via MCP Tavus if connected (for video response)
    if (isConnected && conversationId) {
      try {
        await mcpTavusService.sendMessage(content);
        addSystemEvent('Message sent to MCP Tavus AI', 'conversation.message_sent');
        console.log('Message sent to MCP Tavus AI');
      } catch (error) {
        console.error('Error sending message to MCP Tavus:', error);
        addSystemEvent(`Error sending message to MCP Tavus: ${error}`, 'system.error');
      }
    }
  };

  // MCP Tool calling
  const handleCallTool = useCallback(async (toolName: string, args: any) => {
    try {
      addSystemEvent(`Calling MCP tool: ${toolName}`, 'system.tool_call');
      const result = await mcpTavusService.getMCPClient().callTool(toolName, args);
      addSystemEvent(`MCP tool ${toolName} completed successfully`, 'system.tool_success');
      return result;
    } catch (error) {
      addSystemEvent(`MCP tool ${toolName} failed: ${error}`, 'system.tool_error');
      throw error;
    }
  }, [mcpTavusService, addSystemEvent]);

  const tabs = [
    { id: 'video', label: 'Video', icon: VideoIcon },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'interactions', label: 'Interactions', icon: Zap },
    { id: 'tools', label: 'MCP Tools', icon: Wrench },
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
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-xl">MCP AI Video Chat</h1>
                <p className="text-white/60 text-sm">
                  Powered by MCP + Tavus CVI + DeepSeek V3
                </p>
              </div>
            </div>
            
            {/* Enhanced Connection Status & Controls */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white/70">
                <div className={`w-3 h-3 rounded-full ${
                  isConnected ? 'bg-green-400' :
                  isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-gray-400'
                }`}></div>
                <span className="text-sm">
                  {isConnected ? 'MCP Connected' : isLoading ? 'Connecting...' : 'MCP Disconnected'}
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
                          <span>Starting MCP...</span>
                        </>
                      ) : (
                        <>
                          <VideoIcon className="w-4 h-4" />
                          <span>Start MCP Video</span>
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
                    <span>End MCP Video</span>
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
            
            {activeTab === 'interactions' && (
              <InteractionControls
                interactionState={interactionState}
                onSendEcho={sendEcho}
                onSendTextResponse={sendTextResponse}
                onInterrupt={interrupt}
                onOverwriteContext={overwriteContext}
                onSetSensitivity={setSensitivity}
              />
            )}
            
            {activeTab === 'tools' && (
              <MCPToolsPanel
                tools={getAvailableTools()}
                onCallTool={handleCallTool}
                isConnected={isConnected}
              />
            )}
            
            {activeTab === 'events' && (
              <EventLog events={events} />
            )}
          </div>

          {/* Sidebar (Desktop) */}
          <div className="hidden xl:block space-y-6">
            {/* Always show MCP tools when connected */}
            {isConnected && activeTab === 'video' && (
              <div className="h-1/2">
                <MCPToolsPanel
                  tools={getAvailableTools()}
                  onCallTool={handleCallTool}
                  isConnected={isConnected}
                />
              </div>
            )}
            
            {/* Show event log or chat based on active tab */}
            <div className={isConnected && activeTab === 'video' ? 'h-1/2' : 'h-full'}>
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