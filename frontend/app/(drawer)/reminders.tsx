// app/(drawer)/reminders.tsx - REAL IMPLEMENTATION
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal, ActivityIndicator } from 'react-native';
import { useNavigation } from 'expo-router';
import { remindersStyles } from '../styles/remindersStyles';
import { useState, useEffect } from 'react';
import api from '../../api/client';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Reminder {
  id: string;
  title: string;
  description?: string;
  reminder_type: string;
  scheduled_time: string;
  scheduled_date?: string;
  days_of_week: string[];
  is_recurring: boolean;
  recurrence_pattern: string;
  is_active: boolean;
  is_completed: boolean;
  source: string;
  created_at: string;
}

interface AIReminderSuggestion {
  reminder_title: string;
  reminder_description: string;
  suggested_time: string;
  suggested_frequency: string;
  priority: string;
}

export default function RemindersScreen() {
  const navigation = useNavigation();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newReminder, setNewReminder] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AIReminderSuggestion[]>([]);
  const [showAiSuggestionModal, setShowAiSuggestionModal] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<AIReminderSuggestion | null>(null);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDrawer = () => {
    // @ts-ignore
    navigation.toggleDrawer();
  };

  const fetchReminders = async () => {
    try {
      const response = await api.get('/reminders');
      setReminders(response.data);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      Alert.alert('Error', 'Failed to load reminders');
    }
  };

  const fetchAiSuggestions = async () => {
    try {
      // This would be called from the chat component when AI provides suggestions
      // For now, we'll simulate it
      console.log('Fetching AI suggestions...');
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
    }
  };

  const createReminder = async (reminderData?: Partial<Reminder>) => {
    setIsLoading(true);
    try {
      const payload = reminderData || {
        title: newReminder,
        reminder_type: 'custom',
        scheduled_time: selectedTime.toTimeString().split(' ')[0],
        scheduled_date: new Date().toISOString().split('T')[0],
        days_of_week: selectedDays,
        is_recurring: isRecurring,
        recurrence_pattern: isRecurring ? 'weekly' : 'daily'
      };

      await api.post('/reminders', payload);

      setNewReminder('');
      setSelectedDays([]);
      setIsRecurring(false);
      setShowAddModal(false);

      await fetchReminders();
      Alert.alert('Success', 'Reminder created!');
    } catch (error) {
      console.error('Error creating reminder:', error);
      Alert.alert('Error', 'Failed to create reminder');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleReminder = async (reminderId: string) => {
    try {
      await api.post(`/reminders/${reminderId}/toggle`);
      await fetchReminders();
    } catch (error) {
      console.error('Error toggling reminder:', error);
      Alert.alert('Error', 'Failed to update reminder');
    }
  };

  const completeReminder = async (reminderId: string) => {
    try {
      await api.post(`/reminders/${reminderId}/complete`);
      await fetchReminders();
    } catch (error) {
      console.error('Error completing reminder:', error);
      Alert.alert('Error', 'Failed to complete reminder');
    }
  };

  const deleteReminder = async (reminderId: string) => {
    try {
      await api.delete(`/reminders/${reminderId}`);
      await fetchReminders();
    } catch (error) {
      console.error('Error deleting reminder:', error);
      Alert.alert('Error', 'Failed to delete reminder');
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleAiSuggestionSelect = (suggestion: AIReminderSuggestion) => {
    setSelectedSuggestion(suggestion);
    setShowAiSuggestionModal(true);
  };

  const createReminderFromSuggestion = () => {
    if (!selectedSuggestion) return;

    const reminderData = {
      title: selectedSuggestion.reminder_title,
      description: selectedSuggestion.reminder_description,
      reminder_type: 'ai_suggestion',
      scheduled_time: selectedSuggestion.suggested_time,
      scheduled_date: new Date().toISOString().split('T')[0],
      days_of_week: selectedSuggestion.suggested_frequency === 'daily' ? daysOfWeek : [],
      is_recurring: selectedSuggestion.suggested_frequency !== 'once',
      recurrence_pattern: selectedSuggestion.suggested_frequency === 'daily' ? 'daily' : 'weekly',
      source: 'ai_suggestion'
    };

    createReminder(reminderData);
    setShowAiSuggestionModal(false);
    setSelectedSuggestion(null);
  };

  useEffect(() => {
    fetchReminders();
    fetchAiSuggestions();
  }, []);

  return (
    <ScrollView style={remindersStyles.container}>
      {/* Header */}
      <View style={[remindersStyles.header, { flexDirection: 'row', alignItems: 'center' }]}>
        <TouchableOpacity style={remindersStyles.menuButton} onPress={toggleDrawer}>
          <Text style={remindersStyles.menuText}>☰</Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={remindersStyles.title}>Health Reminders</Text>
        </View>

        <TouchableOpacity
          style={remindersStyles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={remindersStyles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Add Reminder Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
      >
        <View style={remindersStyles.modalContainer}>
          <View style={remindersStyles.modalContent}>
            <Text style={remindersStyles.modalTitle}>Add New Reminder</Text>

            <TextInput
              style={remindersStyles.input}
              placeholder="Reminder title"
              value={newReminder}
              onChangeText={setNewReminder}
              placeholderTextColor="#9CA3AF"
            />

            <Text style={remindersStyles.label}>Time:</Text>
            <DateTimePicker
              value={selectedTime}
              mode="time"
              display="spinner"
              onChange={(event, date) => date && setSelectedTime(date)}
            />

            <View style={remindersStyles.toggleRow}>
              <Text style={remindersStyles.label}>Recurring:</Text>
              <TouchableOpacity
                style={[
                  remindersStyles.toggle,
                  isRecurring && remindersStyles.toggleActive
                ]}
                onPress={() => setIsRecurring(!isRecurring)}
              >
                <Text style={remindersStyles.toggleText}>
                  {isRecurring ? 'ON' : 'OFF'}
                </Text>
              </TouchableOpacity>
            </View>

            {isRecurring && (
              <>
                <Text style={remindersStyles.label}>Repeat on:</Text>
                <View style={remindersStyles.daysContainer}>
                  {daysOfWeek.map(day => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        remindersStyles.dayButton,
                        selectedDays.includes(day) && remindersStyles.dayButtonActive
                      ]}
                      onPress={() => toggleDay(day)}
                    >
                      <Text style={[
                        remindersStyles.dayButtonText,
                        selectedDays.includes(day) && remindersStyles.dayButtonTextActive
                      ]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <View style={remindersStyles.modalButtons}>
              <TouchableOpacity
                style={[remindersStyles.modalButton, remindersStyles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={remindersStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  remindersStyles.modalButton,
                  remindersStyles.saveButton,
                  (!newReminder.trim() || isLoading) && remindersStyles.saveButtonDisabled
                ]}
                onPress={() => createReminder()}
                disabled={!newReminder.trim() || isLoading}
              >
                <Text style={remindersStyles.saveButtonText}>
                  {isLoading ? '...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* AI Suggestions Modal */}
      <Modal
        visible={showAiSuggestionModal}
        animationType="slide"
        transparent={true}
      >
        <View style={remindersStyles.modalContainer}>
          <View style={remindersStyles.modalContent}>
            <Text style={remindersStyles.modalTitle}>AI Reminder Suggestion</Text>

            {selectedSuggestion && (
              <>
                <Text style={remindersStyles.suggestionTitle}>
                  {selectedSuggestion.reminder_title}
                </Text>
                <Text style={remindersStyles.suggestionDescription}>
                  {selectedSuggestion.reminder_description}
                </Text>
                <Text style={remindersStyles.suggestionTime}>
                  Suggested time: {selectedSuggestion.suggested_time}
                </Text>
                <Text style={remindersStyles.suggestionFrequency}>
                  Frequency: {selectedSuggestion.suggested_frequency}
                </Text>
              </>
            )}

            <View style={remindersStyles.modalButtons}>
              <TouchableOpacity
                style={[remindersStyles.modalButton, remindersStyles.cancelButton]}
                onPress={() => setShowAiSuggestionModal(false)}
              >
                <Text style={remindersStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[remindersStyles.modalButton, remindersStyles.saveButton]}
                onPress={createReminderFromSuggestion}
              >
                <Text style={remindersStyles.saveButtonText}>Add to Reminders</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Active Reminders */}
      <View style={remindersStyles.card}>
        <Text style={remindersStyles.cardTitle}>
          Active Reminders ({reminders.filter(r => r.is_active && !r.is_completed).length})
        </Text>

        {reminders.filter(r => r.is_active && !r.is_completed).length === 0 ? (
          <View style={remindersStyles.emptyState}>
            <Text style={remindersStyles.emptyIcon}>⏰</Text>
            <Text style={remindersStyles.emptyTitle}>No active reminders</Text>
            <Text style={remindersStyles.emptyText}>
              Create reminders above or get AI suggestions from chat
            </Text>
          </View>
        ) : (
          reminders
            .filter(reminder => reminder.is_active && !reminder.is_completed)
            .map(reminder => (
              <View key={reminder.id} style={remindersStyles.reminderItem}>
                <View style={remindersStyles.reminderContent}>
                  <Text style={remindersStyles.reminderTitle}>{reminder.title}</Text>
                  {reminder.description && (
                    <Text style={remindersStyles.reminderDescription}>
                      {reminder.description}
                    </Text>
                  )}
                  <View style={remindersStyles.reminderDetails}>
                    <Text style={remindersStyles.reminderTime}>
                      🕒 {reminder.scheduled_time}
                    </Text>
                    {reminder.is_recurring && reminder.days_of_week.length > 0 && (
                      <Text style={remindersStyles.reminderDays}>
                        {reminder.days_of_week.join(', ')}
                      </Text>
                    )}
                  </View>
                  <Text style={remindersStyles.reminderType}>
                    Type: {reminder.reminder_type}
                  </Text>
                </View>
                <View style={remindersStyles.reminderActions}>
                  <TouchableOpacity
                    style={remindersStyles.completeButton}
                    onPress={() => completeReminder(reminder.id)}
                  >
                    <Text style={remindersStyles.completeButtonText}>✓</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={remindersStyles.deleteButton}
                    onPress={() => deleteReminder(reminder.id)}
                  >
                    <Text style={remindersStyles.deleteButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
        )}
      </View>

      {/* Completed Reminders */}
      {reminders.filter(r => r.is_completed).length > 0 && (
        <View style={remindersStyles.card}>
          <Text style={remindersStyles.cardTitle}>
            Completed Reminders ({reminders.filter(r => r.is_completed).length})
          </Text>
          {reminders
            .filter(reminder => reminder.is_completed)
            .map(reminder => (
              <View key={reminder.id} style={[
                remindersStyles.reminderItem,
                remindersStyles.reminderItemCompleted
              ]}>
                <View style={remindersStyles.reminderContent}>
                  <Text style={remindersStyles.reminderTitleCompleted}>
                    {reminder.title}
                  </Text>
                  <Text style={remindersStyles.reminderCompleted}>
                    ✅ Completed on {new Date(reminder.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <TouchableOpacity
                  style={remindersStyles.deleteButton}
                  onPress={() => deleteReminder(reminder.id)}
                >
                  <Text style={remindersStyles.deleteButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))
          }
        </View>
      )}
    </ScrollView>
  );
}
