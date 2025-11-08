// styles/analyticsStyles.ts - COMPLETELY UPDATED
import { StyleSheet } from 'react-native';

export const analyticsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 8,
  },
  menuButton: {
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
  },
  menuText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3B82F6',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F131A',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  headerSpacer: {
    width: 40,
  },

  // Card Styles
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F131A',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },

  // Chart Styles
  chartContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    minHeight: 200,
    justifyContent: 'center',
  },
  chartWrapper: {
    alignItems: 'center',
    marginBottom: 8,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
    textAlign: 'center',
  },

  // Time Range Selector
  timeRangeButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timeRangeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },

  // Quick Stats
  quickStats: {
    marginTop: 12,
  },
  quickStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  quickStatText: {
    fontSize: 12,
    color: '#64748B',
  },

  // Frequency List
  frequencyList: {
    marginTop: 12,
  },
  frequencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  frequencyRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B82F6',
  },
  frequencyInfo: {
    flex: 1,
  },
  frequencySymptom: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F131A',
    marginBottom: 2,
  },
  frequencyCount: {
    fontSize: 12,
    color: '#64748B',
  },
  frequencyPercentage: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#3B82F6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },

  // Empty States
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Error States
  errorCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Info Card
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '600',
    marginBottom: 8,
  },
  infoNote: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  // Add to your analyticsStyles.ts
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  // Add to your existing analyticsStyles.ts
  lastReportedText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});

