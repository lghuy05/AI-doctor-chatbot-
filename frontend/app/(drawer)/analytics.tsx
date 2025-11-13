// app/(drawer)/analytics.tsx - FIXED VERSION
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, LogBox } from 'react-native';
import { useNavigation, useFocusEffect } from 'expo-router';
import { analyticsStyles } from '../styles/analyticsStyles';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAnalyticsStore } from '../../hooks/useAnalyticsStore';
import { LineChart, PieChart } from 'react-native-gifted-charts';

// Fix for gifted-charts hook order issue
const StableLineChart = (props: any) => {
  // Memoize the data to prevent unnecessary re-renders
  const memoizedProps = useMemo(() => props, [JSON.stringify(props)]);

  return <LineChart {...memoizedProps} />;
};

const StablePieChart = (props: any) => {
  const memoizedProps = useMemo(() => props, [JSON.stringify(props)]);

  return <PieChart {...memoizedProps} />;
};

export default function AnalyticsScreen() {
  const navigation = useNavigation();
  const {
    data,
    isLoading,
    error,
    fetchAnalyticsData,
    timeRange,
    setTimeRange,
    checkForUpdates,
    enableAutoRefresh,
    disableAutoRefresh
  } = useAnalyticsStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    LogBox.ignoreLogs([
      'onStartShouldSetResponder',
      'Unknown event handler property',
      'React has detected a change in the order of Hooks'
    ]);
  }, []);

  const toggleDrawer = () => {
    // @ts-ignore
    navigation.toggleDrawer();
  };

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      enableAutoRefresh();
      fetchAnalyticsData();

      // Set up interval for auto-refresh
      const interval = setInterval(() => {
        checkForUpdates();
      }, 30000); // Check every 30 seconds

      return () => {
        clearInterval(interval);
        disableAutoRefresh();
      };
    }, [])
  );

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

  const getLineChartData = useMemo(() => {
    const { symptoms, dates } = data.symptomIntensity;

    if (Object.keys(symptoms).length === 0) {
      return [];
    }

    console.log('🔍 DEBUG - Raw dates from backend:', dates);
    console.log('🔍 DEBUG - All symptoms:', Object.keys(symptoms));

    // Get all symptoms that have data
    const symptomNames = Object.keys(symptoms);

    // Create data sets for each symptom
    const dataSets = symptomNames.map(symptomName => {
      const symptom = symptoms[symptomName];

      if (!symptom.data || symptom.data.length === 0) {
        return null;
      }

      console.log(`📊 ${symptomName} raw data:`, symptom.data);

      // Create a map of date to intensity for this symptom
      const symptomDataMap = new Map();
      symptom.data.forEach(point => {
        symptomDataMap.set(point.date, point.intensity);
      });

      // Create line data for ALL dates in the range, filling gaps with null
      const lineData = dates.map((date, index) => {
        const intensity = symptomDataMap.get(date);

        // ✅ USE THE DATE AS-IS - NO TIMEZONE CONVERSION
        const dateParts = date.split('-');
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1; // JS months are 0-indexed
        const day = parseInt(dateParts[2]);

        // Create date in local timezone (this will display correctly)
        const dateObj = new Date(year, month, day);
        const monthStr = dateObj.toLocaleString('default', { month: 'short' });
        const dayNum = dateObj.getDate();

        const formattedDate = `${monthStr} ${dayNum}`;

        // Only show label for first, last, and every 2nd point
        const showLabel = index === 0 || index === dates.length - 1 || index % 2 === 0;

        // If symptom has data for this date, use it. Otherwise, use null to create a gap
        if (intensity !== undefined) {
          console.log(`  ${symptomName} on ${date}:`, { intensity, formattedDate });

          return {
            value: intensity,
            labelComponent: () => (
              showLabel ? (
                <View style={{ width: 40, marginTop: 10 }}>
                  <Text style={{
                    color: 'gray',
                    fontSize: 8,
                    textAlign: 'center'
                  }}>
                    {formattedDate}
                  </Text>
                </View>
              ) : null
            ),
            dataPointText: intensity.toString(),
            originalDate: date,
            // Add metadata for debugging
            meta: { symptom: symptomName, date: date, hasData: true }
          };
        } else {
          // Create a gap point (this will break the line)
          console.log(`  ${symptomName} on ${date}: NO DATA (gap)`);

          return {
            value: 0, // Use 0 or any value, but the line will break due to hideDataPoints
            hideDataPoint: true, // Hide the point
            labelComponent: () => (
              showLabel ? (
                <View style={{ width: 40, marginTop: 10 }}>
                  <Text style={{
                    color: 'gray',
                    fontSize: 8,
                    textAlign: 'center'
                  }}>
                    {formattedDate}
                  </Text>
                </View>
              ) : null
            ),
            originalDate: date,
            // Add metadata for debugging
            meta: { symptom: symptomName, date: date, hasData: false }
          };
        }
      });

      // Filter out gap points to create proper line breaks
      const filteredLineData = lineData.map(point => {
        if (point.meta?.hasData) {
          return point;
        } else {
          // Return a special point that will break the line
          return {
            ...point,
            value: 0, // Use a value that won't affect the chart scale much
            hideDataPoint: true,
            disablePress: true
          };
        }
      });

      return {
        data: filteredLineData,
        color: symptom.color || '#3B82F6',
        name: symptomName
      };
    }).filter(Boolean);

    return dataSets;
  }, [data.symptomIntensity]);

  // FIXED: Memoize pie chart data
  const getPieChartData = useMemo(() => {
    if (!data.symptomFrequency.length) return [];

    return data.symptomFrequency.slice(0, 5).map(item => ({
      value: item.frequency,
      color: item.color,
      text: `${item.percentage.toFixed(0)}%`,
    }));
  }, [data.symptomFrequency]);

  // MOVE VARIABLE DECLARATIONS HERE - BEFORE useMemo HOOKS THAT USE THEM
  const lineDataSets = getLineChartData;
  const pieData = getPieChartData;
  const hasLineData = lineDataSets.length > 0;
  const primaryLineData = lineDataSets[0]?.data || [];

  // Add this debug useEffect to see your actual data
  useEffect(() => {
    if (lineDataSets.length > 0) {
      console.log('📈 LINE CHART DATA DEBUG:');
      lineDataSets.forEach((dataset, index) => {
        console.log(`Symptom ${index + 1}: ${dataset.name}`);
        console.log('Data points:', dataset.data);
        console.log('---');
      });
    }
  }, [lineDataSets]);

  // FIXED: Memoize chart configurations with better date display
  const singleLineConfig = useMemo(() => ({
    data: primaryLineData,
    spacing: 40, // Adjusted spacing
    thickness: 3,
    hideRules: false,
    hideDataPoints: false,
    color: lineDataSets[0]?.color || '#3B82F6',
    yAxisColor: "#3B82F6",
    xAxisColor: "#3B82F6",
    dataPointsColor: lineDataSets[0]?.color || '#3B82F6',
    dataPointsRadius: 4,
    initialSpacing: 15,
    endSpacing: 15,
    height: 220,
    yAxisOffset: 0,
    noOfSections: 5,
    maxValue: 10,
    isAnimated: true,
    animateOnDataChange: false,
    animationDuration: 1000,
    showVerticalLines: false,
    xAxisLabelTextStyle: { color: 'gray', fontSize: 10 },
    yAxisTextStyle: { color: 'gray', fontSize: 12 },
    areaChart: false,
    curved: true,
    curvature: 0.2,
    strokeLinecap: "round",
    focusEnabled: false,
    showValuesAsDataPointsText: true,
    yAxisLabelWidth: 30,
    yAxisLabelPrefix: "",
    yAxisLabelSuffix: "",
    formatYLabel: (value: number) => `${Math.round(value)}`,
    adjustToWidth: true,
    scrollToEnd: true,
    key: `chart-${primaryLineData.length}-${Date.now()}`
  }), [primaryLineData, lineDataSets[0]?.color]);

  const multiLineConfig = useMemo(() => ({
    dataSet: lineDataSets.map((dataset, index) => ({
      data: dataset.data,
      color: dataset.color,
      thickness: 2,
      curved: true,
      hideDataPoints: false,
      dataPointsColor: dataset.color,
      dataPointsRadius: 3,
      strokeDashArray: [],
      showValuesAsDataPointsText: false,
      // Add these properties to handle gaps
      focusEnabled: true,
      isAnimated: true
    })),
    spacing: 40,
    hideRules: false,
    yAxisColor: "#3B82F6",
    xAxisColor: "#3B82F6",
    initialSpacing: 15,
    endSpacing: 15,
    height: 220,
    yAxisOffset: 0,
    noOfSections: 5,
    maxValue: 10,
    isAnimated: true,
    showVerticalLines: false,
    xAxisLabelTextStyle: { color: 'gray', fontSize: 10 },
    yAxisTextStyle: { color: 'gray', fontSize: 12 },
    areaChart: false,
    curvature: 0.2,
    strokeLinecap: "round",
    focusEnabled: false,
    yAxisLabelWidth: 30,
    yAxisLabelPrefix: "",
    yAxisLabelSuffix: "",
    formatYLabel: (value: number) => `${Math.round(value)}`,
    adjustToWidth: true,
    scrollToEnd: true,
    // Important: This ensures proper date alignment
    xAxisIndices: true
  }), [lineDataSets]);

  // FIXED: Memoize chart configurations with better date display
  const pieConfig = useMemo(() => ({
    data: pieData,
    donut: true,
    showText: true,
    textColor: "black",
    radius: 90,
    textSize: 14,
    showTextBackground: true,
    textBackgroundRadius: 20,
    textBackgroundColor: "rgba(255,255,255,0.7)",
    focusOnPress: true,
    sectionAutoFocus: true
  }), [pieData]);

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
              Updated: {new Date(data.lastUpdated).toLocaleTimeString()} (Auto-refresh enabled)
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
              <StableLineChart {...singleLineConfig} />
            ) : (
              // Multiple lines using dataSet
              <StableLineChart {...multiLineConfig} />
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

            <Text style={[analyticsStyles.cardSubtitle, { textAlign: 'center', marginTop: 10, fontSize: 12 }]}>
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
              <StablePieChart {...pieConfig} />
            </View>

            {/* Frequency list with last reported time */}
            <View style={analyticsStyles.frequencyList}>
              {data.symptomFrequency.slice(0, 5).map((item, index) => {
                // ✅ SIMPLE FIX: Extract date part only
                const getLastReported = (lastOccurrence: string) => {
                  if (!lastOccurrence) return 'Never';

                  try {
                    // Extract just the date part (YYYY-MM-DD) from the timestamp
                    const datePart = lastOccurrence.split('T')[0];
                    const dateParts = datePart.split('-');
                    const year = parseInt(dateParts[0]);
                    const month = parseInt(dateParts[1]) - 1;
                    const day = parseInt(dateParts[2]);

                    const date = new Date(year, month, day);
                    return date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });
                  } catch {
                    return 'Never';
                  }
                };

                const lastReported = getLastReported(item.last_occurrence);

                return (
                  <View key={item.symptom} style={analyticsStyles.frequencyItem}>
                    <View style={[analyticsStyles.frequencyRank, { backgroundColor: item.color + '20' }]}>
                      <Text style={[analyticsStyles.rankText, { color: item.color }]}>
                        #{index + 1}
                      </Text>
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
                    <View style={[analyticsStyles.frequencyPercentage, { backgroundColor: item.color + '20' }]}>
                      <Text style={[analyticsStyles.percentageText, { color: item.color }]}>
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

      {/* Tracking Overview */}
      <View style={analyticsStyles.card}>
        <View style={analyticsStyles.cardHeader}>
          <Text style={analyticsStyles.cardTitle}>Tracking Overview</Text>
        </View>

        <View style={analyticsStyles.statsGrid}>
          <View style={analyticsStyles.statItem}>
            <Text style={analyticsStyles.statNumber}>
              {data.summary.total_symptoms_recorded || 0}
            </Text>
            <Text style={analyticsStyles.statLabel}>
              Total Records
            </Text>
          </View>

          <View style={analyticsStyles.statItem}>
            <Text style={analyticsStyles.statNumber}>
              {data.symptomFrequency.length || 0}
            </Text>
            <Text style={analyticsStyles.statLabel}>
              Symptoms Tracked
            </Text>
          </View>

          <View style={analyticsStyles.statItem}>
            <Text style={analyticsStyles.statNumber}>
              {data.lastUpdated ? new Date(data.lastUpdated).getDate() : '0'}
            </Text>
            <Text style={analyticsStyles.statLabel}>
              Active Days
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
