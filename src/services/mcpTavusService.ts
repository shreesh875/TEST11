import MCPClient from './mcpClient';
import { TavusConversationResponse } from '../types/tavus';

interface MCPConversationOptions {
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

class MCPTavusService {
  private mcpClient: MCPClient;
  private conversationId: string | null = null;
  private replicaId = 'r9244a899ae0';
  private personaId = 'p4483df9ffff';

  constructor() {
    this.mcpClient = new MCPClient();
  }

  async startConversation(options?: MCPConversationOptions): Promise<TavusConversationResponse> {
    try {
      console.log('Starting MCP conversation with options:', options);

      const result = await this.mcpClient.callTool('create_conversation', {
        replica_id: this.replicaId,
        persona_id: this.personaId,
        conversation_name: options?.conversation_name || 'MCP AI Video Chat',
        conversational_context: options?.conversational_context || 
          'You are an advanced AI assistant in a video chat application powered by MCP (Model Context Protocol). You can see and hear the user through video and audio. Be engaging, helpful, and natural in your responses. You have access to real-time interactions through MCP tools.',
        custom_greeting: options?.custom_greeting || 
          'Hello! I\'m your MCP-powered AI assistant. I can see and hear you through this video chat and have access to advanced tools. How can I help you today?',
        properties: {
          max_call_duration: 3600,
          enable_recording: false,
          enable_closed_captions: true,
          language: 'english',
          ...options?.properties,
        },
      });

      this.conversationId = result.conversation_id;
      console.log('MCP conversation created:', result);
      
      return result;
    } catch (error) {
      console.error('Error starting MCP conversation:', error);
      throw error;
    }
  }

  async sendMessage(message: string): Promise<void> {
    if (!this.conversationId) {
      throw new Error('No active conversation');
    }

    try {
      console.log('Sending MCP message:', message);
      
      await this.mcpClient.callTool('send_message', {
        conversation_id: this.conversationId,
        text: message,
      });

      console.log('MCP message sent successfully');
    } catch (error) {
      console.error('Error sending MCP message:', error);
      throw error;
    }
  }

  async endConversation(): Promise<void> {
    if (!this.conversationId) return;

    try {
      console.log('Ending MCP conversation:', this.conversationId);
      
      await this.mcpClient.callTool('end_conversation', {
        conversation_id: this.conversationId,
      });

      console.log('MCP conversation ended successfully');
    } catch (error) {
      console.error('Error ending MCP conversation:', error);
    } finally {
      this.conversationId = null;
    }
  }

  // MCP-specific interaction methods
  async sendEcho(text: string): Promise<void> {
    if (!this.conversationId) {
      throw new Error('No active conversation');
    }

    await this.mcpClient.callTool('send_interaction', {
      conversation_id: this.conversationId,
      interaction_type: 'echo',
      data: { text },
    });
  }

  async sendTextResponse(text: string): Promise<void> {
    if (!this.conversationId) {
      throw new Error('No active conversation');
    }

    await this.mcpClient.callTool('send_interaction', {
      conversation_id: this.conversationId,
      interaction_type: 'text_respond',
      data: { text },
    });
  }

  async interrupt(text?: string): Promise<void> {
    if (!this.conversationId) {
      throw new Error('No active conversation');
    }

    await this.mcpClient.callTool('send_interaction', {
      conversation_id: this.conversationId,
      interaction_type: 'interrupt',
      data: { text },
    });
  }

  async overwriteContext(context: string): Promise<void> {
    if (!this.conversationId) {
      throw new Error('No active conversation');
    }

    await this.mcpClient.callTool('send_interaction', {
      conversation_id: this.conversationId,
      interaction_type: 'overwrite_context',
      data: { conversational_context: context },
    });
  }

  async setSensitivity(sensitivity: number): Promise<void> {
    if (!this.conversationId) {
      throw new Error('No active conversation');
    }

    await this.mcpClient.callTool('send_interaction', {
      conversation_id: this.conversationId,
      interaction_type: 'set_sensitivity',
      data: { sensitivity: Math.max(0, Math.min(1, sensitivity)) },
    });
  }

  getConversationId(): string | null {
    return this.conversationId;
  }

  getMCPClient(): MCPClient {
    return this.mcpClient;
  }

  getAvailableTools() {
    return this.mcpClient.getAvailableTools();
  }
}

export default MCPTavusService;