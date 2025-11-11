// app/(drawer)/index.tsx - COMPLETE FIXED VERSION
import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, SafeAreaView,
  ActivityIndicator, ScrollView, Alert, Modal
} from 'react-native';
import { router, useNavigation } from 'expo-router';
import { chatStyles } from '../styles/chatStyles';
import api from '../../api/client';
import { usePatientStore } from '../../hooks/usePatientStore';
import { useChatStore, ChatMessage } from '../../hooks/useChatStore';

interface AIReminderSuggestion {
  reminder_title: string;
  reminder_description: string;
  suggested_time: string;
  suggested_frequency: string;
  priority: string;
}

interface CustomReminderData {
  title: string;
  description: string;
  scheduled_time: string;
  days_of_week: string[];
  is_recurring: boolean;
  recurrence_pattern: string;
}

export default function ChatIntroScreen() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReminderPopup, setShowReminderPopup] = useState(false);
  const [aiReminderSuggestions, setAiReminderSuggestions] = useState<AIReminderSuggestion[]>([]);
  const [customReminders, setCustomReminders] = useState<{ [key: number]: CustomReminderData }>({});
  const [tempTime, setTempTime] = useState<{ [key: number]: string }>({});

  // Use chat store for persistence
  const {
    currentSession,
    addMessage,
    clearCurrentSession,
    isLoading: chatLoading
  } = useChatStore();

  // Get patient profile from store
  const {
    patientProfile,
    getPatientContext,
    fetchPatientProfile,
    isLoading: patientLoading,
    error: patientError
  } = usePatientStore();

  const navigation = useNavigation();

  // Load patient profile on component mount
  useEffect(() => {
    const loadPatientData = async () => {
      try {
        await fetchPatientProfile('example');
      } catch (error) {
        console.error('Failed to load patient data:', error);
      }
    };

    loadPatientData();
  }, []);

  const getPatientPayload = () => {
    const patientContext = getPatientContext();

    let age = patientProfile?.age || 30;
    if (!patientProfile?.age && patientProfile?.birth_date) {
      const birthDate = new Date(patientProfile.birth_date);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
    }

    let gender = patientProfile?.gender?.toLowerCase() || 'female';
    if (gender.includes('male')) gender = 'male';
    else if (gender.includes('female')) gender = 'female';

    return {
      age: age,
      sex: gender,
      symptoms: message.trim(),
      meds: patientContext.medications,
      conditions: patientContext.conditions,
      duration: "unknown",
      patient_id: "example"
    };
  };

  const send = async () => {
    const text = message.trim();
    if (!text) {
      Alert.alert('Empty Message', 'Please describe your symptoms.');
      return;
    }

    if (loading) return;

    setLoading(true);
    const patientContext = getPatientContext();

    try {
      const payload = getPatientPayload();
      console.log('Sending payload with patient data:', payload);

      // Step 1: Triage assessment
      const triageResponse = await api.post('/triage', payload);
      const triage = triageResponse.data;

      if (triage.risk === 'emergency') {
        const emergencyResponse = {
          emergency: true,
          notice: 'Based on your symptoms and medical history, this appears to be a potential emergency. Please call 911 or go to the nearest emergency room immediately.'
        };

        addMessage(text, emergencyResponse, text, patientContext);
        setLoading(false);
        setMessage('');
        return;
      }

      // Step 2: Get personalized advice
      const adviceResponse = await api.post('/ehr-advice', payload);

      // Save to persistent store
      addMessage(text, adviceResponse.data, text, patientContext);

      // Check for AI reminder suggestions
      if (adviceResponse.data.ai_reminder_suggestions &&
        adviceResponse.data.ai_reminder_suggestions.length > 0) {

        // Initialize custom reminders with AI suggestions
        const initialCustomReminders: { [key: number]: CustomReminderData } = {};
        const initialTempTime: { [key: number]: string } = {};

        adviceResponse.data.ai_reminder_suggestions.forEach((suggestion: AIReminderSuggestion, index: number) => {
          initialCustomReminders[index] = {
            title: suggestion.reminder_title,
            description: suggestion.reminder_description,
            scheduled_time: suggestion.suggested_time,
            days_of_week: suggestion.suggested_frequency === 'daily' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : [],
            is_recurring: suggestion.suggested_frequency !== 'once',
            recurrence_pattern: suggestion.suggested_frequency === 'daily' ? 'daily' : 'weekly'
          };
          initialTempTime[index] = suggestion.suggested_time;
        });

        setAiReminderSuggestions(adviceResponse.data.ai_reminder_suggestions);
        setCustomReminders(initialCustomReminders);
        setTempTime(initialTempTime);
        setShowReminderPopup(true);
      }

      setMessage('');

    } catch (error: any) {
      console.error('API Error:', error);

      let errorMessage = 'Something went wrong. Please try again.';
      if (error.response?.status === 401) {
        Alert.alert('Session Expired', 'Please login again');
        router.push('/auth/login');
        return;
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server is temporarily unavailable. Please try again later.';
      }

      const errorResponse = { error: errorMessage };
      addMessage(text, errorResponse, text, patientContext);

    } finally {
      setLoading(false);
      setMessage('');
    }
  };

  const handleManualTimeChange = (text: string, index: number) => {
    // Basic time format validation (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

    setTempTime(prev => ({
      ...prev,
      [index]: text
    }));

    if (timeRegex.test(text)) {
      setCustomReminders(prev => ({
        ...prev,
        [index]: {
          ...prev[index],
          scheduled_time: text
        }
      }));
    }
  };

  const toggleDay = (index: number, day: string) => {
    setCustomReminders(prev => {
      const currentReminder = prev[index];
      const currentDays = currentReminder.days_of_week || [];

      const newDays = currentDays.includes(day)
        ? currentDays.filter(d => d !== day)
        : [...currentDays, day];

      return {
        ...prev,
        [index]: {
          ...currentReminder,
          days_of_week: newDays,
          is_recurring: newDays.length > 0 || currentReminder.is_recurring,
          recurrence_pattern: newDays.length > 0 ? 'weekly' : 'daily'
        }
      };
    });
  };

  const handleAddReminder = async (index: number) => {
    try {
      const suggestion = aiReminderSuggestions[index];
      const customData = customReminders[index];

      if (!suggestion || !customData) {
        Alert.alert('Error', 'Reminder data not found');
        return false;
      }

      console.log('🔄 Adding reminder:', { suggestion, customData });

      // Validate required fields
      if (!customData.title.trim()) {
        Alert.alert('Error', 'Reminder title is required');
        return false;
      }

      // Validate time format
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(customData.scheduled_time)) {
        Alert.alert('Error', 'Please enter a valid time in HH:MM format (e.g., 14:30)');
        return false;
      }

      // FIX: Convert time to proper backend format (SIMPLE FIX)
      const [hours, minutes] = customData.scheduled_time.split(':');
      const backendTimeFormat = `${hours}:${minutes}:00.000Z`; // Simple format

      // Ensure days_of_week has proper format
      const formattedDays = customData.days_of_week.map(day => day.toString());

      const reminderData = {
        title: customData.title.trim(),
        description: customData.description || '',
        reminder_type: 'custom',
        scheduled_time: backendTimeFormat, // Use simple format
        scheduled_date: new Date().toISOString().split('T')[0],
        days_of_week: formattedDays,
        is_recurring: customData.is_recurring || false,
        recurrence_pattern: customData.recurrence_pattern || 'none',
        source: 'ai_suggestion',
        is_active: true,
        ai_suggestion_context: `AI suggested reminder for: ${customData.title}`
      };

      console.log('📤 Sending reminder data to backend:', JSON.stringify(reminderData, null, 2));

      // Make API call
      const response = await api.post('/reminders', reminderData);

      if (response.status === 200 || response.status === 201) {
        console.log('✅ Reminder added successfully:', response.data);

        // Remove the added suggestion
        const newSuggestions = [...aiReminderSuggestions];
        const newCustomReminders = { ...customReminders };
        const newTempTime = { ...tempTime };

        newSuggestions.splice(index, 1);
        delete newCustomReminders[index];
        delete newTempTime[index];

        setAiReminderSuggestions(newSuggestions);
        setCustomReminders(newCustomReminders);
        setTempTime(newTempTime);

        if (newSuggestions.length === 0) {
          setShowReminderPopup(false);
          Alert.alert('Success', 'All reminders added successfully!');
        } else {
          Alert.alert('Success', 'Reminder added to your list!');
        }

        return true;
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }

    } catch (error: any) {
      console.error('❌ Error adding reminder:', error);

      // ENHANCED ERROR LOGGING - Show exact validation errors
      if (error.response?.data?.detail) {
        console.error('📋 Backend validation errors:', error.response.data.detail);

        // Log each validation error in detail
        const validationErrors = error.response.data.detail;
        if (Array.isArray(validationErrors)) {
          validationErrors.forEach((err, idx) => {
            console.error(`Validation Error ${idx + 1}:`, {
              location: err.loc,
              message: err.msg,
              type: err.type
            });
          });

          const errorMessages = validationErrors.map((err: any) =>
            `${err.loc?.join('.')}: ${err.msg} (${err.type})`
          ).join('\n\n');
          Alert.alert('Validation Error', errorMessages);
        } else {
          console.error('Non-array validation error:', validationErrors);
          Alert.alert('Error', JSON.stringify(validationErrors, null, 2));
        }
      } else {
        console.error('No detailed error response:', error.response);
        Alert.alert('Error', `Failed to add reminder: ${error.response?.data?.message || error.message}`);
      }
      return false;
    }
  };

  const handleAddAllReminders = async () => {
    try {
      console.log('🔄 Starting to add all reminders...');

      // Create a copy of the current indices to process
      const indicesToProcess = [...aiReminderSuggestions.keys()];
      let successCount = 0;
      let errorCount = 0;

      // Process reminders sequentially to avoid race conditions
      for (let i = 0; i < indicesToProcess.length; i++) {
        const index = indicesToProcess[i];
        try {
          console.log(`📝 Processing reminder ${i + 1}/${indicesToProcess.length}`);
          const success = await handleAddReminder(index);
          if (success) {
            successCount++;
          } else {
            errorCount++;
          }

          // Small delay between requests
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`❌ Failed to add reminder at index ${index}:`, error);
          errorCount++;
        }
      }

      console.log(`✅ Finished processing: ${successCount} successful, ${errorCount} failed`);

      // Show final summary
      if (successCount > 0) {
        Alert.alert(
          'Success',
          `${successCount} reminder(s) added successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`
        );
      } else {
        Alert.alert('Error', 'Failed to add any reminders. Please try adding them individually.');
      }

      // Close popup if all processed
      if (successCount + errorCount === indicesToProcess.length) {
        setShowReminderPopup(false);
      }

    } catch (error) {
      console.error('❌ Error in handleAddAllReminders:', error);
      Alert.alert('Error', 'Failed to process reminders. Please try again.');
    }
  };

  const formatTimeDisplay = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString;
    }
  };

  const renderChatMessage = (chat: ChatMessage) => (
    <View key={chat.id} style={chatStyles.chatBubble}>
      {/* User Message */}
      <View style={chatStyles.userBubble}>
        <Text style={chatStyles.userText}>{chat.userMessage}</Text>
      </View>

      {/* AI Response */}
      <View style={chatStyles.aiBubble}>
        {chat.aiResponse.emergency && (
          <View style={[chatStyles.card, chatStyles.emergencyCard]}>
            <Text style={chatStyles.emergencyTitle}>🚨 Emergency Alert</Text>
            <Text style={chatStyles.emergencyText}>{chat.aiResponse.notice}</Text>
          </View>
        )}

        {chat.aiResponse.advice && (
          <View style={chatStyles.adviceContainer}>
            <Text style={chatStyles.adviceTitle}>At-home steps</Text>
            {chat.aiResponse.advice.map((a, idx) => (
              <View key={idx} style={chatStyles.adviceItem}>
                <Text style={chatStyles.adviceStep}>{a.step}</Text>
                <Text style={chatStyles.adviceDetails}>{a.details}</Text>
              </View>
            ))}
          </View>
        )}

        {chat.aiResponse.error && (
          <View style={[chatStyles.card, chatStyles.errorCard]}>
            <Text style={chatStyles.errorText}>{chat.aiResponse.error}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={chatStyles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={chatStyles.container}
      >
        {/* Header */}
        <View style={chatStyles.headerRow}>
          <TouchableOpacity
            style={chatStyles.menuButton}
            onPress={() => navigation.dispatch({ type: 'OPEN_DRAWER' } as any)}
          >
            <Text style={chatStyles.menuText}>☰</Text>
          </TouchableOpacity>

          <Text style={chatStyles.title}>AI Doctor App</Text>

          {/* Clear Chat Button */}
          <TouchableOpacity
            style={chatStyles.clearButton}
            onPress={clearCurrentSession}
          >
            <Text style={chatStyles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {/* Chat History */}
        <ScrollView
          style={chatStyles.scrollView}
          contentContainerStyle={chatStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {currentSession.length === 0 && (
            <View style={chatStyles.welcomeCard}>
              <Text style={chatStyles.welcomeTitle}>Welcome to AI Doctor</Text>
              <Text style={chatStyles.welcomeText}>
                Describe your symptoms and get personalized medical advice based on your health profile.
              </Text>
            </View>
          )}

          {currentSession.map(renderChatMessage)}

          {loading && (
            <View style={[chatStyles.card, chatStyles.loadingCard]}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={chatStyles.loadingText}>Analyzing your symptoms...</Text>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={chatStyles.inputBar}>
          <TextInput
            style={[
              chatStyles.input,
              !patientProfile && chatStyles.inputWarning
            ]}
            placeholder={
              patientProfile
                ? "Describe your symptoms..."
                : "Describe symptoms (profile not loaded)..."
            }
            value={message}
            onChangeText={setMessage}
            placeholderTextColor={patientProfile ? "#9AA5B1" : "#F59E0B"}
            editable={!loading}
            returnKeyType="send"
            onSubmitEditing={send}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              chatStyles.sendBtn,
              loading && chatStyles.sendBtnDisabled,
              !patientProfile && chatStyles.sendBtnWarning
            ]}
            onPress={send}
            disabled={loading || !message.trim()}
          >
            <Text style={chatStyles.sendBtnText}>
              {loading ? '...' : 'Send'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* AI Reminder Suggestions Popup - WORKING VERSION */}
        <Modal
          visible={showReminderPopup}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowReminderPopup(false)}
        >
          <View style={chatStyles.reminderPopup}>
            <View style={chatStyles.reminderPopupContent}>
              <Text style={chatStyles.reminderPopupTitle}>
                💡 AI Reminder Suggestions
              </Text>
              <Text style={chatStyles.reminderPopupSubtitle}>
                Based on your symptoms, here are some helpful reminders. Customize them below:
              </Text>

              <ScrollView style={chatStyles.reminderSuggestionsList}>
                {aiReminderSuggestions.map((suggestion, index) => {
                  const customData = customReminders[index];
                  if (!customData) return null;

                  return (
                    <View key={index} style={chatStyles.reminderSuggestionItem}>
                      <View style={chatStyles.reminderSuggestionContent}>
                        <Text style={chatStyles.reminderSuggestionTitle}>
                          {customData.title}
                        </Text>
                        <Text style={chatStyles.reminderSuggestionDesc}>
                          {customData.description}
                        </Text>

                        {/* Time Selection - SIMPLE TEXT INPUT */}
                        <View style={chatStyles.timeSelectionContainer}>
                          <Text style={chatStyles.timeSelectionLabel}>Time (24-hour format):</Text>
                          <TextInput
                            style={chatStyles.timeInput}
                            value={tempTime[index] || customData.scheduled_time}
                            onChangeText={(text) => handleManualTimeChange(text, index)}
                            placeholder="14:30"
                            keyboardType="numbers-and-punctuation"
                            maxLength={5}
                          />
                          <Text style={chatStyles.frequencyText}>
                            Current: {tempTime[index] || customData.scheduled_time} •
                            Display: {formatTimeDisplay(tempTime[index] || customData.scheduled_time)}
                          </Text>
                        </View>

                        {/* Days Selection */}
                        <View style={chatStyles.timeSelectionContainer}>
                          <Text style={chatStyles.timeSelectionLabel}>Repeat on:</Text>
                          <View style={chatStyles.daysContainer}>
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                              <TouchableOpacity
                                key={day}
                                style={[
                                  chatStyles.dayButton,
                                  customData.days_of_week.includes(day) && chatStyles.dayButtonActive
                                ]}
                                onPress={() => toggleDay(index, day)}
                              >
                                <Text style={[
                                  chatStyles.dayButtonText,
                                  customData.days_of_week.includes(day) && chatStyles.dayButtonTextActive
                                ]}>
                                  {day}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                          <Text style={chatStyles.frequencyText}>
                            {customData.days_of_week.length > 0 ? 'Weekly' : 'Once'} • {customData.is_recurring ? 'Recurring' : 'One-time'}
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={chatStyles.reminderAddButton}
                        onPress={() => handleAddReminder(index)}
                      >
                        <Text style={chatStyles.reminderAddButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>

              <View style={chatStyles.reminderPopupActions}>
                <TouchableOpacity
                  style={[chatStyles.reminderPopupButton, chatStyles.reminderPopupButtonSecondary]}
                  onPress={() => {
                    setShowReminderPopup(false);
                    setAiReminderSuggestions([]);
                    setCustomReminders({});
                    setTempTime({});
                  }}
                >
                  <Text style={chatStyles.reminderPopupButtonTextSecondary}>Skip All</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={chatStyles.reminderPopupButton}
                  onPress={handleAddAllReminders}
                >
                  <Text style={chatStyles.reminderPopupButtonText}>Add All</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
