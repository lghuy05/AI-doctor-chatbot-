import { StyleSheet } from 'react-native';

export const chatStyles = StyleSheet.create({
  // Container styles
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    backgroundColor: '#F8FAFC',
  },

  // Header styles
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#F8FAFC',
  },
  back: {
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
  backText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3B82F6',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F131A',
    letterSpacing: -0.5,
  },
  headerSpacer: {
    width: 40,
  },

  // Card styles
  card: {
    backgroundColor: '#fff',
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
  },
  secondaryCard: {
    marginTop: 10,
    backgroundColor: '#F0F9FF',
    borderColor: '#E0F2FE',
  },
  cardText: {
    color: '#5B6472',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },

  // Status cards
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  warningCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 6,
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
    lineHeight: 20,
  },

  // ScrollView styles
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 12,
  },

  // Loading styles
  loadingCard: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  loadingText: {
    marginTop: 8,
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },

  // Error styles
  errorCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  errorTitle: {
    color: '#991B1B',
    fontWeight: '700',
    marginBottom: 6,
    fontSize: 16,
  },
  errorText: {
    color: '#7F1D1D',
    fontSize: 14,
    lineHeight: 20,
  },

  // Emergency styles
  emergencyCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  emergencyTitle: {
    color: '#991B1B',
    fontWeight: '800',
    marginBottom: 8,
    fontSize: 18,
  },
  emergencyText: {
    color: '#7F1D1D',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  emergencyActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 10,
  },
  emergencyButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryEmergencyButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#DC2626',
  },
  emergencyButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryEmergencyButtonText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 15,
  },

  // Advice styles
  adviceTitle: {
    fontWeight: '800',
    color: '#0F131A',
    marginBottom: 12,
    fontSize: 18,
    letterSpacing: -0.3,
  },
  adviceItem: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  adviceStep: {
    color: '#0F131A',
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 4,
  },
  adviceDetails: {
    color: '#5B6472',
    fontSize: 14,
    lineHeight: 20,
  },
  careTitle: {
    fontWeight: '800',
    color: '#0F131A',
    marginTop: 16,
    marginBottom: 8,
    fontSize: 16,
  },
  careItem: {
    color: '#5B6472',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
    paddingLeft: 8,
  },
  disclaimer: {
    color: '#6B7280',
    marginTop: 16,
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
    textAlign: 'center',
  },

  // Input bar styles
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    marginBottom: 20,
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  input: {
    flex: 1,
    height: 44,
    paddingHorizontal: 16,
    color: '#0F131A',
    fontSize: 16,
    fontWeight: '500',
  },
  inputWarning: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  sendBtn: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    shadowColor: '#3B82F6',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  sendBtnWarning: {
    backgroundColor: '#F59E0B',
  },
  sendBtnDisabled: {
    opacity: 0.6,
    shadowOpacity: 0.1,
  },
  sendBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: -0.2,
  },

  // Retry button styles
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 12,
    shadowColor: '#3B82F6',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },

  // New utility styles for better spacing
  spaceY: {
    marginVertical: 8,
  },
  textSm: {
    fontSize: 12,
  },
  textMd: {
    fontSize: 14,
  },
  textLg: {
    fontSize: 16,
  },
});
