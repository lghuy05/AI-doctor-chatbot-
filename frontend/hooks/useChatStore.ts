// hooks/useChatStore.ts - COMPLETE IMPLEMENTATION
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChatMessage {
  id: string;
  userMessage: string;
  aiResponse: {
    advice?: Array<{ step: string; details: string }>;
    when_to_seek_care?: string[];
    disclaimer?: string;
    symptom_analysis?: any;
    emergency?: boolean;
    error?: string;
  };
  timestamp: Date;
  symptoms: string;
  patientContext: {
    medications: string[];
    conditions: string[];
  };
}

interface ChatStore {
  // Current active chat session
  currentSession: ChatMessage[];
  // All historical chats (grouped by date)
  chatHistory: { [date: string]: ChatMessage[] };
  // Loading states
  isLoading: boolean;

  // Actions
  addMessage: (userMessage: string, aiResponse: any, symptoms: string, patientContext: any) => void;
  clearCurrentSession: () => void;
  loadSession: (sessionId: string) => void;
  deleteMessage: (messageId: string) => void;
  clearAllHistory: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      currentSession: [],
      chatHistory: {},
      isLoading: false,

      addMessage: (userMessage: string, aiResponse: any, symptoms: string, patientContext: any) => {
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          userMessage,
          aiResponse,
          timestamp: new Date(),
          symptoms,
          patientContext,
        };

        set(state => {
          const updatedSession = [...state.currentSession, newMessage];

          // Also add to historical archive by date
          const dateKey = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
          const existingDateHistory = state.chatHistory[dateKey] || [];

          return {
            currentSession: updatedSession,
            chatHistory: {
              ...state.chatHistory,
              [dateKey]: [...existingDateHistory, newMessage],
            },
          };
        });
      },

      clearCurrentSession: () => set({ currentSession: [] }),

      loadSession: (sessionId: string) => {
        // For future implementation - load specific historical session
        console.log('Loading session:', sessionId);
      },

      deleteMessage: (messageId: string) => {
        set(state => ({
          currentSession: state.currentSession.filter(msg => msg.id !== messageId),
        }));
      },

      clearAllHistory: () => set({ currentSession: [], chatHistory: {} }),
    }),
    {
      name: 'chat-store',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist chat history, not current session
      partialize: (state) => ({
        chatHistory: state.chatHistory
      }),
    }
  )
);
