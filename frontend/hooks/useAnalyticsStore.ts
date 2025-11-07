// hooks/useAnalyticsStore.ts - UPDATED FOR CHARTS
import { create } from 'zustand';
import api from '../api/client';

interface SymptomIntensityPoint {
  date: string;
  intensity: number;
  occurrences: number;
}

interface SymptomData {
  name: string;
  data: SymptomIntensityPoint[];
  color: string;
}

interface SymptomFrequency {
  symptom: string;
  frequency: number;
  color: string;
  percentage: number;
}

interface AnalyticsData {
  symptomIntensity: {
    dates: string[];
    symptoms: { [key: string]: SymptomData };
    overall_trend: { date: string; average_intensity: number }[];
  };
  symptomFrequency: SymptomFrequency[];
  summary: {
    total_symptoms_recorded: number;
    most_frequent_symptom: string | null;
    most_frequent_count: number;
    highest_intensity_symptom: string | null;
    highest_intensity_value: number;
  };
  lastUpdated: string | null;
}

interface AnalyticsStore {
  data: AnalyticsData;
  isLoading: boolean;
  error: string | null;
  timeRange: {
    intensityDays: number;
    frequencyMonths: number;
  };

  // Actions
  fetchAnalyticsData: () => Promise<void>;
  fetchSymptomIntensity: (days?: number) => Promise<void>;
  fetchSymptomFrequency: (months?: number) => Promise<void>;
  fetchSymptomSummary: () => Promise<void>;
  setTimeRange: (intensityDays: number, frequencyMonths: number) => void;
  clearError: () => void;
}

const initialState: AnalyticsData = {
  symptomIntensity: {
    dates: [],
    symptoms: {},
    overall_trend: []
  },
  symptomFrequency: [],
  summary: {
    total_symptoms_recorded: 0,
    most_frequent_symptom: null,
    most_frequent_count: 0,
    highest_intensity_symptom: null,
    highest_intensity_value: 0
  },
  lastUpdated: null
};

// Color palette for symptoms
const symptomColors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
  '#F97316', '#6366F1', '#14B8A6', '#EAB308'
];

const getSymptomColor = (symptomName: string, index: number): string => {
  // Try to assign consistent colors for common symptoms
  const colorMap: { [key: string]: string } = {
    'headache': '#3B82F6',
    'fever': '#EF4444',
    'cough': '#10B981',
    'fatigue': '#F59E0B',
    'nausea': '#8B5CF6',
    'pain': '#EC4899',
    'dizziness': '#06B6D4',
    'insomnia': '#84CC16',
    'anxiety': '#F97316',
    'depression': '#6366F1'
  };

  return colorMap[symptomName.toLowerCase()] || symptomColors[index % symptomColors.length];
};

export const useAnalyticsStore = create<AnalyticsStore>((set, get) => ({
  data: initialState,
  isLoading: false,
  error: null,
  timeRange: {
    intensityDays: 30,
    frequencyMonths: 6
  },

  fetchAnalyticsData: async () => {
    const { timeRange, fetchSymptomIntensity, fetchSymptomFrequency, fetchSymptomSummary } = get();

    set({ isLoading: true, error: null });

    try {
      await Promise.all([
        fetchSymptomIntensity(timeRange.intensityDays),
        fetchSymptomFrequency(timeRange.frequencyMonths),
        fetchSymptomSummary()
      ]);

      set({
        isLoading: false,
        data: {
          ...get().data,
          lastUpdated: new Date().toISOString()
        }
      });

    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch analytics data'
      });
    }
  },

  fetchSymptomIntensity: async (days: number = 30) => {
    try {
      const response = await api.get(`/analytics/symptom-intensity?days=${days}`);

      if (response.data.success) {
        // Process and assign colors to symptoms
        const processedData = { ...response.data.data };

        Object.values(processedData.symptoms).forEach((symptom: any, index) => {
          symptom.color = getSymptomColor(symptom.name, index);
        });

        set(state => ({
          data: {
            ...state.data,
            symptomIntensity: processedData
          }
        }));
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch symptom intensity' });
      throw error;
    }
  },

  fetchSymptomFrequency: async (months: number = 6) => {
    try {
      const response = await api.get(`/analytics/symptom-frequency?months=${months}`);

      if (response.data.success) {
        // Calculate percentages and assign colors
        const frequencyData = response.data.data;
        const total = frequencyData.reduce((sum: number, item: any) => sum + item.frequency, 0);

        const dataWithPercentages = frequencyData.map((item: any, index: number) => ({
          ...item,
          percentage: total > 0 ? (item.frequency / total) * 100 : 0,
          color: getSymptomColor(item.symptom, index)
        }));

        set(state => ({
          data: {
            ...state.data,
            symptomFrequency: dataWithPercentages
          }
        }));
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch symptom frequency' });
      throw error;
    }
  },

  fetchSymptomSummary: async () => {
    try {
      const response = await api.get('/analytics/symptom-summary');

      if (response.data.success) {
        set(state => ({
          data: {
            ...state.data,
            summary: response.data.summary
          }
        }));
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch symptom summary' });
      throw error;
    }
  },

  setTimeRange: (intensityDays: number, frequencyMonths: number) => {
    set({
      timeRange: { intensityDays, frequencyMonths }
    });
    // Auto-refresh data when time range changes
    setTimeout(() => {
      get().fetchAnalyticsData();
    }, 100);
  },

  clearError: () => set({ error: null })
}));
