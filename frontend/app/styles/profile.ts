// styles/profile.styles.ts (Enhanced Beautiful Version)
import { StyleSheet } from 'react-native';

export const profileStyles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 60,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },

  // Typography
  backText: {
    fontSize: 17,
    color: '#3B82F6',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F131A',
    letterSpacing: -0.5,
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // Balance the back button space
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F131A',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  label: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    color: '#0F131A',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 12,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  // Components
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 40,
    shadowColor: '#EF4444',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },

  // Enhanced medication and condition styles
  medicationItem: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  conditionItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Status badges
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  statusActive: {
    backgroundColor: '#DCFCE7',
    color: '#166534',
  },
  statusInactive: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },

  // Utility Styles
  textCenter: {
    textAlign: 'center',
  },
  mb10: {
    marginBottom: 10,
  },
  mt20: {
    marginTop: 20,
  },
  mt16: {
    marginTop: 16,
  },
  mb16: {
    marginBottom: 16,
  },
  px20: {
    paddingHorizontal: 20,
  },

  // Refresh and loading styles
  refreshContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  lastUpdated: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
  },

  // Error state styles
  errorState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
