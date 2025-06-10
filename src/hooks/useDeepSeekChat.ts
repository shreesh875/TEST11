import { useState, useCallback } from 'react';
import DeepSeekService, { DeepSeekMessage } from '../services/deepSeekService';
import { ConversationMessage } from '../types/tavus';

export const useDeepSeekChat = (apiKey: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [deepSeekService] = useState(() => new DeepSeekService(apiKey));

  const sendMessage = useCallback(async (
    messages: ConversationMessage[],
    onResponse: (response: ConversationMessage) => void,
    onStreamChunk?: (chunk: string) => void
  ) => {
    setIsLoading(true);

    try {
      // Convert conversation messages to DeepSeek format
      const deepSeekMessages: DeepSeekMessage[] = [
        {
          role: 'system',
          content: `You are DeepSeek V3, an advanced AI assistant. When greeting users or introducing yourself, use one of these casual, engaging styles:

- "Hey there! 👋 Got a question about one of your favorite topics? Let's dive into something cool."
- "Welcome back! If you've just read a post, feel free to ask me anything about it—I'm here to help you go deeper."
- "👋 Welcome! I'm here to boost your streak and your brain. Ask away—what are you curious about today?"

You are helpful, harmless, and honest. You're part of a video chat application where users can also interact with an AI avatar through video. Keep your responses engaging and conversational, focusing on helping users explore topics they're curious about.`
        },
        ...messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }))
      ];

      if (onStreamChunk) {
        // Use streaming for real-time response
        let fullResponse = '';
        
        await deepSeekService.streamMessage(deepSeekMessages, (chunk) => {
          fullResponse += chunk;
          onStreamChunk(chunk);
        });

        // Create final response message
        const responseMessage: ConversationMessage = {
          id: Date.now().toString(),
          content: fullResponse,
          role: 'assistant',
          timestamp: new Date(),
        };

        onResponse(responseMessage);
      } else {
        // Use regular API call
        const responseText = await deepSeekService.sendMessage(deepSeekMessages);
        
        const responseMessage: ConversationMessage = {
          id: Date.now().toString(),
          content: responseText,
          role: 'assistant',
          timestamp: new Date(),
        };

        onResponse(responseMessage);
      }
    } catch (error) {
      console.error('Error getting DeepSeek response:', error);
      
      const errorMessage: ConversationMessage = {
        id: Date.now().toString(),
        content: 'Sorry, I encountered an error while processing your message. Please try again. (DeepSeek V3 via OpenRouter)',
        role: 'assistant',
        timestamp: new Date(),
      };

      onResponse(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [deepSeekService]);

  return {
    sendMessage,
    isLoading,
  };
};