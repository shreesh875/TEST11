import React, { useState } from 'react';
import { Settings, Clock, Mic, Video, Globe } from 'lucide-react';

interface ConversationSettingsProps {
  onStartConversation: (options: any) => void;
  isLoading: boolean;
}

const ConversationSettings: React.FC<ConversationSettingsProps> = ({
  onStartConversation,
  isLoading,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    conversationName: 'AI Video Chat Session',
    conversationalContext: 'You are a helpful AI assistant in a video chat. Be engaging, natural, and respond to the user with both voice and gestures. Introduce yourself when the conversation starts.',
    customGreeting: 'Hello! I\'m your AI assistant. I can see and hear you through this video chat. How can I help you today?',
    maxDuration: 3600, // 1 hour
    enableRecording: false,
    enableClosedCaptions: true,
    language: 'english',
  });

  const handleStartWithSettings = () => {
    const options = {
      conversation_name: settings.conversationName,
      conversational_context: settings.conversationalContext,
      custom_greeting: settings.customGreeting,
      properties: {
        max_call_duration: settings.maxDuration,
        enable_recording: settings.enableRecording,
        enable_closed_captions: settings.enableClosedCaptions,
        language: settings.language,
      },
    };
    
    onStartConversation(options);
  };

  if (!showSettings) {
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handleStartWithSettings()}
          disabled={isLoading}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 disabled:scale-100 flex items-center space-x-2"
        >
          <Video className="w-4 h-4" />
          <span>Quick Start</span>
        </button>
        
        <button
          onClick={() => setShowSettings(true)}
          className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-lg flex items-center space-x-2">
          <Settings className="w-5 h-5 text-purple-400" />
          <span>Conversation Settings</span>
        </h3>
        <button
          onClick={() => setShowSettings(false)}
          className="text-white/70 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        {/* Basic Settings */}
        <div className="space-y-3">
          <label className="text-white/80 text-sm font-medium">Conversation Name</label>
          <input
            type="text"
            value={settings.conversationName}
            onChange={(e) => setSettings(prev => ({ ...prev, conversationName: e.target.value }))}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter conversation name..."
          />
        </div>

        <div className="space-y-3">
          <label className="text-white/80 text-sm font-medium">AI Context</label>
          <textarea
            value={settings.conversationalContext}
            onChange={(e) => setSettings(prev => ({ ...prev, conversationalContext: e.target.value }))}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            rows={3}
            placeholder="Describe how the AI should behave..."
          />
        </div>

        <div className="space-y-3">
          <label className="text-white/80 text-sm font-medium">Custom Greeting</label>
          <input
            type="text"
            value={settings.customGreeting}
            onChange={(e) => setSettings(prev => ({ ...prev, customGreeting: e.target.value }))}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="What should the AI say first?"
          />
        </div>

        {/* Advanced Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="text-white/80 text-sm font-medium flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Max Duration (minutes)</span>
            </label>
            <input
              type="number"
              value={settings.maxDuration / 60}
              onChange={(e) => setSettings(prev => ({ ...prev, maxDuration: parseInt(e.target.value) * 60 }))}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              min="5"
              max="180"
            />
          </div>

          <div className="space-y-3">
            <label className="text-white/80 text-sm font-medium flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <span>Language</span>
            </label>
            <select
              value={settings.language}
              onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="english" className="bg-gray-800">English</option>
              <option value="spanish" className="bg-gray-800">Spanish</option>
              <option value="french" className="bg-gray-800">French</option>
              <option value="german" className="bg-gray-800">German</option>
            </select>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-white/80 text-sm font-medium flex items-center space-x-2">
              <Video className="w-4 h-4" />
              <span>Enable Recording</span>
            </label>
            <button
              onClick={() => setSettings(prev => ({ ...prev, enableRecording: !prev.enableRecording }))}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.enableRecording ? 'bg-purple-500' : 'bg-white/20'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                settings.enableRecording ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-white/80 text-sm font-medium flex items-center space-x-2">
              <Mic className="w-4 h-4" />
              <span>Closed Captions</span>
            </label>
            <button
              onClick={() => setSettings(prev => ({ ...prev, enableClosedCaptions: !prev.enableClosedCaptions }))}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.enableClosedCaptions ? 'bg-purple-500' : 'bg-white/20'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                settings.enableClosedCaptions ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4 border-t border-white/10">
        <button
          onClick={handleStartWithSettings}
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 text-white py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 disabled:scale-100 flex items-center justify-center space-x-2"
        >
          <Video className="w-4 h-4" />
          <span>{isLoading ? 'Starting...' : 'Start Conversation'}</span>
        </button>
        
        <button
          onClick={() => setShowSettings(false)}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ConversationSettings;