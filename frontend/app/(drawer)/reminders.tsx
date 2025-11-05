// app/(drawer)/reminders.tsx - FULL CODE WITH DRAWER TOGGLE
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useNavigation } from 'expo-router';
import { remindersStyles } from '../styles/remindersStyles';
import { useState, useEffect } from 'react';

// TODO: Replace with real data from backend
const MOCK_REMINDERS = [
  {
    id: '1',
    title: 'Take morning medication',
    type: 'medication',
    time: '08:00',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    isActive: true,
  },
  {
    id: '2',
    title: 'Evening walk',
    type: 'exercise',
    time: '18:30',
    days: ['Mon', 'Wed', 'Fri'],
    isActive: true,
  },
  {
    id: '3',
    title: 'Follow-up doctor appointment',
    type: 'appointment',
    time: '14:00',
    days: ['Fri'],
    isActive: false,
  },
];

export default function RemindersScreen() {
  const navigation = useNavigation();
  const [reminders, setReminders] = useState(MOCK_REMINDERS);
  const [newReminder, setNewReminder] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toggleDrawer = () => {
    // @ts-ignore - toggleDrawer exists but TypeScript might not recognize it
    navigation.toggleDrawer();
  };

  // TODO: Implement backend integration
  const fetchReminders = async () => {
    try {
      // const response = await api.get('/reminders');
      // setReminders(response.data);
      console.log('Fetching reminders from backend...');
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  };

  const createReminder = async () => {
    if (!newReminder.trim()) return;

    setIsLoading(true);
    try {
      // TODO: Connect to backend
      // await api.post('/reminders', { title: newReminder });

      const tempReminder = {
        id: Date.now().toString(),
        title: newReminder,
        type: 'custom',
        time: '12:00',
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        isActive: true,
      };

      setReminders(prev => [tempReminder, ...prev]);
      setNewReminder('');
      Alert.alert('Success', 'Reminder created!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create reminder');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleReminder = async (reminderId: string) => {
    // TODO: Update backend
    setReminders(prev =>
      prev.map(reminder =>
        reminder.id === reminderId
          ? { ...reminder, isActive: !reminder.isActive }
          : reminder
      )
    );
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  return (
    <ScrollView style={remindersStyles.container}>
      {/* Header with Drawer Toggle */}
      <View style={[remindersStyles.header, { flexDirection: 'row', alignItems: 'center' }]}>
        <TouchableOpacity
          style={{
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 20,
            backgroundColor: '#FFFFFF',
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 4,
            elevation: 3,
            marginRight: 16,
          }}
          onPress={toggleDrawer}
        >
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#3B82F6' }}>☰</Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={remindersStyles.title}>Health Reminders</Text>
        </View>

        {/* Spacer for balance */}
        <View style={{ width: 40 }} />
      </View>

      {/* Add New Reminder */}
      <View style={remindersStyles.card}>
        <Text style={remindersStyles.cardTitle}>Add New Reminder</Text>
        <View style={remindersStyles.inputRow}>
          <TextInput
            style={remindersStyles.input}
            placeholder="Enter reminder (e.g., 'Take medication at 8 AM')"
            value={newReminder}
            onChangeText={setNewReminder}
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity
            style={[
              remindersStyles.addButton,
              (!newReminder.trim() || isLoading) && remindersStyles.addButtonDisabled
            ]}
            onPress={createReminder}
            disabled={!newReminder.trim() || isLoading}
          >
            <Text style={remindersStyles.addButtonText}>
              {isLoading ? '...' : 'Add'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={remindersStyles.inputHint}>
          💡 Pro tip: Use AI suggestions from chat for better reminders
        </Text>
      </View>

      {/* Active Reminders */}
      <View style={remindersStyles.card}>
        <Text style={remindersStyles.cardTitle}>
          Active Reminders ({reminders.filter(r => r.isActive).length})
        </Text>

        {reminders.filter(r => r.isActive).length === 0 ? (
          <View style={remindersStyles.emptyState}>
            <Text style={remindersStyles.emptyIcon}>⏰</Text>
            <Text style={remindersStyles.emptyTitle}>No active reminders</Text>
            <Text style={remindersStyles.emptyText}>
              Create reminders above or get AI suggestions from chat
            </Text>
          </View>
        ) : (
          reminders
            .filter(reminder => reminder.isActive)
            .map(reminder => (
              <View key={reminder.id} style={remindersStyles.reminderItem}>
                <View style={remindersStyles.reminderContent}>
                  <Text style={remindersStyles.reminderTitle}>{reminder.title}</Text>
                  <View style={remindersStyles.reminderDetails}>
                    <Text style={remindersStyles.reminderTime}>🕒 {reminder.time}</Text>
                    <Text style={remindersStyles.reminderDays}>
                      {reminder.days.join(', ')}
                    </Text>
                  </View>
                  <Text style={remindersStyles.reminderType}>
                    Type: {reminder.type}
                  </Text>
                </View>
                <TouchableOpacity
                  style={remindersStyles.toggleButton}
                  onPress={() => toggleReminder(reminder.id)}
                >
                  <Text style={remindersStyles.toggleButtonText}>✓</Text>
                </TouchableOpacity>
              </View>
            ))
        )}
      </View>

      {/* Inactive Reminders */}
      {reminders.filter(r => !r.isActive).length > 0 && (
        <View style={remindersStyles.card}>
          <Text style={remindersStyles.cardTitle}>
            Completed Reminders
          </Text>
          {reminders
            .filter(reminder => !reminder.isActive)
            .map(reminder => (
              <View key={reminder.id} style={[
                remindersStyles.reminderItem,
                remindersStyles.reminderItemInactive
              ]}>
                <View style={remindersStyles.reminderContent}>
                  <Text style={remindersStyles.reminderTitleInactive}>
                    {reminder.title}
                  </Text>
                  <Text style={remindersStyles.reminderCompleted}>
                    ✅ Completed
                  </Text>
                </View>
                <TouchableOpacity
                  style={remindersStyles.toggleButtonInactive}
                  onPress={() => toggleReminder(reminder.id)}
                >
                  <Text style={remindersStyles.toggleButtonText}>↻</Text>
                </TouchableOpacity>
              </View>
            ))
          }
        </View>
      )}

      {/* Backend Integration Info */}
      <View style={[remindersStyles.card, remindersStyles.infoCard]}>
        <Text style={remindersStyles.infoText}>
          🔗 Backend Integration Needed:
        </Text>
        <Text style={remindersStyles.infoNote}>
          • POST /reminders - Create new reminder{"\n"}
          • GET /reminders - Fetch user reminders{"\n"}
          • PUT /reminders/:id - Update reminder status{"\n"}
          • DELETE /reminders/:id - Remove reminder
        </Text>
      </View>
    </ScrollView>
  );
}
