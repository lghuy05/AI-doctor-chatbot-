// app/(drawer)/analytics.tsx - FIXED LINE CHART VERSION
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { useNavigation } from 'expo-router';
import { analyticsStyles } from '../styles/analyticsStyles';
import { useState, useEffect } from 'react';
import { useAnalyticsStore } from '../../hooks/useAnalyticsStore';
import { LineChart, PieChart } from 'react-native-gifted-charts';

export default function AnalyticsScreen() {
  const navigation = useNavigation();
  const {
    data,
    isLoading,
    error,
    fetchAnalyticsData,
    timeRange,
    setTimeRange
  } = useAnalyticsStore();

  const [refreshing, setRefreshing] = useState(false);

  const toggleDrawer = () => {
    // @ts-ignore
    navigation.toggleDrawer();
  };

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    await fetchAnalyticsData();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setRefreshing(false);
  };

  // FIXED LINE CHART DATA - Proper format for gifted charts
  const getLineChartData = () => {
    const { dates, symptoms } = data.symptomIntensity;

    if (dates.length === 0 || Object.keys(symptoms).length === 0) {
      return [];
    }

    // Get the first symptom that has data
    const symptomNames = Object.keys(symptoms);
    const primarySymptom = symptoms[symptomNames[0]];

    if (!primarySymptom.data || primarySymptom.data.length === 0) {
      return [];
    }

    console.log('📈 Processing line chart data for:', primarySymptom.name);

    // Transform data to match gifted charts format
    const lineData = primarySymptom.data.map((point, index) => {
      // Format date for display (e.g., "Nov 06")
      const date = new Date(point.date);
      const day = date.getDate();
      const month = date.toLocaleString('default', { month: 'short' });
      const formattedDate = `${month} ${day}`;

      return {
        value: point.intensity,
        label: index % 2 === 0 ? formattedDate : '', // Show every other label
        dataPointText: point.intensity.toString(),
        labelTextStyle: { color: 'gray', fontSize: 10 },
      };
    });

    console.log('✅ Line chart data points:', lineData.length);
    return lineData;
  };

  // Custom data point component
  const CustomDataPoint = () => {
    return (
      <View
        style={{
          width: 14,
          height: 14,
          backgroundColor: 'white',
          borderWidth: 3,
          borderRadius: 7,
          borderColor: '#3B82F6',
        }}
      />
    );
  };

  // Keep pie chart working as before
  const getPieChartData = () => {
    if (!data.symptomFrequency.length) return [];

    return data.symptomFrequency.slice(0, 5).map(item => ({
      value: item.frequency,
      color: item.color,
      text: `${item.percentage.toFixed(0)}%`,
    }));
  };

  const lineData = getLineChartData();
  const pieData = getPieChartData();
  const hasLineData = lineData.length > 0;

  if (isLoading && !data.lastUpdated) {
    return (
      <View style={analyticsStyles.container}>
        <View style={[analyticsStyles.header, { flexDirection: 'row', alignItems: 'center' }]}>
          <TouchableOpacity style={analyticsStyles.menuButton} onPress={toggleDrawer}>
            <Text style={analyticsStyles.menuText}>☰</Text>
          </TouchableOpacity>
          <Text style={analyticsStyles.title}>Health Analytics</Text>
        </View>
        <View style={analyticsStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={[analyticsStyles.cardSubtitle, { marginTop: 16 }]}>
            Loading your health analytics...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={analyticsStyles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={[analyticsStyles.header, { flexDirection: 'row', alignItems: 'center' }]}>
        <TouchableOpacity style={analyticsStyles.menuButton} onPress={toggleDrawer}>
          <Text style={analyticsStyles.menuText}>☰</Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={analyticsStyles.title}>Health Analytics</Text>
          {data.lastUpdated && (
            <Text style={analyticsStyles.subtitle}>
              Updated: {new Date(data.lastUpdated).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>

      {/* Symptom Intensity Line Chart - COMPLETELY FIXED VERSION */}
      <View style={analyticsStyles.card}>
        <View style={analyticsStyles.cardHeader}>
          <Text style={analyticsStyles.cardTitle}>Symptom Intensity</Text>
          <TouchableOpacity
            style={analyticsStyles.timeRangeButton}
            onPress={() => setTimeRange(
              timeRange.intensityDays === 30 ? 7 : 30,
              timeRange.frequencyMonths
            )}
          >
            <Text style={analyticsStyles.timeRangeText}>
              {timeRange.intensityDays} days
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={analyticsStyles.cardSubtitle}>
          Intensity trend over time (1-10 scale)
        </Text>

        {hasLineData ? (
          <View style={analyticsStyles.chartContainer}>
            <LineChart
              data={lineData}
              spacing={50}
              thickness={3}
              hideRules={false}
              hideDataPoints={false}
              color="#3B82F6"
              yAxisColor="#3B82F6"
              xAxisColor="#3B82F6"
              dataPointsColor="#3B82F6"
              dataPointsRadius={6}
              initialSpacing={20}
              endSpacing={20}
              height={220}
              yAxisOffset={0}
              noOfSections={5}
              maxValue={10}
              isAnimated={true}
              animateOnDataChange={false}
              animationDuration={1000}
              showVerticalLines={true}
              verticalLinesColor="rgba(59, 130, 246, 0.1)"
              verticalLinesThickness={1}
              xAxisLabelTextStyle={{ color: 'gray', fontSize: 10 }}
              yAxisTextStyle={{ color: 'gray', fontSize: 12 }}
              areaChart={false}
              curved={true}
              curvature={0.2}
              strokeLinecap="round"
              focusEnabled={false}
              showValuesAsDataPointsText={false}
            // Remove customDataPoint for now to use default
            />
            <Text style={[analyticsStyles.cardSubtitle, { textAlign: 'center', marginTop: 10 }]}>
              {Object.values(data.symptomIntensity.symptoms)[0]?.name || 'Symptom'} Intensity Over Time
            </Text>
          </View>
        ) : (
          <View style={analyticsStyles.emptyState}>
            <Text style={analyticsStyles.emptyIcon}>📊</Text>
            <Text style={analyticsStyles.emptyTitle}>No intensity data</Text>
            <Text style={analyticsStyles.emptyText}>
              Start chatting with AI to track symptom intensities
            </Text>
          </View>
        )}
      </View>

      {/* Symptom Frequency Pie Chart - KEEP WORKING VERSION */}
      <View style={analyticsStyles.card}>
        <View style={analyticsStyles.cardHeader}>
          <Text style={analyticsStyles.cardTitle}>Symptom Frequency</Text>
          <TouchableOpacity
            style={analyticsStyles.timeRangeButton}
            onPress={() => setTimeRange(
              timeRange.intensityDays,
              timeRange.frequencyMonths === 6 ? 3 : 6
            )}
          >
            <Text style={analyticsStyles.timeRangeText}>
              {timeRange.frequencyMonths} months
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={analyticsStyles.cardSubtitle}>
          Distribution of your most common symptoms
        </Text>

        {pieData.length > 0 ? (
          <View style={analyticsStyles.chartContainer}>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <PieChart
                data={pieData}
                donut
                showText
                textColor="black"
                radius={90}
                textSize={14}
                showTextBackground
                textBackgroundRadius={20}
                textBackgroundColor="rgba(255,255,255,0.7)"
                focusOnPress
                sectionAutoFocus
              />
            </View>

            {/* Frequency list */}
            <View style={analyticsStyles.frequencyList}>
              {data.symptomFrequency.slice(0, 5).map((item, index) => (
                <View key={item.symptom} style={analyticsStyles.frequencyItem}>
                  <View style={analyticsStyles.frequencyRank}>
                    <Text style={analyticsStyles.rankText}>#{index + 1}</Text>
                  </View>
                  <View style={analyticsStyles.frequencyInfo}>
                    <Text style={analyticsStyles.frequencySymptom}>
                      {item.symptom}
                    </Text>
                    <Text style={analyticsStyles.frequencyCount}>
                      {item.frequency} occurrences
                    </Text>
                  </View>
                  <View style={analyticsStyles.frequencyPercentage}>
                    <Text style={analyticsStyles.percentageText}>
                      {item.percentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={analyticsStyles.emptyState}>
            <Text style={analyticsStyles.emptyIcon}>📈</Text>
            <Text style={analyticsStyles.emptyTitle}>No frequency data</Text>
            <Text style={analyticsStyles.emptyText}>
              Symptom frequency will appear after multiple chat sessions
            </Text>
          </View>
        )}
      </View>

      {/* Summary Stats */}
      <View style={analyticsStyles.card}>
        <Text style={analyticsStyles.cardTitle}>Health Summary</Text>

        <View style={analyticsStyles.statsGrid}>
          <View style={analyticsStyles.statItem}>
            <Text style={analyticsStyles.statNumber}>
              {data.summary.total_symptoms_recorded}
            </Text>
            <Text style={analyticsStyles.statLabel}>Total Records</Text>
          </View>

          <View style={analyticsStyles.statItem}>
            <Text style={analyticsStyles.statNumber}>
              {data.summary.most_frequent_count}
            </Text>
            <Text style={analyticsStyles.statLabel}>
              {data.summary.most_frequent_symptom ?
                data.summary.most_frequent_symptom.substring(0, 8) : 'Most Frequent'}
            </Text>
          </View>

          <View style={analyticsStyles.statItem}>
            <Text style={analyticsStyles.statNumber}>
              {data.summary.highest_intensity_value}
            </Text>
            <Text style={analyticsStyles.statLabel}>
              {data.summary.highest_intensity_symptom ?
                data.summary.highest_intensity_symptom.substring(0, 8) : 'Peak Intensity'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
