// app/(drawer)/analytics.tsx - COMPLETE WITH REAL CHARTS
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from 'expo-router';
import { analyticsStyles } from '../styles/analyticsStyles';
import { useState, useEffect } from 'react';
import { useAnalyticsStore } from '../../hooks/useAnalyticsStore';
import { BarChart, PieChart } from 'react-native-gifted-charts';

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

  // Transform data for Bar Chart
  const getBarChartData = () => {
    if (!data.symptomIntensity.dates.length) return [];

    // Get average intensity per symptom for the period
    return Object.values(data.symptomIntensity.symptoms).map(symptom => {
      const avgIntensity = symptom.data.length > 0
        ? symptom.data.reduce((sum, point) => sum + point.intensity, 0) / symptom.data.length
        : 0;

      return {
        value: Math.round(avgIntensity * 10) / 10, // Round to 1 decimal
        label: symptom.name.substring(0, 8), // Shorten long names
        frontColor: symptom.color,
        spacing: 8,
        labelWidth: 40,
        labelTextStyle: { color: '#64748B', fontSize: 10 },
      };
    });
  };

  // Transform data for Pie Chart
  const getPieChartData = () => {
    if (!data.symptomFrequency.length) return [];

    return data.symptomFrequency.slice(0, 6).map(item => ({
      value: item.frequency,
      color: item.color,
      text: `${item.percentage.toFixed(0)}%`,
      textColor: '#FFFFFF',
      textBackgroundColor: 'rgba(0,0,0,0.3)',
      font: { fontWeight: 'bold' },
    }));
  };

  // Multi-line chart data for symptom trends over time
  const getLineChartData = () => {
    if (!data.symptomIntensity.dates.length) return [];

    // Get last 7 days of data for the line chart
    const recentDates = data.symptomIntensity.dates.slice(-7);

    const lineData = recentDates.map(date => {
      const dataPoint: any = { value: 0, dataPointText: '', label: new Date(date).getDate().toString() };

      // Add data for each symptom
      Object.values(data.symptomIntensity.symptoms).forEach(symptom => {
        const point = symptom.data.find(p => p.date === date);
        if (point) {
          dataPoint[symptom.name] = point.intensity;
        }
      });

      return dataPoint;
    });

    return lineData;
  };

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

  const barData = getBarChartData();
  const pieData = getPieChartData();
  const lineData = getLineChartData();

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

      {/* Error Display */}
      {error && (
        <View style={[analyticsStyles.card, analyticsStyles.errorCard]}>
          <Text style={analyticsStyles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchAnalyticsData} style={analyticsStyles.retryButton}>
            <Text style={analyticsStyles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Symptom Intensity Bar Chart */}
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
          Average intensity of your symptoms (1-10 scale)
        </Text>

        {barData.length > 0 ? (
          <View style={analyticsStyles.chartContainer}>
            <BarChart
              data={barData}
              barWidth={28}
              spacing={24}
              roundedTop
              roundedBottom
              hideRules
              xAxisThickness={0}
              yAxisThickness={0}
              yAxisTextStyle={{ color: '#64748B', fontSize: 10 }}
              noOfSections={5}
              maxValue={10}
              height={160}
              showFractionalValues
              formatYLabel={(value) => Math.round(value).toString()}
            />

            {/* Legend */}
            <View style={analyticsStyles.quickStats}>
              {Object.values(data.symptomIntensity.symptoms).slice(0, 4).map(symptom => (
                <View key={symptom.name} style={analyticsStyles.quickStat}>
                  <View style={[analyticsStyles.colorDot, { backgroundColor: symptom.color }]} />
                  <Text style={analyticsStyles.quickStatText}>
                    {symptom.name}
                  </Text>
                </View>
              ))}
            </View>
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

      {/* Symptom Frequency Pie Chart */}
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
            <View style={analyticsStyles.chartWrapper}>
              <PieChart
                data={pieData}
                showText
                textColor="white"
                radius={80}
                textSize={12}
                fontWeight="bold"
                showValuesAsLabels
                labelsPosition="outward"
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

      {/* Data Source Info */}
      <View style={[analyticsStyles.card, analyticsStyles.infoCard]}>
        <Text style={analyticsStyles.infoText}>
          📋 Data Source: AI chat interactions & symptom analysis
        </Text>
        <Text style={analyticsStyles.infoNote}>
          Data is automatically collected when you describe symptoms to the AI.
          Intensity (1-10 scale) and frequency are tracked over time.
        </Text>
      </View>
    </ScrollView>
  );
}
