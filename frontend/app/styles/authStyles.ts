// styles/authStyles.ts
import { StyleSheet } from 'react-native';

export const authStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    paddingTop: 56,
    backgroundColor: '#F8FAFC'
  },
  scrollView: {
    flex: 1,
  },

  // Header styles
  back: {
    position: 'absolute',
    top: 56,
    left: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  backText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3B82F6',
  },

  // Hero Section
  hero: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 30,
    backgroundColor: 'linear-gradient(135deg, #A5B4FC 0%, #C4B5FD 100%)',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F131A',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },

  // Card styles
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    margin: 20,
    marginTop: -20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 6,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F131A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subheader: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },

  // Section labels
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F131A',
    marginTop: 16,
    marginBottom: 12,
    marginLeft: 4,
  },

  // Input styles
  input: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 18,
    marginVertical: 8,
    fontSize: 16,
    color: '#0F131A',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    fontWeight: '500',
  },
  inputFocused: {
    borderColor: '#3B82F6',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 2,
    backgroundColor: '#FEF2F2',
  },

  // Gender/Role Selection styles
  genderContainer: {
    marginVertical: 8,
  },
  genderLabel: {
    fontSize: 16,
    color: '#0F131A',
    marginBottom: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  genderOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  genderOption: {
    flex: 1,
    height: 52,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  genderOptionSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  genderOptionText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 15,
  },
  genderOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Error text
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 8,
    marginLeft: 4,
    fontWeight: '500',
  },

  // Button styles
  submit: {
    height: 58,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 16,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitDisabled: {
    opacity: 0.6,
    backgroundColor: '#9CA3AF',
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  // Footer styles
  footerText: {
    textAlign: 'center',
    marginTop: 8,
    color: '#64748B',
    fontSize: 15,
    fontWeight: '500',
  },
  link: {
    color: '#3B82F6',
    fontWeight: '700',
  },

  // App Intro Section
  introSection: {
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    marginTop: 0,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  introTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 8,
    textAlign: 'center',
  },
  introText: {
    fontSize: 14,
    color: '#047857',
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Feature Highlights
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
  },
  featureItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  featureLabel: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
    textAlign: 'center',
  },
});

// Color constants
export const authColors = {
  primary: '#3B82F6',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  background: {
    blue: '#EFF6FF',
    green: '#F0FDF4',
    orange: '#FFFBEB',
    purple: '#F5F3FF',
  }
};
