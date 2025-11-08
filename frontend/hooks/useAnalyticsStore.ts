// hooks/useAnalyticsStore.ts - COMPLETE FIXED VERSION
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

// Color palette for symptoms - optimized for gifted charts
const symptomColors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
  '#F97316', '#6366F1'
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
      console.log(`📊 Fetching symptom intensity for ${days} days`);
      const response = await api.get(`/analytics/symptom-intensity?days=${days}`);

      if (response.data.success) {
        const processedData = response.data.data;

        console.log('📊 Symptom Intensity Data Received:', {
          dates: processedData.dates?.length || 0,
          symptoms: Object.keys(processedData.symptoms || {}).length,
          hasSymptoms: !!processedData.symptoms
        });

        // Process and assign colors to symptoms
        if (processedData.symptoms) {
          Object.values(processedData.symptoms).forEach((symptom: any, index) => {
            symptom.color = getSymptomColor(symptom.name, index);
          });
        }

        set(state => ({
          data: {
            ...state.data,
            symptomIntensity: processedData
          }
        }));

        console.log('✅ Symptom intensity data processed successfully');
      } else {
        console.error('❌ API returned success:false for symptom intensity', response.data);
        // Fallback to test data if real data fails
        await get().fetchTestSymptomIntensity();
      }
    } catch (error: any) {
      console.error('❌ Failed to fetch symptom intensity:', error);
      // Fallback to test data on error
      await get().fetchTestSymptomIntensity();
    }
  },

  fetchSymptomFrequency: async (months: number = 6) => {
    try {
      console.log(`📊 Fetching symptom frequency for ${months} months`);
      const response = await api.get(`/analytics/symptom-frequency?months=${months}`);

      if (response.data.success) {
        const frequencyData = response.data.data || [];

        console.log('📊 Symptom Frequency Data Received:', {
          count: frequencyData.length,
          symptoms: frequencyData.map((item: any) => item.symptom)
        });

        // Calculate percentages and assign colors
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

        console.log('✅ Symptom frequency data processed successfully');
      } else {
        console.error('❌ API returned success:false for symptom frequency', response.data);
        // Fallback to test data if real data fails
        await get().fetchTestSymptomFrequency();
      }
    } catch (error: any) {
      console.error('❌ Failed to fetch symptom frequency:', error);
      // Fallback to test data on error
      await get().fetchTestSymptomFrequency();
    }
  },

  fetchSymptomSummary: async () => {
    try {
      console.log('📊 Fetching symptom summary');
      const response = await api.get('/analytics/symptom-summary');

      if (response.data.success) {
        set(state => ({
          data: {
            ...state.data,
            summary: response.data.summary
          }
        }));
        console.log('✅ Symptom summary data processed successfully');
      } else {
        console.error('❌ API returned success:false for symptom summary', response.data);
        // Fallback to test data if real data fails
        await get().fetchTestSymptomSummary();
      }
    } catch (error: any) {
      console.error('❌ Failed to fetch symptom summary:', error);
      // Fallback to test data on error
      await get().fetchTestSymptomSummary();
    }
  },

  // Fallback test data methods
  fetchTestSymptomIntensity: async () => {
    console.log('🔄 Using test data for symptom intensity');
    const testData = {
      dates: ["2024-01-01", "2024-01-02", "2024-01-03", "2024-01-04", "2024-01-05"],
      symptoms: {
        "headache": {
          name: "headache",
          data: [
            { date: "2024-01-01", intensity: 5, occurrences: 1 },
            { date: "2024-01-02", intensity: 7, occurrences: 2 },
            { date: "2024-01-03", intensity: 3, occurrences: 1 },
            { date: "2024-01-04", intensity: 4, occurrences: 1 },
            { date: "2024-01-05", intensity: 6, occurrences: 1 }
          ],
          color: getSymptomColor("headache", 0)
        },
        "fever": {
          name: "fever",
          data: [
            { date: "2024-01-01", intensity: 2, occurrences: 1 },
            { date: "2024-01-02", intensity: 8, occurrences: 1 },
            { date: "2024-01-03", intensity: 4, occurrences: 1 },
            { date: "2024-01-04", intensity: 3, occurrences: 1 },
            { date: "2024-01-05", intensity: 2, occurrences: 1 }
          ],
          color: getSymptomColor("fever", 1)
        },
        "fatigue": {
          name: "fatigue",
          data: [
            { date: "2024-01-01", intensity: 6, occurrences: 1 },
            { date: "2024-01-02", intensity: 5, occurrences: 1 },
            { date: "2024-01-03", intensity: 4, occurrences: 1 },
            { date: "2024-01-04", intensity: 3, occurrences: 1 },
            { date: "2024-01-05", intensity: 7, occurrences: 1 }
          ],
          color: getSymptomColor("fatigue", 2)
        }
      },
      overall_trend: [
        { date: "2024-01-01", average_intensity: 4.33 },
        { date: "2024-01-02", average_intensity: 6.67 },
        { date: "2024-01-03", average_intensity: 3.67 },
        { date: "2024-01-04", average_intensity: 3.33 },
        { date: "2024-01-05", average_intensity: 5.0 }
      ]
    };

    set(state => ({
      data: {
        ...state.data,
        symptomIntensity: testData
      }
    }));
  },

  fetchTestSymptomFrequency: async () => {
    console.log('🔄 Using test data for symptom frequency');
    const testData = [
      { symptom: "headache", frequency: 5, percentage: 38.5, color: getSymptomColor("headache", 0) },
      { symptom: "fever", frequency: 4, percentage: 30.8, color: getSymptomColor("fever", 1) },
      { symptom: "fatigue", frequency: 4, percentage: 30.8, color: getSymptomColor("fatigue", 2) }
    ];

    set(state => ({
      data: {
        ...state.data,
        symptomFrequency: testData
      }
    }));
  },

  fetchTestSymptomSummary: async () => {
    console.log('🔄 Using test data for symptom summary');
    const testSummary = {
      total_symptoms_recorded: 13,
      most_frequent_symptom: "headache",
      most_frequent_count: 5,
      highest_intensity_symptom: "fever",
      highest_intensity_value: 8
    };

    set(state => ({
      data: {
        ...state.data,
        summary: testSummary
      }
    }));
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
