import { StyleSheet } from 'react-native';

export const authStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    paddingTop: 56,
    paddingHorizontal: 18,
    backgroundColor: '#F4F7FA'
  },
  scrollView: {
    flex: 1,
  },

  // Header styles
  back: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#FFFFFFAA',
    marginBottom: 8,
    zIndex: 1,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },

  // Card styles
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F131A',
    marginBottom: 24,
    textAlign: 'center',
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
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    marginVertical: 8,
    fontSize: 16,
    color: '#0F131A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 1,
    backgroundColor: '#FEF2F2',
  },

  // Gender Selection styles
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
    height: 48,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  genderOptionSelected: {
    backgroundColor: '#0F131A',
    borderColor: '#0F131A',
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
    height: 56,
    borderRadius: 14,
    backgroundColor: '#0F131A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },

  // Footer styles
  footerText: {
    textAlign: 'center',
    marginTop: 8,
    color: '#64748B',
    fontSize: 15,
  },
  link: {
    color: '#0F131A',
    fontWeight: '700',
  },
});
