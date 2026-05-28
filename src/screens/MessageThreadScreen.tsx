import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import {
  useConversationSubscription,
  useMessagesQuery,
  useSendMessageMutation,
} from '../hooks/useMessages';
import { Colors, Spacing, Typography, BorderRadius } from '../utils/theme';
import { formatDateTime } from '../utils/format';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'MessageThread'>;

const MessageThreadScreen: React.FC<Props> = ({ route, navigation }) => {
  const { conversationId } = route.params;
  const { user } = useAuth();
  const userId = user?.id;
  const [inputValue, setInputValue] = useState('');
  const { data: messages = [], isLoading, refetch } = useMessagesQuery(conversationId);
  const sendMessage = useSendMessageMutation();
  const listRef = useRef<FlatList<any>>(null);

  useConversationSubscription(conversationId, userId ?? undefined);

  useEffect(() => {
    refetch();
  }, [conversationId, refetch]);

  useEffect(() => {
    navigation.setOptions({ title: route.params.recipientName ?? 'Conversation' });
  }, [navigation, route.params.recipientName]);

  useEffect(() => {
    if (messages.length && listRef.current) {
      listRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = useCallback(() => {
    if (!userId) return;
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    sendMessage.mutate(
      { conversationId, senderId: userId, content: trimmed },
      {
        onSuccess: () => {
          setInputValue('');
        },
      }
    );
  }, [conversationId, inputValue, sendMessage, userId]);

  const renderMessage = ({ item }: { item: any }) => {
    const isMine = item.sender_id === userId;
    return (
      <View style={[styles.messageRow, isMine ? styles.messageRowMine : styles.messageRowOther]}>
        <View style={[styles.messageBubble, isMine ? styles.messageBubbleMine : styles.messageBubbleOther]}>
          <Text style={[styles.messageText, isMine ? styles.messageTextMine : styles.messageTextOther]}>
            {item.content}
          </Text>
          <Text style={[styles.messageTimestamp, isMine ? styles.messageTimestampMine : styles.messageTimestampOther]}>
            {formatDateTime(item.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {isLoading && !messages.length ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          />
        )}
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            placeholder="Write a message"
            placeholderTextColor={Colors.text.tertiary}
            value={inputValue}
            onChangeText={setInputValue}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputValue.trim() || sendMessage.isPending) && styles.sendButtonDisabled]}
            onPress={handleSend}
            activeOpacity={0.85}
            disabled={!inputValue.trim() || sendMessage.isPending}
          >
            {sendMessage.isPending ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.sendButtonText}>Send</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  flex: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageList: {
    padding: Spacing.lg,
    paddingBottom: Spacing['3xl'],
    gap: Spacing.sm,
  },
  messageRow: {
    marginBottom: Spacing.sm,
    flexDirection: 'row',
  },
  messageRowMine: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  messageBubbleMine: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: BorderRadius.sm,
  },
  messageBubbleOther: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: BorderRadius.sm,
  },
  messageText: {
    fontSize: Typography.fontSize.base,
  },
  messageTextMine: {
    color: Colors.white,
  },
  messageTextOther: {
    color: Colors.text.primary,
  },
  messageTimestamp: {
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.xs,
    alignSelf: 'flex-end',
  },
  messageTimestampMine: {
    color: 'rgba(255,255,255,0.7)',
  },
  messageTimestampOther: {
    color: Colors.text.secondary,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderTopColor: Colors.gray[200],
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.background.secondary,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.gray[300],
  },
  sendButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
});

export default MessageThreadScreen;
