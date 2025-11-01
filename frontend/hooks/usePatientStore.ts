// hooks/usePatientStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';

interface PatientProfile {
  id: string;
  name: string;
  birth_date?: string;
  age?: number;
  gender: string;
  contact: {
    email: string;
    phone: string;
  };
  active_medications: Array<{
    name: string;
    status: string;
    prescribed_date?: string;
    prescriber: string;
  }>;
  medical_conditions: Array<{
    name: string;
    status: string;
    recorded_date?: string;
  }>;
  last_updated: string;
}
//hi
interface PatientStore {
  patientProfile: PatientProfile | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;

  // Actions
  fetchPatientProfile: (patientId: string, forceRefresh?: boolean) => Promise<void>;
  clearPatientProfile: () => void;
  getPatientContext: () => { medications: string[]; conditions: string[] };
  testPatientData: (patientId: string) => Promise<any>;
  discoverPatients: () => Promise<any[]>;
}

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export const usePatientStore = create<PatientStore>()(
  persist(
    (set, get) => ({
      patientProfile: null,
      isLoading: false,
      error: null,
      lastFetched: null,

      fetchPatientProfile: async (patientId: string, forceRefresh = false) => {
        const state = get();

        // Check cache first
        if (!forceRefresh &&
          state.patientProfile &&
          state.lastFetched &&
          Date.now() - state.lastFetched < CACHE_DURATION) {
          console.log('📦 Using cached patient profile');
          return;
        }

        set({ isLoading: true, error: null });

        try {
          console.log(`🔄 Fetching profile for patient: ${patientId}`);
          const response = await api.get(`/patient/profile/${patientId}`);

          if (response.data.success && response.data.profile) {
            set({
              patientProfile: response.data.profile,
              isLoading: false,
              lastFetched: Date.now(),
              error: null,
            });
            console.log(`✅ Patient profile cached: ${response.data.profile.name}`);
          } else {
            set({
              error: response.data.error || 'Failed to load patient profile',
              isLoading: false,
            });
          }
        } catch (error: any) {
          console.error('❌ Error fetching patient profile:', error);
          set({
            error: error.response?.data?.error || error.message || 'Network error',
            isLoading: false,
          });
        }
      },

      testPatientData: async (patientId: string) => {
        try {
          console.log(`🔍 Testing patient data for: ${patientId}`);
          const response = await api.get(`/patient/test/${patientId}`);
          return response.data;
        } catch (error: any) {
          console.error('❌ Error testing patient:', error);
          throw error;
        }
      },

      discoverPatients: async () => {
        try {
          console.log('🔍 Discovering patients...');
          const response = await api.get('/patient/discover');
          if (response.data.success) {
            return response.data.patients;
          }
          return [];
        } catch (error: any) {
          console.error('❌ Error discovering patients:', error);
          return [];
        }
      },

      clearPatientProfile: () => {
        set({
          patientProfile: null,
          lastFetched: null,
          error: null,
        });
      },

      getPatientContext: () => {
        const state = get();
        if (!state.patientProfile) {
          return { medications: [], conditions: [] };
        }

        return {
          medications: state.patientProfile.active_medications.map(med => med.name),
          conditions: state.patientProfile.medical_conditions.map(cond => cond.name),
        };
      },
    }),
    {
      name: 'patient-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        patientProfile: state.patientProfile,
        lastFetched: state.lastFetched,
      }),
    }
  )
);
