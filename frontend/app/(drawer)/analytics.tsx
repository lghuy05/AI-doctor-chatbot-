// app/(drawer)/analytics.tsx - MULTIPLE SYMPTOMS LINE CHART
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Dimensions, LogBox } from 'react-native';
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

  // Suppress the specific warning
  useEffect(() => {
    LogBox.ignoreLogs(['onStartShouldSetResponder']);
  }, []);

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

  // FIXED: Show multiple symptoms in line chart
  const getLineChartData = () => {
    const { symptoms } = data.symptomIntensity;

    if (Object.keys(symptoms).length === 0) {
      return [];
    }

    console.log('📈 Available symptoms for line chart:', Object.keys(symptoms));

    // Get all symptoms that have data
    const symptomNames = Object.keys(symptoms);

    // Create data sets for each symptom
    const dataSets = symptomNames.map(symptomName => {
      const symptom = symptoms[symptomName];

      if (!symptom.data || symptom.data.length === 0) {
        return null;
      }

      console.log(`📈 Processing ${symptomName}:`, symptom.data);

      // Transform data to match gifted charts format
      const lineData = symptom.data.map((point, index) => {
        // Format date for display (e.g., "Nov 06")
        const date = new Date(point.date);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });
        const formattedDate = `${month} ${day}`;

        return {
          value: point.intensity,
          label: index === 0 || index === symptom.data.length - 1 ? formattedDate : '', // Show first and last labels
          dataPointText: point.intensity.toString(),
          labelTextStyle: { color: 'gray', fontSize: 10 },
        };
      });

      return {
        data: lineData,
        color: symptom.color || '#3B82F6',
        name: symptomName
      };
    }).filter(Boolean); // Remove null entries

    console.log('✅ Line chart data sets:', dataSets.length);
    return dataSets;
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

  const lineDataSets = getLineChartData();
  const pieData = getPieChartData();
  const hasLineData = lineDataSets.length > 0;

  // For single line display (backward compatibility)
  const primaryLineData = lineDataSets[0]?.data || [];

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

      {/* Symptom Intensity Line Chart - MULTIPLE SYMPTOMS VERSION */}
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
            {/* Show multiple lines using dataSet prop */}
            {lineDataSets.length === 1 ? (
              // Single line (original behavior)
              <LineChart
                data={primaryLineData}
                spacing={50}
                thickness={3}
                hideRules={false}
                hideDataPoints={false}
                color={lineDataSets[0].color}
                yAxisColor="#3B82F6"
                xAxisColor="#3B82F6"
                dataPointsColor={lineDataSets[0].color}
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
              />
            ) : (
              // Multiple lines using dataSet
              <LineChart
                dataSet={lineDataSets.map((dataset, index) => ({
                  data: dataset.data,
                  color: dataset.color,
                  thickness: 3,
                  curved: true,
                  hideDataPoints: false,
                  dataPointsColor: dataset.color,
                  dataPointsRadius: 4,
                }))}
                spacing={50}
                hideRules={false}
                yAxisColor="#3B82F6"
                xAxisColor="#3B82F6"
                initialSpacing={20}
                endSpacing={20}
                height={220}
                yAxisOffset={0}
                noOfSections={5}
                maxValue={10}
                isAnimated={true}
                showVerticalLines={true}
                verticalLinesColor="rgba(59, 130, 246, 0.1)"
                xAxisLabelTextStyle={{ color: 'gray', fontSize: 10 }}
                yAxisTextStyle={{ color: 'gray', fontSize: 12 }}
                areaChart={false}
                curvature={0.2}
                strokeLinecap="round"
                focusEnabled={false}
              />
            )}

            {/* Legend for multiple symptoms */}
            {lineDataSets.length > 1 && (
              <View style={analyticsStyles.legendContainer}>
                {lineDataSets.map((dataset, index) => (
                  <View key={dataset.name} style={analyticsStyles.legendItem}>
                    <View
                      style={[
                        analyticsStyles.legendColor,
                        { backgroundColor: dataset.color }
                      ]}
                    />
                    <Text style={analyticsStyles.legendText}>
                      {dataset.name}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <Text style={[analyticsStyles.cardSubtitle, { textAlign: 'center', marginTop: 10 }]}>
              {lineDataSets.length === 1
                ? `${lineDataSets[0].name} Intensity Over Time`
                : 'Multiple Symptoms Intensity'
              }
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

            {/* Frequency list with last reported time */}
            <View style={analyticsStyles.frequencyList}>
              {data.symptomFrequency.slice(0, 5).map((item, index) => {
                // Format the last occurrence date
                const lastReported = item.last_occurrence ?
                  new Date(item.last_occurrence).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }) : 'Never';

                return (
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
                      <Text style={analyticsStyles.lastReportedText}>
                        Last: {lastReported}
                      </Text>
                    </View>
                    <View style={analyticsStyles.frequencyPercentage}>
                      <Text style={analyticsStyles.percentageText}>
                        {item.percentage.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                );
              })}
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
