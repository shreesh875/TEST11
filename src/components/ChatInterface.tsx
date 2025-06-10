import React, { useState, useRef, useEffect } from 'react';
import { ConversationMessage } from '../types/tavus';
import { Send, User, Bot, Loader } from 'lucide-react';

interface ChatInterfaceProps {
  messages: ConversationMessage[];
  onSendMessage: (message: string) => void;
  isConnected: boolean;
  isAiTyping?: boolean;
  streamingResponse?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isConnected,
  isAiTyping = false,
  streamingResponse = '',
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingResponse]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
      {/* Chat Header */}
      <div className="p-4 border-b border-white/10">
        <h3 className="text-white font-semibold text-lg">AI Chat</h3>
        <p className="text-white/60 text-sm">
          Powered by DeepSeek V3 via OpenRouter • {messages.length} messages
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-white/50 py-8">
            <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">Start a conversation</p>
            <p className="text-sm">Ask me anything! I'm powered by DeepSeek V3 AI via OpenRouter</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl flex items-start space-x-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : 'bg-white/10 text-white backdrop-blur-sm border border-white/20'
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {message.role === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4 text-purple-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Streaming Response */}
            {(isAiTyping || streamingResponse) && (
              <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl flex items-start space-x-3 bg-white/10 text-white backdrop-blur-sm border border-white/20">
                  <div className="flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-purple-300" />
                  </div>
                  <div className="flex-1">
                    {streamingResponse ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {streamingResponse}
                        <span className="inline-block w-2 h-4 bg-purple-400 ml-1 animate-pulse"></span>
                      </p>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Loader className="w-4 h-4 animate-spin text-purple-300" />
                        <span className="text-sm text-white/70">AI is thinking...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask DeepSeek V3 anything..."
            disabled={isAiTyping}
            className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 transition-all"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isAiTyping}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 disabled:opacity-50 text-white rounded-full p-3 transition-all duration-200 hover:scale-105 disabled:scale-100"
          >
            {isAiTyping ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
        <p className="text-white/40 text-xs mt-2 text-center">
          Powered by DeepSeek V3 via OpenRouter • Free AI model
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;