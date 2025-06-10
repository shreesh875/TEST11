import { useState, useCallback, useEffect } from 'react';
import { TavusEvent, InteractionState } from '../types/tavus';
import MCPTavusService from '../services/mcpTavusService';

export const useMCPInteractions = (
  conversationUrl: string | null,
  conversationId: string | null,
  mcpService: MCPTavusService | null
) => {
  const [interactionState, setInteractionState] = useState<InteractionState>({
    isConnected: !!conversationUrl,
    isSpeaking: false,
    isListening: false,
    sensitivity: 0.5,
  });
  
  const [events, setEvents] = useState<TavusEvent[]>([]);

  // Update connection state when conversation changes
  useEffect(() => {
    setInteractionState(prev => ({
      ...prev,
      isConnected: !!conversationUrl && !!conversationId,
    }));
  }, [conversationUrl, conversationId]);

  // Add system event helper
  const addSystemEvent = useCallback((message: string, eventType: string = 'system.notification') => {
    const systemEvent: TavusEvent = {
      event_type: eventType,
      conversation_id: conversationId || 'unknown',
      timestamp: new Date().toISOString(),
      properties: { message },
    } as any;
    
    setEvents(prev => [...prev.slice(-49), systemEvent]);
    
    // Update interaction state for certain events
    if (eventType.includes('speaking')) {
      setInteractionState(prev => ({
        ...prev,
        isSpeaking: eventType.includes('started'),
        lastEvent: systemEvent,
      }));
    } else if (eventType.includes('listening')) {
      setInteractionState(prev => ({
        ...prev,
        isListening: eventType.includes('started'),
        lastEvent: systemEvent,
      }));
    } else {
      setInteractionState(prev => ({
        ...prev,
        lastEvent: systemEvent,
      }));
    }
  }, [conversationId]);

  // MCP-powered interaction methods
  const sendEcho = useCallback(async (text: string) => {
    if (!mcpService) {
      console.warn('MCP service not available');
      return false;
    }

    try {
      await mcpService.sendEcho(text);
      addSystemEvent(`MCP Echo sent: ${text}`, 'conversation.echo');
      return true;
    } catch (error) {
      console.error('MCP Echo failed:', error);
      addSystemEvent(`MCP Echo failed: ${error}`, 'system.error');
      return false;
    }
  }, [mcpService, addSystemEvent]);

  const sendTextResponse = useCallback(async (text: string) => {
    if (!mcpService) {
      console.warn('MCP service not available');
      return false;
    }

    try {
      await mcpService.sendTextResponse(text);
      addSystemEvent(`MCP Text response sent: ${text}`, 'conversation.text_respond');
      return true;
    } catch (error) {
      console.error('MCP Text response failed:', error);
      addSystemEvent(`MCP Text response failed: ${error}`, 'system.error');
      return false;
    }
  }, [mcpService, addSystemEvent]);

  const interrupt = useCallback(async (text?: string) => {
    if (!mcpService) {
      console.warn('MCP service not available');
      return false;
    }

    try {
      await mcpService.interrupt(text);
      addSystemEvent(`MCP Interrupt sent${text ? `: ${text}` : ''}`, 'conversation.interrupt');
      return true;
    } catch (error) {
      console.error('MCP Interrupt failed:', error);
      addSystemEvent(`MCP Interrupt failed: ${error}`, 'system.error');
      return false;
    }
  }, [mcpService, addSystemEvent]);

  const overwriteContext = useCallback(async (conversationalContext: string) => {
    if (!mcpService) {
      console.warn('MCP service not available');
      return false;
    }

    try {
      await mcpService.overwriteContext(conversationalContext);
      addSystemEvent('MCP Context overridden', 'conversation.context_override');
      return true;
    } catch (error) {
      console.error('MCP Context override failed:', error);
      addSystemEvent(`MCP Context override failed: ${error}`, 'system.error');
      return false;
    }
  }, [mcpService, addSystemEvent]);

  const setSensitivity = useCallback(async (sensitivity: number) => {
    const clampedSensitivity = Math.max(0, Math.min(1, sensitivity));
    
    if (!mcpService) {
      // Update local state even if MCP is not available
      setInteractionState(prev => ({ ...prev, sensitivity: clampedSensitivity }));
      addSystemEvent(`Sensitivity set to ${Math.round(clampedSensitivity * 100)}% (local only)`, 'system.sensitivity');
      return true;
    }

    try {
      await mcpService.setSensitivity(clampedSensitivity);
      setInteractionState(prev => ({ ...prev, sensitivity: clampedSensitivity }));
      addSystemEvent(`MCP Sensitivity set to ${Math.round(clampedSensitivity * 100)}%`, 'conversation.sensitivity');
      return true;
    } catch (error) {
      console.error('MCP Sensitivity failed:', error);
      // Still update local state
      setInteractionState(prev => ({ ...prev, sensitivity: clampedSensitivity }));
      addSystemEvent(`MCP Sensitivity failed, updated locally: ${error}`, 'system.error');
      return false;
    }
  }, [mcpService, addSystemEvent]);

  // Simplified participant methods (MCP doesn't handle Daily.co directly)
  const getParticipants = useCallback(() => {
    return {};
  }, []);

  const getAIParticipant = useCallback(() => {
    return null;
  }, []);

  // MCP tool information
  const getAvailableTools = useCallback(() => {
    return mcpService?.getAvailableTools() || [];
  }, [mcpService]);

  return {
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
  };
};