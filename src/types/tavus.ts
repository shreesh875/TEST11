export interface TavusConfig {
  apiKey: string;
  personaId: string;
  replicaId: string;
}

export interface ConversationMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface TavusConversationResponse {
  conversation_id: string;
  conversation_name: string;
  status: 'active' | 'ended';
  conversation_url: string;
  replica_id: string;
  persona_id: string;
  created_at: string;
}

// Enhanced conversation properties
export interface TavusConversationProperties {
  max_call_duration?: number;
  participant_left_timeout?: number;
  participant_absent_timeout?: number;
  enable_recording?: boolean;
  enable_closed_captions?: boolean;
  apply_greenscreen?: boolean;
  language?: string;
  recording_s3_bucket_name?: string;
  recording_s3_bucket_region?: string;
  aws_assume_role_arn?: string;
}

// Interaction Types
export interface BaseInteraction {
  message_type: 'conversation';
  conversation_id: string;
}

export interface EchoInteraction extends BaseInteraction {
  event_type: 'conversation.echo';
  properties: {
    text: string;
  };
}

export interface TextRespondInteraction extends BaseInteraction {
  event_type: 'conversation.text_respond';
  properties: {
    text: string;
  };
}

export interface InterruptInteraction extends BaseInteraction {
  event_type: 'conversation.interrupt';
  properties: {
    text?: string;
  };
}

export interface OverwriteContextInteraction extends BaseInteraction {
  event_type: 'conversation.overwrite_conversational_context';
  properties: {
    conversational_context: string;
  };
}

export interface SensitivityInteraction extends BaseInteraction {
  event_type: 'conversation.sensitivity';
  properties: {
    sensitivity: number; // 0.0 to 1.0
  };
}

export type TavusInteraction = 
  | EchoInteraction 
  | TextRespondInteraction 
  | InterruptInteraction 
  | OverwriteContextInteraction 
  | SensitivityInteraction;

// Observable Events
export interface BaseEvent {
  event_type: string;
  conversation_id: string;
  timestamp: string;
  properties?: Record<string, any>;
}

export interface UtteranceEvent extends BaseEvent {
  event_type: 'conversation.utterance';
  properties: {
    text: string;
    speaker: 'user' | 'replica';
  };
}

export interface ToolCallEvent extends BaseEvent {
  event_type: 'conversation.tool_call';
  properties: {
    tool_name: string;
    arguments: Record<string, any>;
    result?: any;
  };
}

export interface PerceptionToolCallEvent extends BaseEvent {
  event_type: 'conversation.perception_tool_call';
  properties: {
    tool_name: string;
    arguments: Record<string, any>;
    result?: any;
  };
}

export interface PerceptionAnalysisEvent extends BaseEvent {
  event_type: 'conversation.perception_analysis';
  properties: {
    analysis: string;
    confidence: number;
  };
}

export interface ReplicaSpeakingEvent extends BaseEvent {
  event_type: 'conversation.replica_started_speaking' | 'conversation.replica_stopped_speaking';
  properties: {
    duration?: number;
  };
}

export interface UserSpeakingEvent extends BaseEvent {
  event_type: 'conversation.user_started_speaking' | 'conversation.user_stopped_speaking';
  properties: {
    duration?: number;
  };
}

export interface ReplicaInterruptedEvent extends BaseEvent {
  event_type: 'conversation.replica_interrupted';
  properties: {
    interrupted_at: number;
    reason: string;
  };
}

export interface SystemNotificationEvent extends BaseEvent {
  event_type: 'system.notification';
  properties: {
    message: string;
  };
}

export type TavusEvent = 
  | UtteranceEvent 
  | ToolCallEvent 
  | PerceptionToolCallEvent 
  | PerceptionAnalysisEvent 
  | ReplicaSpeakingEvent 
  | UserSpeakingEvent 
  | ReplicaInterruptedEvent
  | SystemNotificationEvent;

export interface InteractionState {
  isConnected: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  lastEvent?: TavusEvent;
  sensitivity: number;
}

// Daily.co participant interface
export interface DailyParticipant {
  session_id: string;
  user_name: string;
  local: boolean;
  audio: boolean;
  video: boolean;
  tracks: {
    audio?: {
      state: 'playable' | 'off' | 'interrupted' | 'blocked';
      persistentTrack?: MediaStreamTrack;
    };
    video?: {
      state: 'playable' | 'off' | 'interrupted' | 'blocked';
      persistentTrack?: MediaStreamTrack;
    };
  };
}

// Webhook event types for Tavus callbacks
export interface TavusWebhookEvent {
  event_type: string;
  conversation_id: string;
  timestamp: string;
  data: Record<string, any>;
}