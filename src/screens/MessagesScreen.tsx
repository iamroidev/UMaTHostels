import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useConversationsQuery } from '../hooks/useMessages';
import { Colors, Spacing, Typography, BorderRadius, Shadow } from '../utils/theme';
import { formatDateTime } from '../utils/format';
import type { RootStackParamList } from '../types';

const getInitials = (value?: string | null) => {
  if (!value) return 'HN';
  const parts = value.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
};

type Props = NativeStackScreenProps<RootStackParamList, 'Messages'>;

const MessagesScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const userId = user?.id;
  const { data = [], isLoading, isRefetching, refetch } = useConversationsQuery(userId || undefined);

  const conversations = useMemo(() => {
    const items = (Array.isArray(data) ? data : []) as Array<Record<string, any>>;
    return items.sort((a, b) => {
      const aDate = new Date(a.updated_at ?? 0).getTime();
      const bDate = new Date(b.updated_at ?? 0).getTime();
      return bDate - aDate;
    });
  }, [data]);

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No messages yet</Text>
      <Text style={styles.emptySubtitle}>
        Start a conversation with a hostel owner from a hostel detail page.
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: Record<string, any> }) => {
    const isUserOne = item.user1_id === userId;
    const recipientProfile = isUserOne ? item.user2 : item.user1;
    const recipientId = isUserOne ? item.user2_id : item.user1_id;
    const hostelName = item.hostel?.name;
    const initials = getInitials(recipientProfile?.full_name ?? hostelName ?? 'Hostel');
    const title = recipientProfile?.full_name ?? hostelName ?? 'Hostel Conversation';
    const subtitle = hostelName ? `Hostel: ${hostelName}` : 'Tap to view conversation';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.88}
        onPress={() =>
          navigation.navigate('MessageThread', {
            conversationId: item.id,
            recipientId,
            hostelId: item.hostel_id ?? undefined,
            recipientName: title,
          })
        }
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.timestamp}>{formatDateTime(item.updated_at)}</Text>
          </View>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLoading && !conversations.length ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={conversations.length ? styles.listContent : styles.emptyContainer}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing['3xl'],
    gap: Spacing.md,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    color: Colors.white,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  cardBody: {
    flex: 1,
    gap: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  timestamp: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
});

export default MessagesScreen;
