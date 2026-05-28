import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createConversation,
  getConversations,
  getMessagesForConversation,
  sendMessage,
  subscribeToConversation,
} from '../services/supabase';

export const useConversationsQuery = (userId?: string) => {
  return useQuery({
    enabled: Boolean(userId),
    queryKey: ['conversations', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await getConversations(userId);
      if (error) throw error;
      return data ?? [];
    },
  });
};

export const useMessagesQuery = (conversationId?: string) => {
  return useQuery({
    enabled: Boolean(conversationId),
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const { data, error } = await getMessagesForConversation(conversationId);
      if (error) throw error;
      return (data ?? []).sort((a, b) => {
        const aDate = new Date(a.created_at ?? 0).getTime();
        const bDate = new Date(b.created_at ?? 0).getTime();
        return aDate - bDate;
      });
    },
  });
};

export const useSendMessageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversationId, senderId, content }: { conversationId: string; senderId: string; content: string }) => {
      const { data, error } = await sendMessage(conversationId, senderId, content.trim());
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations', variables.senderId] });
    },
    onError: (error: any) => {
      Alert.alert('Message failed', error.message || 'Unable to send message at the moment.');
    },
  });
};

export const useConversationSubscription = (conversationId?: string, userId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    const channel = subscribeToConversation(conversationId, () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['conversations', userId] });
      }
    });

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [conversationId, queryClient, userId]);
};

export const useStartConversationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, recipientId, hostelId }: { userId: string; recipientId: string; hostelId?: string }) => {
      const { data, error } = await createConversation(userId, recipientId, hostelId);
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversations', variables.userId] });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ['messages', data.id] });
      }
    },
    onError: (error: any) => {
      Alert.alert('Conversation error', error.message || 'Unable to start conversation.');
    },
  });
};
