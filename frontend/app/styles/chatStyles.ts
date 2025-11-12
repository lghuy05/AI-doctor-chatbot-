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
    fontSize: 22,
    fontWeight: '800',
    color: '#0F131A',
    letterSpacing: -0.5,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  clearButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 14,
  },

  // ScrollView styles
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 12,
  },

  // Message container styles
  messageContainer: {
    marginBottom: 16,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  // Bubble styles
  userBubble: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    maxWidth: '80%',
  },
  aiBubble: {
    maxWidth: '90%',
    width: '100%',
  },
  userText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 20,
  },

  // Base card style
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

  // Specialized card variants
  welcomeCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F131A',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },

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

  // Diagnosis card styles
  diagnosisCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
    backgroundColor: '#F8FAFC',
  },
  diagnosisTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F131A',
    marginBottom: 12,
  },
  diagnosisList: {
    marginBottom: 12,
  },
  diagnosisItem: {
    marginBottom: 6,
  },
  diagnosisText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '600',
    lineHeight: 20,
  },

  // Reasoning styles
  reasoningContainer: {
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0EA5E9',
  },
  reasoningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 6,
  },
  reasoningText: {
    fontSize: 14,
    color: '#0C4A6E',
    lineHeight: 20,
  },

  // Symptom analysis styles
  symptomCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    backgroundColor: '#F8FAFC',
  },
  symptomTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F131A',
    marginBottom: 16,
  },
  severityMeter: {
    marginBottom: 16,
  },
  severityLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  severityLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  severityBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  severityFill: {
    height: '100%',
    borderRadius: 4,
  },
  severityValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  symptomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 4,
  },
  symptomName: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    width: '40%',
  },
  symptomIntensity: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  symptomIntensityBar: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  symptomIntensityText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    width: '15%',
    textAlign: 'right',
  },

  // Advice card styles
  adviceCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
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
  adviceStepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  adviceStepNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  adviceStep: {
    color: '#0F131A',
    fontWeight: '700',
    fontSize: 15,
    flex: 1,
  },
  adviceDetails: {
    color: '#5B6472',
    fontSize: 14,
    lineHeight: 20,
  },

  // Warning/Care styles
  warningCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 6,
  },
  careItem: {
    marginBottom: 8,
  },
  careText: {
    fontSize: 14,
    color: '#92400E',
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

  // Disclaimer card
  disclaimerCard: {
    backgroundColor: '#FEFCE8',
    borderLeftColor: '#EAB308',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#713F12',
    fontStyle: 'italic',
    lineHeight: 16,
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

  // REMINDER POPUP STYLES (keep these as they are)
  reminderPopup: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  reminderPopupContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  reminderPopupTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#0F131A',
  },
  reminderPopupSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  reminderSuggestionsList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  reminderSuggestionItem: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reminderSuggestionContent: {
    flex: 1,
    marginRight: 12,
  },
  reminderSuggestionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#0F131A',
  },
  reminderSuggestionDesc: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 6,
    lineHeight: 18,
  },
  reminderSuggestionTime: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  reminderAddButton: {
    backgroundColor: '#3B82F6',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  reminderAddButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  reminderPopupActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  reminderPopupButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  reminderPopupButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  reminderPopupButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  reminderPopupButtonTextSecondary: {
    color: '#3B82F6',
    fontWeight: 'bold',
    fontSize: 16,
  },
  timeSelectionContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  timeSelectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  timeInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  timeInputText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  dayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    margin: 2,
  },
  dayButtonActive: {
    backgroundColor: '#3B82F6',
  },
  dayButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  dayButtonTextActive: {
    color: '#FFFFFF',
  },
  frequencyText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
  },

  // Utility styles
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
