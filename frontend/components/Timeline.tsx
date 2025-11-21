// components/ui/Timeline.tsx
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  Image,
  Animated,
  StyleSheet,
} from 'react-native';
import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

interface TimelineProps {
  data: TimelineEntry[];
}

export const Timeline: React.FC<TimelineProps> = ({ data }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [containerHeight, setContainerHeight] = useState(0);
  const { height: screenHeight } = useWindowDimensions();
  const scrollY = useSharedValue(0);

  const handleScroll = (event: any) => {
    scrollY.value = event.nativeEvent.contentOffset.y;
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Health Journey</Text>
        <Text style={styles.headerSubtitle}>
          Track your medical progress and milestones with AI-powered insights
        </Text>
      </View>

      {/* Timeline */}
      <ScrollView
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onContentSizeChange={(width, height) => setContainerHeight(height)}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        <View style={styles.timelineContainer}>
          {/* Timeline Line */}
          <View style={styles.timelineLine} />

          {data.map((item, index) => (
            <View key={index} style={styles.timelineItem}>
              {/* Timeline Dot */}
              <View style={styles.timelineDot}>
                <View style={styles.innerDot} />
              </View>

              {/* Content */}
              <View style={styles.content}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                {item.content}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F131A',
    marginBottom: 12,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  timelineContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  timelineLine: {
    position: 'absolute',
    left: 44,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#E2E8F0',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 60,
  },
  timelineDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  innerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
  itemTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F131A',
    marginBottom: 16,
  },
});
