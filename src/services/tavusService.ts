interface TavusConversationOptions {
  conversation_name?: string;
  conversational_context?: string;
  custom_greeting?: string;
  properties?: {
    max_call_duration?: number;
    enable_recording?: boolean;
    enable_closed_captions?: boolean;
    language?: string;
  };
}

interface TavusConversationResponse {
  conversation_id: string;
  conversation_name: string;
  status: 'active' | 'ended';
  conversation_url: string;
  replica_id: string;
  persona_id: string;
  created_at: string;
}

class TavusService {
  private apiKey = '2b65ef86349841bbbee6451902796a78';
  private baseUrl = 'https://tavusapi.com/v2';
  private replicaId = 'r9244a899ae0';
  private personaId = 'p4483df9ffff';

  async createConversation(options?: TavusConversationOptions): Promise<TavusConversationResponse> {
    try {
      console.log('Creating Tavus conversation with options:', options);

      const response = await fetch(`${this.baseUrl}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
        body: JSON.stringify({
          replica_id: this.replicaId,
          persona_id: this.personaId,
          conversation_name: options?.conversation_name || 'AI Video Chat',
          conversational_context: options?.conversational_context || 
            'You are a helpful AI assistant in a video chat. Be engaging, natural, and respond to the user with both voice and gestures.',
          custom_greeting: options?.custom_greeting || 
            'Hello! I\'m your AI assistant. How can I help you today?',
          properties: {
            max_call_duration: 3600,
            enable_recording: false,
            enable_closed_captions: true,
            language: 'english',
            ...options?.properties,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Tavus API error:', errorText);
        throw new Error(`Tavus API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Tavus conversation created:', result);
      return result;
    } catch (error) {
      console.error('Error creating Tavus conversation:', error);
      throw error;
    }
  }

  async sendMessage(conversationId: string, message: string): Promise<void> {
    try {
      console.log('Sending message to Tavus:', { conversationId, message });

      const response = await fetch(`${this.baseUrl}/conversations/${conversationId}/speak`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text: message,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Tavus speak API error:', errorText);
        throw new Error(`Tavus speak API error: ${response.status} - ${errorText}`);
      }

      console.log('Message sent to Tavus successfully');
    } catch (error) {
      console.error('Error sending message to Tavus:', error);
      throw error;
    }
  }

  async endConversation(conversationId: string): Promise<void> {
    try {
      console.log('Ending Tavus conversation:', conversationId);

      const response = await fetch(`${this.baseUrl}/conversations/${conversationId}/end`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Tavus end conversation API error:', errorText);
        throw new Error(`Tavus end conversation API error: ${response.status} - ${errorText}`);
      }

      console.log('Tavus conversation ended successfully');
    } catch (error) {
      console.error('Error ending Tavus conversation:', error);
      throw error;
    }
  }

  async getConversationStatus(conversationId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations/${conversationId}`, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Tavus API error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting conversation status:', error);
      throw error;
    }
  }
}

export default TavusService;