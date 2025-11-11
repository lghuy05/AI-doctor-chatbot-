// hooks/useChatStore.ts - UPDATED WITH ANALYTICS INTEGRATION
import { create } from 'zustand';
import { useAnalyticsStore } from './useAnalyticsStore';

export interface ChatMessage {
  id: string;
  userMessage: string;
  aiResponse: any;
  timestamp: Date;
  patientContext: any;
}

interface ChatStore {
  currentSession: ChatMessage[];
  isLoading: boolean;

  addMessage: (userMessage: string, aiResponse: any, symptoms: string, patientContext: any) => void;
  clearCurrentSession: () => void;
  triggerAnalyticsRefresh: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  currentSession: [],
  isLoading: false,

  addMessage: (userMessage: string, aiResponse: any, symptoms: string, patientContext: any) => {
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

    // Trigger analytics refresh after new chat message
    const analyticsStore = useAnalyticsStore.getState();
    analyticsStore.fetchAnalyticsData();
  },

  clearCurrentSession: () => {
    set({ currentSession: [] });
  },

  triggerAnalyticsRefresh: () => {
    const analyticsStore = useAnalyticsStore.getState();
    analyticsStore.fetchAnalyticsData();
  }
}));
