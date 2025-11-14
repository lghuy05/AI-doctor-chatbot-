// styles/healthcareStyles.ts
import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const healthcareStyles = StyleSheet.create({
  // Main card container
  healthcareCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginTop: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },

  // Header section
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F131A',
    flex: 1,
  },
  providerType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  // Recommendation reason
  recommendationReason: {
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  reasonText: {
    fontSize: 14,
    color: '#065F46',
    lineHeight: 20,
    fontWeight: '500',
  },

  // Providers list
  providersContainer: {
    marginTop: 8,
  },
  providerCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  providerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F131A',
    flex: 1,
    marginRight: 8,
  },
  distanceBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Provider details
  providerDetails: {
    marginBottom: 12,
  },
  address: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 6,
    lineHeight: 18,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 14,
    color: '#475569',
    marginLeft: 6,
  },

  // Rating and status section
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F131A',
    marginRight: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: '#64748B',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusOpen: {
    backgroundColor: '#D1FAE5',
  },
  statusClosed: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  statusOpenText: {
    color: '#065F46',
  },
  statusClosedText: {
    color: '#991B1B',
  },

  // Action buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mapButton: {
    backgroundColor: '#3B82F6',
    flex: 1,
    marginRight: 8,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  callButton: {
    backgroundColor: '#10B981',
    width: 44,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  websiteButton: {
    backgroundColor: '#8B5CF6',
    width: 44,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },

  // No providers message
  noProviders: {
    alignItems: 'center',
    padding: 20,
  },
  noProvidersText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Utility styles
  icon: {
    fontSize: 16,
  },
  starIcon: {
    fontSize: 14,
    color: '#F59E0B',
    marginRight: 2,
  },
});
