import { StyleSheet } from 'react-native';

export const chatStyles = StyleSheet.create({
  // Container styles
  safeArea: {
    flex: 1
  },
  container: {
    flex: 1,
    paddingHorizontal: 18
  },

  // Header styles
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 6
  },
  back: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#FFFFFFAA'
  },
  backText: {
    fontSize: 16
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F131A'
  },
  headerSpacer: {
    width: 32
  },

  // Card styles
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginTop: 14
  },
  secondaryCard: {
    marginTop: 10
  },
  cardText: {
    color: '#5B6472',
    textAlign: 'center'
  },

  // ScrollView styles
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingVertical: 10
  },

  // Loading styles
  loadingCard: {
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 8,
    color: '#5B6472'
  },

  // Error styles
  errorCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444'
  },
  errorTitle: {
    color: '#991B1B',
    fontWeight: '700',
    marginBottom: 6
  },
  errorText: {
    color: '#5B6472'
  },

  // Emergency styles
  emergencyCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444'
  },
  emergencyTitle: {
    color: '#991B1B',
    fontWeight: '700',
    marginBottom: 6
  },
  emergencyText: {
    color: '#5B6472'
  },

  // Advice styles
  adviceTitle: {
    fontWeight: '800',
    color: '#0F131A',
    marginBottom: 8
  },
  adviceItem: {
    marginBottom: 8
  },
  adviceStep: {
    color: '#0F131A',
    fontWeight: '700'
  },
  adviceDetails: {
    color: '#5B6472'
  },
  careTitle: {
    fontWeight: '800',
    color: '#0F131A',
    marginTop: 8,
    marginBottom: 4
  },
  careItem: {
    color: '#5B6472'
  },
  disclaimer: {
    color: '#6B7280',
    marginTop: 10
  },

  // Input bar styles
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 8,
    marginBottom: 14
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    color: '#0F131A'
  },
  sendBtn: {
    backgroundColor: '#0F131A',
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8
  },
  sendBtnDisabled: {
    opacity: 0.6
  },
  sendBtnText: {
    color: '#fff',
    fontWeight: '700'
  },
});
