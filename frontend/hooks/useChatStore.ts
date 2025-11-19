// hooks/useChatStore.ts - UPDATED FOR CHAT FLOW
import { create } from 'zustand';
import { useAnalyticsStore } from './useAnalyticsStore';

export interface AIReminderSuggestion {
  reminder_title: string;
  reminder_description: string;
  suggested_time: string;
  suggested_frequency: string;
  priority: string;
}

export interface HealthcareProvider {
  name: string;
  address: string;
  phone: string | null;
  website: string | null;
  rating: number | null;
  total_ratings: number | null;
  open_now: boolean | null;
  distance_km: number;
  place_id: string;
  types: string[];
  google_maps_url: string;
}

export interface HealthcareRecommendations {
  providers: HealthcareProvider[];
  recommendation_reason: string;
  provider_type: string;
}

export interface AIResponse {
  // Simple conversation response
  response?: string;
  loading?: boolean;

  // Medical analysis response
  emergency?: boolean;
  notice?: string;
  error?: string;
  possible_diagnosis?: string[];
  diagnosis_reasoning?: string;
  advice?: Array<{ step: string; details: string }>;
  when_to_seek_care?: string[];
  disclaimer?: string;
  symptom_analysis?: {
    intensities: Array<{
      symptom_name: string;
      intensity: number;
      duration_minutes: number;
      notes: string;
    }>;
    overall_severity: number;
  };
  ai_reminder_suggestions?: AIReminderSuggestion[];
  healthcare_recommendations?: HealthcareRecommendations;
}

export interface ChatMessage {
  id: string;
  userMessage: string;
  aiResponse: AIResponse;
  timestamp: Date;
  patientContext: any;
}

interface ChatStore {
  currentSession: ChatMessage[];
  isLoading: boolean;
  currentSessionId: number | null;

  // Actions
  addMessage: (userMessage: string, aiResponse: AIResponse, symptoms: string, patientContext: any) => void;
  clearCurrentSession: () => void;
  setCurrentSessionId: (sessionId: number | null) => void;
  triggerAnalyticsRefresh: () => void;
  setLoading: (loading: boolean) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  currentSession: [],
  isLoading: false,
  currentSessionId: null,

  addMessage: (userMessage: string, aiResponse: AIResponse, symptoms: string, patientContext: any) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userMessage,
      aiResponse,
      timestamp: new Date(),
      patientContext
    };

    set(state => ({
      currentSession: [...state.currentSession, newMessage]
    }));

    // Only trigger analytics for medical analysis responses (not simple conversations)
    if (aiResponse.possible_diagnosis || aiResponse.symptom_analysis || aiResponse.advice) {
      const analyticsStore = useAnalyticsStore.getState();
      analyticsStore.fetchAnalyticsData();

      console.log('📊 Analytics refreshed due to medical analysis');
    }

    // Log for debugging
    console.log('💬 Chat message added:', {
      userMessage,
      hasDiagnosis: !!aiResponse.possible_diagnosis,
      hasSymptoms: !!aiResponse.symptom_analysis,
      hasAdvice: !!aiResponse.advice
    });
  },

  clearCurrentSession: () => {
    set({
      currentSession: [],
      currentSessionId: null
    });
    console.log('🗑️ Chat session cleared');
  },

  setCurrentSessionId: (sessionId: number | null) => {
    set({ currentSessionId: sessionId });
    console.log('📝 Session ID set:', sessionId);
  },

  triggerAnalyticsRefresh: () => {
    const analyticsStore = useAnalyticsStore.getState();
    analyticsStore.fetchAnalyticsData();
    console.log('📊 Manual analytics refresh triggered');
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  }
}));
