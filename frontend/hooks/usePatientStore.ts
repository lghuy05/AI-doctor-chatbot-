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

// ✅ ADD DEDUPLICATION FUNCTION
const removeDuplicateMedications = (medications: any[]) => {
  const seen = new Set();

  // Filter out duplicates based on name + prescriber combination
  const uniqueMeds = medications.filter(med => {
    if (!med.name) return false; // Skip if no name

    // Create a unique identifier using name and prescriber
    const identifier = `${med.name.toLowerCase().trim()}-${med.prescriber?.toLowerCase().trim() || 'unknown'}`;

    if (seen.has(identifier)) {
      console.log(`🔄 Removing duplicate medication: ${med.name}`);
      return false;
    }

    seen.add(identifier);
    return true;
  });

  console.log(`✅ Deduplicated ${medications.length} -> ${uniqueMeds.length} medications`);
  return uniqueMeds;
};

// ✅ ADD DEDUPLICATION FOR CONDITIONS TOO (for consistency)
const removeDuplicateConditions = (conditions: any[]) => {
  const seen = new Set();

  const uniqueConditions = conditions.filter(condition => {
    if (!condition.name) return false;

    const identifier = condition.name.toLowerCase().trim();

    if (seen.has(identifier)) {
      console.log(`🔄 Removing duplicate condition: ${condition.name}`);
      return false;
    }

    seen.add(identifier);
    return true;
  });

  console.log(`✅ Deduplicated ${conditions.length} -> ${uniqueConditions.length} conditions`);
  return uniqueConditions;
};

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
            // ✅ APPLY DEDUPLICATION TO BOTH MEDICATIONS AND CONDITIONS
            const profile = response.data.profile;
            // ADD VALIDATION
            if (!profile.name || profile.name === 'Unknown Patient') {
              throw new Error('Invalid patient data received');
            }
            let processedProfile = { ...profile };

            // Deduplicate medications if they exist
            if (processedProfile.active_medications) {
              processedProfile.active_medications = removeDuplicateMedications(
                processedProfile.active_medications
              );
            }

            // Deduplicate conditions if they exist
            if (processedProfile.medical_conditions) {
              processedProfile.medical_conditions = removeDuplicateConditions(
                processedProfile.medical_conditions
              );
            }

            set({
              patientProfile: processedProfile,
              isLoading: false,
              lastFetched: Date.now(),
              error: null,
            });

            console.log(`✅ Patient profile cached: ${processedProfile.name}`);
            console.log(`💊 Medications: ${processedProfile.active_medications?.length || 0}`);
            console.log(`🩺 Conditions: ${processedProfile.medical_conditions?.length || 0}`);

          } else {
            const errorMsg = response.data.error || 'Failed to load patient profile';
            set({
              error: response.data.error || 'Failed to load patient profile',
              isLoading: false,
            });
            console.log('❌ Failed to load patient profile:', response.data.error);
          }
        } catch (error: any) {
          console.error('❌ Error fetching patient profile:', error);
          const errorMessage = error.response?.data?.error ||
            error.message ||
            'Network error';
          set({
            error: errorMessage,
            isLoading: false,
            patientProfile: null, // Clear invalid profile
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
        console.log('🗑️ Patient profile cleared from store');
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
