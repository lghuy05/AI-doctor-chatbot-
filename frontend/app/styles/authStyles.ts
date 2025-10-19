import { StyleSheet } from 'react-native';

export const authStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    paddingTop: 56,
    paddingHorizontal: 18,
    backgroundColor: '#F4F7FA'
  },

  // Header styles
  back: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#FFFFFFAA',
    marginBottom: 8
  },
  backText: { fontSize: 16 },

  // Card styles
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2
  },
  header: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F131A',
    marginBottom: 12,
  },

  // Input styles
  input: {
    height: 46,
    borderRadius: 10,
    backgroundColor: '#F4F7FA',
    paddingHorizontal: 12,
    marginVertical: 6,
    fontSize: 16,
    color: '#0F131A',
  },

  // Button styles
  submit: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#0F131A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Footer styles
  footerText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#6B7280',
  },
  link: {
    color: '#0F131A',
    fontWeight: '700',
  },
});
