import React, { useState } from 'react';
import { 
  MessageSquare, 
  StopCircle, 
  Settings, 
  Volume2, 
  VolumeX,
  Mic,
  MicOff,
  Zap,
  RefreshCw,
  Wrench
} from 'lucide-react';
import { InteractionState } from '../types/tavus';

interface InteractionControlsProps {
  interactionState: InteractionState;
  onSendEcho: (text: string) => Promise<boolean>;
  onSendTextResponse: (text: string) => Promise<boolean>;
  onInterrupt: (text?: string) => Promise<boolean>;
  onOverwriteContext: (context: string) => Promise<boolean>;
  onSetSensitivity: (sensitivity: number) => Promise<boolean>;
}

const InteractionControls: React.FC<InteractionControlsProps> = ({
  interactionState,
  onSendEcho,
  onSendTextResponse,
  onInterrupt,
  onOverwriteContext,
  onSetSensitivity,
}) => {
  const [quickMessage, setQuickMessage] = useState('');
  const [contextOverride, setContextOverride] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleQuickSend = async (type: 'echo' | 'respond') => {
    if (!quickMessage.trim() || isExecuting) return;
    
    setIsExecuting(true);
    try {
      let success = false;
      if (type === 'echo') {
        success = await onSendEcho(quickMessage);
      } else {
        success = await onSendTextResponse(quickMessage);
      }
      
      if (success) {
        setQuickMessage('');
      }
    } catch (error) {
      console.error(`MCP ${type} failed:`, error);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleInterrupt = async () => {
    if (isExecuting) return;
    
    setIsExecuting(true);
    try {
      const success = await onInterrupt(quickMessage.trim() || undefined);
      if (success) {
        setQuickMessage('');
      }
    } catch (error) {
      console.error('MCP interrupt failed:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleContextOverride = async () => {
    if (!contextOverride.trim() || isExecuting) return;
    
    setIsExecuting(true);
    try {
      const success = await onOverwriteContext(contextOverride);
      if (success) {
        setContextOverride('');
      }
    } catch (error) {
      console.error('MCP context override failed:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSensitivityChange = async (sensitivity: number) => {
    try {
      await onSetSensitivity(sensitivity);
    } catch (error) {
      console.error('MCP sensitivity change failed:', error);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-lg flex items-center space-x-2">
          <Wrench className="w-5 h-5 text-purple-400" />
          <span>MCP Live Interactions</span>
        </h3>
        
        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            interactionState.isConnected ? 'bg-green-400' : 'bg-red-400'
          }`}></div>
          <span className="text-white/70 text-sm">
            {interactionState.isConnected ? 'MCP Connected' : 'MCP Disconnected'}
          </span>
        </div>
      </div>

      {/* MCP Status Info */}
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
        <div className="flex items-center space-x-2 mb-1">
          <Wrench className="w-4 h-4 text-purple-400" />
          <span className="text-purple-300 font-medium text-sm">MCP Protocol Active</span>
        </div>
        <p className="text-white/60 text-xs">
          Real-time interactions powered by Model Context Protocol
        </p>
      </div>

      {/* Status Indicators */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2 bg-white/5 rounded-lg p-3">
          {interactionState.isSpeaking ? (
            <Volume2 className="w-4 h-4 text-green-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-gray-400" />
          )}
          <span className="text-white/70 text-sm">
            AI {interactionState.isSpeaking ? 'Speaking' : 'Silent'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2 bg-white/5 rounded-lg p-3">
          {interactionState.isListening ? (
            <Mic className="w-4 h-4 text-blue-400" />
          ) : (
            <MicOff className="w-4 h-4 text-gray-400" />
          )}
          <span className="text-white/70 text-sm">
            User {interactionState.isListening ? 'Speaking' : 'Silent'}
          </span>
        </div>
      </div>

      {/* Quick Message Input */}
      <div className="space-y-3">
        <label className="text-white/80 text-sm font-medium">MCP Quick Interaction</label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={quickMessage}
            onChange={(e) => setQuickMessage(e.target.value)}
            placeholder="Type a message for MCP interaction..."
            disabled={isExecuting}
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
            onKeyPress={(e) => e.key === 'Enter' && !isExecuting && handleQuickSend('respond')}
          />
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => handleQuickSend('echo')}
            disabled={!quickMessage.trim() || !interactionState.isConnected || isExecuting}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
          >
            {isExecuting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <MessageSquare className="w-4 h-4" />
            )}
            <span>MCP Echo</span>
          </button>
          
          <button
            onClick={() => handleQuickSend('respond')}
            disabled={!quickMessage.trim() || !interactionState.isConnected || isExecuting}
            className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
          >
            {isExecuting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            <span>MCP Respond</span>
          </button>
          
          <button
            onClick={handleInterrupt}
            disabled={!interactionState.isConnected || isExecuting}
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
          >
            {isExecuting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <StopCircle className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Sensitivity Control */}
      <div className="space-y-3">
        <label className="text-white/80 text-sm font-medium">
          MCP Sensitivity: {Math.round(interactionState.sensitivity * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={interactionState.sensitivity}
          onChange={(e) => handleSensitivityChange(parseFloat(e.target.value))}
          disabled={!interactionState.isConnected}
          className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-white/50">
          <span>Less Sensitive</span>
          <span>More Sensitive</span>
        </div>
      </div>

      {/* Advanced Controls */}
      <div className="space-y-3">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span className="text-sm">Advanced MCP Controls</span>
        </button>
        
        {showAdvanced && (
          <div className="space-y-4 bg-white/5 rounded-lg p-4">
            <div className="space-y-2">
              <label className="text-white/80 text-sm font-medium">Override MCP Context</label>
              <textarea
                value={contextOverride}
                onChange={(e) => setContextOverride(e.target.value)}
                placeholder="Enter new MCP conversational context..."
                disabled={isExecuting}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none disabled:opacity-50"
                rows={3}
              />
              <button
                onClick={handleContextOverride}
                disabled={!contextOverride.trim() || !interactionState.isConnected || isExecuting}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
              >
                {isExecuting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>Override MCP Context</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Last Event Display */}
      {interactionState.lastEvent && (
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-white/60 text-xs mb-1">Last MCP Event</div>
          <div className="text-white text-sm font-mono">
            {interactionState.lastEvent.event_type}
          </div>
          <div className="text-white/50 text-xs mt-1">
            {new Date(interactionState.lastEvent.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractionControls;