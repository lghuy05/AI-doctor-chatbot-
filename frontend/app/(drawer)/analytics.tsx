// app/(drawer)/analytics.tsx - COMPLETE WITH GIFTED CHARTS
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { useNavigation } from 'expo-router';
import { analyticsStyles } from '../styles/analyticsStyles';
import { useState, useEffect } from 'react';
import { useAnalyticsStore } from '../../hooks/useAnalyticsStore';
import { PieChart, LineChart, BarChart } from 'react-native-gifted-charts';

const { width: screenWidth } = Dimensions.get('window');

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

  // Transform data for Bar Chart (Symptom Intensity)
  const getBarChartData = () => {
    if (!data.symptomIntensity.dates.length) return [];

    return Object.values(data.symptomIntensity.symptoms).map(symptom => {
      const avgIntensity = symptom.data.length > 0
        ? symptom.data.reduce((sum, point) => sum + point.intensity, 0) / symptom.data.length
        : 0;

      return {
        value: Math.round(avgIntensity * 10) / 10,
        label: symptom.name.substring(0, 6), // Shorten long names
        frontColor: symptom.color,
        topLabelComponent: () => (
          <Text style={{ color: symptom.color, fontSize: 12, marginBottom: 2 }}>
            {Math.round(avgIntensity * 10) / 10}
          </Text>
        ),
      };
    });
  };

  // Transform data for Pie Chart (Symptom Frequency)
  const getPieChartData = () => {
    if (!data.symptomFrequency.length) return [];

    return data.symptomFrequency.slice(0, 5).map(item => ({
      value: item.frequency,
      color: item.color,
      text: `${item.percentage.toFixed(0)}%`,
      textColor: 'white',
      fontWeight: 'bold',
    }));
  };

  // Transform data for Line Chart (Symptom Trends Over Time)
  const getLineChartData = () => {
    if (!data.symptomIntensity.dates.length) return [];

    // Get the 3 most frequent symptoms for the line chart
    const topSymptoms = Object.values(data.symptomIntensity.symptoms)
      .slice(0, 3);

    if (topSymptoms.length === 0) return [];

    // Create data points for each symptom over the last 7 days
    const recentDates = data.symptomIntensity.dates.slice(-7);

    const lineData = recentDates.map((date, index) => {
      const dataPoint: any = {
        value: 0,
        label: new Date(date).getDate().toString(),
        labelTextStyle: { color: '#64748B', fontSize: 10 },
      };

      // Add data for each top symptom
      topSymptoms.forEach((symptom, symptomIndex) => {
        const point = symptom.data.find(p => p.date === date);
        dataPoint[`value${symptomIndex + 1}`] = point ? point.intensity : 0;
      });

      return dataPoint;
    });

    return lineData;
  };

  const barData = getBarChartData();
  const pieData = getPieChartData();
  const lineData = getLineChartData();
  const topSymptoms = Object.values(data.symptomIntensity.symptoms).slice(0, 3);

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
              barWidth={35}
              spacing={25}
              roundedTop
              roundedBottom
              hideRules
              xAxisThickness={0}
              yAxisThickness={0}
              yAxisTextStyle={{ color: '#64748B', fontSize: 10 }}
              noOfSections={5}
              maxValue={10}
              height={200}
              showFractionalValues
              frontColor="lightgray"
              gradientColor="#3B82F6"
              // @ts-ignore - gifted charts types might not be perfect
              formatYLabel={(value: string) => Math.round(parseFloat(value)).toString()}
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

      {/* Symptom Trends Line Chart */}
      {lineData.length > 0 && topSymptoms.length > 0 && (
        <View style={analyticsStyles.card}>
          <Text style={analyticsStyles.cardTitle}>Symptom Trends</Text>
          <Text style={analyticsStyles.cardSubtitle}>
            How your top symptoms have changed over time
          </Text>

          <View style={analyticsStyles.chartContainer}>
            <LineChart
              data={lineData}
              height={200}
              spacing={40}
              initialSpacing={10}
              color1="#3B82F6"
              color2="#EF4444"
              color3="#10B981"
              thickness={3}
              hideRules
              xAxisColor="lightgray"
              yAxisColor="lightgray"
              yAxisTextStyle={{ color: '#64748B', fontSize: 10 }}
              xAxisLabelTextStyle={{ color: '#64748B', fontSize: 10 }}
              dataPointsColor1="#3B82F6"
              dataPointsColor2="#EF4444"
              dataPointsColor3="#10B981"
              dataPointsRadius={4}
              curved
            />

            {/* Line Chart Legend */}
            <View style={analyticsStyles.quickStats}>
              {topSymptoms.map((symptom, index) => {
                const colors = ['#3B82F6', '#EF4444', '#10B981'];
                return (
                  <View key={symptom.name} style={analyticsStyles.quickStat}>
                    <View style={[analyticsStyles.colorDot, { backgroundColor: colors[index] }]} />
                    <Text style={analyticsStyles.quickStatText}>
                      {symptom.name}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      )}

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
