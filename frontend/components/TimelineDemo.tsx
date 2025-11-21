// components/ui/TimelineDemo.tsx
import React from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { Timeline } from './Timeline';

export const TimelineDemo: React.FC = () => {
  const medicalData = [
    {
      title: "Current Health",
      content: (
        <View>
          <Text style={styles.contentText}>
            AI-powered health monitoring with real-time symptom tracking and personalized insights
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Symptoms Tracked</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>AI Consultations</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>15</Text>
              <Text style={styles.statLabel}>Medication Doses</Text>
            </View>
          </View>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>✅ 24/7 AI Doctor Companion</Text>
            <Text style={styles.featureItem}>✅ Medical Research RAG</Text>
            <Text style={styles.featureItem}>✅ Symptom Intensity Analysis</Text>
          </View>
        </View>
      ),
    },
    {
      title: "Last Month",
      content: (
        <View>
          <Text style={styles.contentText}>
            Implemented advanced AI features and expanded medical research database
          </Text>
          <View style={styles.achievements}>
            <Text style={styles.achievementItem}>• Added RAG context with 1M+ research papers</Text>
            <Text style={styles.achievementItem}>• Launched symptom intensity analyzer</Text>
            <Text style={styles.achievementItem}>• Integrated medical care locator</Text>
            <Text style={styles.achievementItem}>• Enhanced AI reminder system</Text>
          </View>
          <View style={styles.imagesGrid}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400' }}
              style={styles.image}
            />
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400' }}
              style={styles.image}
            />
          </View>
        </View>
      ),
    },
    {
      title: "Project Start",
      content: (
        <View>
          <Text style={styles.contentText}>
            Launched Health AI Companion with core medical AI capabilities
          </Text>
          <View style={styles.milestones}>
            <Text style={styles.milestoneItem}>🚀 Initial AI medical chat system</Text>
            <Text style={styles.milestoneItem}>📱 React Native mobile app</Text>
            <Text style={styles.milestoneItem}>🔒 Secure health data encryption</Text>
            <Text style={styles.milestoneItem}>📊 Basic symptom tracking</Text>
            <Text style={styles.milestoneItem}>⏰ Medication reminders</Text>
          </View>
          <View style={styles.imagesGrid}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400' }}
              style={styles.image}
            />
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=400' }}
              style={styles.image}
            />
          </View>
        </View>
      ),
    },
  ];

  return (
    <View style={styles.demoContainer}>
      <Timeline data={medicalData} />
    </View>
  );
};

const styles = StyleSheet.create({
  demoContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#3B82F6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  featureList: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
  },
  featureItem: {
    fontSize: 14,
    color: '#065F46',
    marginBottom: 8,
    fontWeight: '500',
  },
  achievements: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  achievementItem: {
    fontSize: 14,
    color: '#1E40AF',
    marginBottom: 8,
  },
  milestones: {
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  milestoneItem: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 8,
    fontWeight: '500',
  },
  imagesGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  image: {
    width: '48%',
    height: 120,
    borderRadius: 12,
  },
});
