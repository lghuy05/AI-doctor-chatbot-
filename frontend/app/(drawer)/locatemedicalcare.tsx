import { View, Platform, ScrollView, KeyboardAvoidingView, ActivityIndicator, SafeAreaView, Text, TouchableOpacity, TextInput } from 'react-native'
import { router, useNavigation } from 'expo-router'
import { useState } from 'react'
import { locateMedicalCareStyles } from '../styles/locatemedicalcare';

export default function LocateMedicalCare() {
  const navigation = useNavigation();
  const [isLoading, setisLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const send = () => {
    console.log("Pressed");
  }
  return (
    <SafeAreaView style={locateMedicalCareStyles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={locateMedicalCareStyles.container}
      >
        <View style={locateMedicalCareStyles.headerRow}>
          <TouchableOpacity
            style={locateMedicalCareStyles.menuButton}
            onPress={() => navigation.dispatch({ type: 'OPEN_DRAWER' } as any)}
          >
            <Text style={locateMedicalCareStyles.menuText}>☰</Text>
          </TouchableOpacity>
          <Text style={locateMedicalCareStyles.title}>Find healthcare</Text>
          <View style={locateMedicalCareStyles.clearButton}>
            <Text style={locateMedicalCareStyles.clearButtonText}></Text>
          </View>
        </View>

        <ScrollView
          style={locateMedicalCareStyles.scrollView}
          contentContainerStyle={locateMedicalCareStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Card */}
          <View style={[locateMedicalCareStyles.card, locateMedicalCareStyles.welcomeCard]}>
            <Text style={locateMedicalCareStyles.welcomeTitle}>📍 Find Healthcare</Text>
            <Text style={locateMedicalCareStyles.welcomeText}>
              Tell us what kind of healthcare service you're looking for.
              We'll help you find nearby providers, clinics, and specialists.
            </Text>
          </View>

          {/* Search Tips Card */}
          <View style={[locateMedicalCareStyles.card, locateMedicalCareStyles.searchCard]}>
            <Text style={locateMedicalCareStyles.searchTitle}>💡 Search Tips</Text>
            <Text style={locateMedicalCareStyles.welcomeText}>
              Try searching for:
            </Text>
            <View style={locateMedicalCareStyles.searchTips}>
              <Text style={locateMedicalCareStyles.searchTip}>• "Emergency room near me"</Text>
              <Text style={locateMedicalCareStyles.searchTip}>• "Cardiologist in [city]"</Text>
              <Text style={locateMedicalCareStyles.searchTip}>• "24/7 urgent care"</Text>
              <Text style={locateMedicalCareStyles.searchTip}>• "Dentist accepting new patients"</Text>
            </View>
          </View>

          {/* Results Area */}
          <View style={[locateMedicalCareStyles.card, locateMedicalCareStyles.resultsCard]}>
            <Text style={locateMedicalCareStyles.resultsPlaceholder}>
              {message ? `Searching for: "${message}"` : 'Your search results will appear here...'}
            </Text>
            {isLoading && <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 16 }} />}
          </View>
        </ScrollView>

        <View style={locateMedicalCareStyles.inputBar}>
          <TextInput
            style={locateMedicalCareStyles.input}
            placeholder='Please enter what kind of healthcare you need!'
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={send}
            placeholderTextColor="#9AA5B1"
            editable={!isLoading}
            returnKeyType="search"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[locateMedicalCareStyles.sendBtn,
            isLoading && locateMedicalCareStyles.sendBtnDisabled]}
            onPress={send}
            disabled={isLoading || !message.trim()}
          >
            <Text style={locateMedicalCareStyles.sendBtnText}
            >
              {isLoading ? '...' : 'Search'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
