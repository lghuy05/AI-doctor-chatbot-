// app/(drawer)/analytics.tsx - FULL CODE WITH DRAWER TOGGLE
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from 'expo-router';
import { analyticsStyles } from '../styles/analyticsStyles';
import { useState, useEffect } from 'react';

// TODO: Replace with real data from backend
const MOCK_SYMPTOM_DATA = [
  { value: 7, label: 'Mon', frontColor: '#3B82F6' },
  { value: 5, label: 'Tue', frontColor: '#3B82F6' },
  { value: 8, label: 'Wed', frontColor: '#3B82F6' },
  { value: 6, label: 'Thu', frontColor: '#3B82F6' },
  { value: 4, label: 'Fri', frontColor: '#3B82F6' },
  { value: 9, label: 'Sat', frontColor: '#EF4444' },
  { value: 3, label: 'Sun', frontColor: '#3B82F6' },
];

const MOCK_SYMPTOM_FREQUENCY = [
  { value: 12, label: 'Headache' },
  { value: 8, label: 'Fatigue' },
  { value: 5, label: 'Nausea' },
  { value: 3, label: 'Fever' },
];

export default function AnalyticsScreen() {
  const navigation = useNavigation();
  const [symptomData, setSymptomData] = useState(MOCK_SYMPTOM_DATA);
  const [frequencyData, setFrequencyData] = useState(MOCK_SYMPTOM_FREQUENCY);

  const toggleDrawer = () => {
    // @ts-ignore - toggleDrawer exists but TypeScript might not recognize it
    navigation.toggleDrawer();
  };

  // TODO: Implement backend data fetching
  const fetchAnalyticsData = async () => {
    try {
      // const response = await api.get('/analytics/symptom-trends');
      // setSymptomData(processBackendData(response.data));
      console.log('Fetching analytics data from backend...');
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  return (
    <ScrollView style={analyticsStyles.container}>
      {/* Header with Drawer Toggle */}
      <View style={[analyticsStyles.header, { flexDirection: 'row', alignItems: 'center' }]}>
        <TouchableOpacity
          style={{
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 20,
            backgroundColor: '#FFFFFF',
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 4,
            elevation: 3,
            marginRight: 16,
          }}
          onPress={toggleDrawer}
        >
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#3B82F6' }}>☰</Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={analyticsStyles.title}>Health Analytics</Text>
        </View>

        {/* Spacer for balance */}
        <View style={{ width: 40 }} />
      </View>

      {/* Symptom Intensity Chart */}
      <View style={analyticsStyles.card}>
        <Text style={analyticsStyles.cardTitle}>Symptom Intensity Trend</Text>
        <Text style={analyticsStyles.cardSubtitle}>
          Your symptom levels over the past week (1-10 scale)
        </Text>

        {/* TODO: Replace with actual Gifted Charts component */}
        <View style={analyticsStyles.chartPlaceholder}>
          <Text style={analyticsStyles.placeholderText}>
            📊 Bar Chart: Symptom Intensity
          </Text>
          <Text style={analyticsStyles.placeholderNote}>
            {/* TODO: Install and implement: */}
            {/* import { BarChart } from 'react-native-gifted-charts'; */}
            {`
            <BarChart
              data={symptomData}
              barWidth={22}
              spacing={24}
              roundedTop
              showVerticalLines
              verticalLinesColor="rgba(0,0,0,0.1)"
              xAxisLabelTextStyle={{color: '#64748B'}}
              yAxisTextStyle={{color: '#64748B'}}
            />
            `}
          </Text>
        </View>
      </View>

      {/* Symptom Frequency Chart */}
      <View style={analyticsStyles.card}>
        <Text style={analyticsStyles.cardTitle}>Symptom Frequency</Text>
        <Text style={analyticsStyles.cardSubtitle}>
          Most common symptoms this month
        </Text>

        <View style={analyticsStyles.chartPlaceholder}>
          <Text style={analyticsStyles.placeholderText}>
            📈 Pie Chart: Symptom Frequency
          </Text>
          <Text style={analyticsStyles.placeholderNote}>
            {/* TODO: Implement PieChart from gifted-charts */}
            {`
            <PieChart
              data={frequencyData}
              showText
              textColor="black"
              radius={100}
              textSize={12}
            />
            `}
          </Text>
        </View>
      </View>

      {/* Risk Level History */}
      <View style={analyticsStyles.card}>
        <Text style={analyticsStyles.cardTitle}>Risk Level History</Text>
        <Text style={analyticsStyles.cardSubtitle}>
          Your triage results over time
        </Text>

        <View style={analyticsStyles.statsGrid}>
          <View style={analyticsStyles.statItem}>
            <Text style={analyticsStyles.statNumber}>12</Text>
            <Text style={analyticsStyles.statLabel}>Low Risk</Text>
          </View>
          <View style={analyticsStyles.statItem}>
            <Text style={analyticsStyles.statNumber}>3</Text>
            <Text style={analyticsStyles.statLabel}>Medium Risk</Text>
          </View>
          <View style={analyticsStyles.statItem}>
            <Text style={analyticsStyles.statNumber}>1</Text>
            <Text style={analyticsStyles.statLabel}>High Risk</Text>
          </View>
        </View>
      </View>

      {/* Data Source Info */}
      <View style={[analyticsStyles.card, analyticsStyles.infoCard]}>
        <Text style={analyticsStyles.infoText}>
          📋 Data Source: Chat interactions & symptom logs
        </Text>
        <Text style={analyticsStyles.infoNote}>
          {/* TODO: Connect to real backend */}
          Backend endpoints needed: /analytics/symptoms, /analytics/risk-levels
        </Text>
      </View>
    </ScrollView>
  );
}
