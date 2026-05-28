import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { useHostelDetails, useCreateBooking } from '../hooks/useHostels';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing, Typography, BorderRadius, Shadow } from '../utils/theme';
import type { RoomTypeRecord } from '../types/hostels';

type Props = NativeStackScreenProps<RootStackParamList, 'Booking'>;

const formatDate = (date: Date) => date.toISOString().split('T')[0];

const BookingScreen: React.FC<Props> = ({ route, navigation }) => {
  const { hostelId, roomTypeId } = route.params;
  const { profile } = useAuth();
  const { data: hostel, isLoading } = useHostelDetails(hostelId);
  const createBooking = useCreateBooking();

  const roomTypes = useMemo(() => (hostel?.room_types ?? []) as RoomTypeRecord[], [hostel?.room_types]);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string | undefined>(roomTypeId || roomTypes[0]?.id);
  const [checkInDate, setCheckInDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
  });
  const [checkOutDate, setCheckOutDate] = useState<Date>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 6);
    return date;
  });
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');

  useEffect(() => {
    if (!selectedRoomTypeId && roomTypes[0]?.id) {
      setSelectedRoomTypeId(roomTypes[0].id);
    }
  }, [roomTypes, selectedRoomTypeId]);

  const hasRooms = roomTypes.length > 0;

  const selectedRoom = useMemo(
    () => roomTypes.find((room) => room.id === selectedRoomTypeId) ?? roomTypes[0],
    [roomTypes, selectedRoomTypeId]
  );

  const totalAmount = useMemo(() => {
    if (!selectedRoom?.price_per_semester) return 0;
    return Number(selectedRoom.price_per_semester);
  }, [selectedRoom?.price_per_semester]);

  const closePicker = (field: 'checkIn' | 'checkOut') => {
    if (Platform.OS === 'ios') return;
    if (field === 'checkIn') {
      setShowCheckInPicker(false);
    } else {
      setShowCheckOutPicker(false);
    }
  };

  const handleCheckInChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (!date) {
      closePicker('checkIn');
      return;
    }

    setCheckInDate(date);

    if (date >= checkOutDate) {
      const next = new Date(date);
      next.setMonth(next.getMonth() + 6);
      setCheckOutDate(next);
    }

    closePicker('checkIn');
  };

  const handleCheckOutChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (!date) {
      closePicker('checkOut');
      return;
    }

    if (date <= checkInDate) {
      Alert.alert('Invalid dates', 'Check-out date must be after check-in date.');
      return;
    }

    setCheckOutDate(date);
    closePicker('checkOut');
  };

  const validateForm = () => {
    if (!profile?.id) {
      Alert.alert('Booking', 'You need to be signed in to place a booking.');
      return false;
    }
    if (!hasRooms || !selectedRoom) {
      Alert.alert('Booking', 'Please select a room type.');
      return false;
    }
    if (totalAmount <= 0) {
      Alert.alert('Booking', 'Selected room has no pricing information.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !hostel || !profile?.id || !selectedRoom?.id) {
      return;
    }

    try {
      const payload = {
        user_id: profile.id,
        hostel_id: hostel.id,
        room_type_id: selectedRoom.id,
        check_in_date: formatDate(checkInDate),
        check_out_date: formatDate(checkOutDate),
        total_amount: totalAmount,
        payment_status: 'pending',
        status: 'pending',
        payment_method: null,
        special_requests: specialRequests || null,
      };

      const response = await createBooking.mutateAsync(payload);
      Alert.alert('Booking requested', 'We\'ve shared your request with the hostel owner.');
      navigation.replace('Payment', {
        bookingId: response?.id,
        amount: totalAmount,
      });
    } catch (error: any) {
      Alert.alert('Booking failed', error.message ?? 'Unable to create booking.');
    }
  };

  if (isLoading || !hostel) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading hostel details…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Book {hostel.name}</Text>
          <Text style={styles.subtitle}>Secure your stay near UMaT campus.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Room Type</Text>
          {hasRooms ? (
            <View style={styles.roomList}>
              {roomTypes.map((room) => {
                const isSelected = room.id === selectedRoomTypeId;
                return (
                  <TouchableOpacity
                    key={room.id ?? room.name}
                    style={[styles.roomOption, isSelected && styles.roomOptionSelected]}
                    onPress={() => setSelectedRoomTypeId(room.id ?? undefined)}
                  >
                    <View style={styles.roomOptionHeader}>
                      <Text style={[styles.roomName, isSelected && styles.roomNameSelected]}>
                        {room.name}
                      </Text>
                      {typeof room.available_rooms === 'number' ? (
                        <Text style={styles.availability}>
                          {room.available_rooms} available
                        </Text>
                      ) : null}
                    </View>
                    <Text style={styles.roomPrice}>
                      GHS {Number(room.price_per_semester).toLocaleString('en-US')}
                    </Text>
                    {room.description ? (
                      <Text style={styles.roomDescription}>{room.description}</Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <Text style={styles.emptyNotice}>
              This hostel has not published room availability yet. Please check back later.
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stay Duration</Text>
          <View style={styles.dateRow}>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowCheckInPicker(true)}>
              <Text style={styles.dateLabel}>Check-in</Text>
              <Text style={styles.dateValue}>{formatDate(checkInDate)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowCheckOutPicker(true)}>
              <Text style={styles.dateLabel}>Check-out</Text>
              <Text style={styles.dateValue}>{formatDate(checkOutDate)}</Text>
            </TouchableOpacity>
          </View>
          {showCheckInPicker && (
            <DateTimePicker
              value={checkInDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={new Date()}
              onChange={handleCheckInChange}
            />
          )}
          {showCheckOutPicker && (
            <DateTimePicker
              value={checkOutDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={checkInDate}
              onChange={handleCheckOutChange}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Requests</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Let the owner know if you have special requirements"
            placeholderTextColor={Colors.text.tertiary}
            value={specialRequests}
            onChangeText={setSpecialRequests}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Room type</Text>
            <Text style={styles.summaryValue}>{selectedRoom?.name ?? 'Select a room'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total amount</Text>
            <Text style={styles.summaryValue}>GHS {totalAmount.toLocaleString('en-US')}</Text>
          </View>
          <Text style={styles.summaryNote}>
            Final confirmation will be shared by the hostel owner. Payment is required to secure the room.
          </Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={createBooking.isPending || !hasRooms}
      >
        <Text style={styles.submitButtonText}>
          {createBooking.isPending ? 'Submitting…' : 'Proceed to payment'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
  },
  loadingText: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.base,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing['3xl'],
    gap: Spacing.lg,
  },
  header: {
    gap: Spacing.xs,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  roomList: {
    gap: Spacing.md,
  },
  roomOption: {
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  roomOptionSelected: {
    borderColor: Colors.secondary,
    backgroundColor: Colors.background.accent,
  },
  roomOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  roomNameSelected: {
    color: Colors.primary,
  },
  availability: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  roomPrice: {
    fontSize: Typography.fontSize.base,
    color: Colors.secondary,
    fontWeight: Typography.fontWeight.bold,
  },
  roomDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  dateRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dateButton: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  dateLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
  },
  dateValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  textArea: {
    minHeight: 100,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    padding: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    textAlignVertical: 'top',
    backgroundColor: Colors.white,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  summaryTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  summaryValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  summaryNote: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  emptyNotice: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
});

export default BookingScreen;
