// styles/profile.styles.ts (Enhanced Version)
import { StyleSheet } from 'react-native';

export const profileStyles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: '#F4F7FA',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 50,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },

  // Typography
  backText: {
    fontSize: 16,
    color: '#3B82F6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F131A',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F131A',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    color: '#0F131A',
    fontWeight: '600',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Components
  backButton: {
    marginRight: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },

  // Utility Styles (optional)
  textCenter: {
    textAlign: 'center',
  },
  mb10: {
    marginBottom: 10,
  },
  mt20: {
    marginTop: 20,
  },
});
