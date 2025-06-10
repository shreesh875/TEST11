import React, { useRef, useEffect } from 'react';
import { TavusEvent } from '../types/tavus';
import { 
  MessageCircle, 
  Wrench, 
  Eye, 
  Brain, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff,
  AlertTriangle
} from 'lucide-react';

interface EventLogProps {
  events: TavusEvent[];
}

const EventLog: React.FC<EventLogProps> = ({ events }) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'conversation.utterance':
        return <MessageCircle className="w-4 h-4" />;
      case 'conversation.tool_call':
        return <Wrench className="w-4 h-4" />;
      case 'conversation.perception_tool_call':
        return <Eye className="w-4 h-4" />;
      case 'conversation.perception_analysis':
        return <Brain className="w-4 h-4" />;
      case 'conversation.replica_started_speaking':
        return <Volume2 className="w-4 h-4 text-green-400" />;
      case 'conversation.replica_stopped_speaking':
        return <VolumeX className="w-4 h-4 text-gray-400" />;
      case 'conversation.user_started_speaking':
        return <Mic className="w-4 h-4 text-blue-400" />;
      case 'conversation.user_stopped_speaking':
        return <MicOff className="w-4 h-4 text-gray-400" />;
      case 'conversation.replica_interrupted':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'conversation.utterance':
        return 'border-blue-500/30 bg-blue-500/10';
      case 'conversation.tool_call':
        return 'border-purple-500/30 bg-purple-500/10';
      case 'conversation.perception_tool_call':
        return 'border-cyan-500/30 bg-cyan-500/10';
      case 'conversation.perception_analysis':
        return 'border-indigo-500/30 bg-indigo-500/10';
      case 'conversation.replica_started_speaking':
      case 'conversation.replica_stopped_speaking':
        return 'border-green-500/30 bg-green-500/10';
      case 'conversation.user_started_speaking':
      case 'conversation.user_stopped_speaking':
        return 'border-blue-500/30 bg-blue-500/10';
      case 'conversation.replica_interrupted':
        return 'border-red-500/30 bg-red-500/10';
      default:
        return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  const formatEventType = (eventType: string) => {
    return eventType.replace('conversation.', '').replace(/_/g, ' ').toUpperCase();
  };

  const renderEventProperties = (event: TavusEvent) => {
    const properties = (event as any).properties;
    if (!properties) return null;

    return (
      <div className="mt-2 text-xs text-white/60">
        {Object.entries(properties).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="font-medium">{key}:</span>
            <span className="ml-2 truncate max-w-32">
              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4 h-full flex flex-col">
      <div className="flex items-center space-x-2 mb-4">
        <MessageCircle className="w-5 h-5 text-purple-400" />
        <h3 className="text-white font-semibold">Event Log</h3>
        <span className="text-white/50 text-sm">({events.length})</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {events.length === 0 ? (
          <div className="text-center text-white/50 py-8">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No events yet</p>
            <p className="text-xs mt-1">Events will appear here during the conversation</p>
          </div>
        ) : (
          events.map((event, index) => (
            <div
              key={`${event.event_type}-${event.timestamp}-${index}`}
              className={`border rounded-lg p-3 ${getEventColor(event.event_type)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getEventIcon(event.event_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white text-sm font-medium">
                      {formatEventType(event.event_type)}
                    </h4>
                    <span className="text-white/50 text-xs">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {renderEventProperties(event)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};

export default EventLog;