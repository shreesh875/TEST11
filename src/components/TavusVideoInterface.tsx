import React from 'react';
import { MessageCircle, Video, Loader, Play } from 'lucide-react';

interface TavusVideoInterfaceProps {
  conversationUrl: string | null;
  isConnected: boolean;
  isLoading: boolean;
  onStartConversation: () => void;
  onCallFrameReady?: (callFrame: any) => void; // Keep for compatibility but won't use
}

const TavusVideoInterface: React.FC<TavusVideoInterfaceProps> = ({
  conversationUrl,
  isConnected,
  isLoading,
  onStartConversation,
}) => {
  if (isLoading) {
    return (
      <div className="h-full bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader className="w-8 h-8 text-white animate-spin" />
          </div>
          <h3 className="text-white text-xl font-semibold mb-2">Starting Conversation</h3>
          <p className="text-white/70">
            Connecting to your AI assistant...
          </p>
        </div>
      </div>
    );
  }

  if (!isConnected || !conversationUrl) {
    return (
      <div className="h-full bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Video className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-white text-2xl font-bold mb-4">
            AI Video Chat
          </h3>
          <p className="text-white/70 mb-6 max-w-md">
            Start a conversation with your AI assistant. You'll be able to see and hear them respond in real-time through video.
          </p>
          <button
            onClick={onStartConversation}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3 rounded-full font-medium transition-all duration-200 hover:scale-105 flex items-center space-x-2 mx-auto"
          >
            <Play className="w-5 h-5" />
            <span>Start Video Call</span>
          </button>
          
          <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-white/60 text-sm mb-2">Features:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-white/70">
              <div>• Real-time video chat</div>
              <div>• Voice interactions</div>
              <div>• AI conversations</div>
              <div>• Powered by Tavus</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
      {/* Simple Video Header */}
      <div className="bg-black/20 px-4 py-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white font-medium">
              Tavus AI Assistant
            </span>
            <span className="text-green-400 text-sm">
              Connected
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-white/70 text-sm">
            <MessageCircle className="w-4 h-4" />
            <span>Live Conversation</span>
          </div>
        </div>
      </div>

      {/* Simple iframe embedding - no Daily SDK complexity */}
      <div className="h-[calc(100%-60px)]">
        <iframe
          src={conversationUrl}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          className="w-full h-full border-none"
          title="Tavus AI Video Chat"
          style={{
            background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
          }}
        />
      </div>
    </div>
  );
};

export default TavusVideoInterface;