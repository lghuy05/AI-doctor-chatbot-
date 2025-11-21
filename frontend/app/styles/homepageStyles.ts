// styles/homepageStyles.ts
import { StyleSheet } from 'react-native';

export const homepageStyles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // Hero Section with Gradient
  hero: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: 'linear-gradient(135deg, #A5B4FC 0%, #C4B5FD 50%, #DDD6FE 100%)',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 8,
  },
  menuButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    zIndex: 10,
  },
  menuIcon: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  heroContent: {
    marginTop: 40,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#0F131A',
    letterSpacing: -0.8,
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },

  // Colorful Stats Section
  statsSection: {
    padding: 20,
    paddingTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    width: '48%',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Quick Actions with Colorful Backgrounds
  quickActions: {
    padding: 20,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F131A',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    width: '48%',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionIconText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F131A',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },

  // Colorful Features Section
  featuresSection: {
    padding: 20,
    paddingTop: 8,
  },
  featuresGrid: {
    gap: 16,
  },
  featureCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureIconText: {
    fontSize: 20,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F131A',
    flex: 1,
  },
  featureDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  featureHighlight: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    padding: 8,
    borderRadius: 8,
  },
  highlightText: {
    fontSize: 12,
    color: '#374151',
    fontStyle: 'italic',
    textAlign: 'center',
    fontWeight: '500',
  },

  // Trust & Security Section
  trustSection: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginTop: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  trustTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F131A',
    marginBottom: 20,
    textAlign: 'center',
  },
  trustGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trustItem: {
    alignItems: 'center',
    flex: 1,
  },
  trustIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  trustIconText: {
    fontSize: 20,
  },
  trustLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
  },

  // Footer
  footer: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Utility Classes
  textCenter: {
    textAlign: 'center',
  },
  mt16: {
    marginTop: 16,
  },
  mb16: {
    marginBottom: 16,
  },
  mt24: {
    marginTop: 24,
  },
  mb24: {
    marginBottom: 24,
  },
  px20: {
    paddingHorizontal: 20,
  },
});

// Color constants for easy reference
export const colors = {
  primary: {
    blue: '#3B82F6',
    green: '#10B981',
    orange: '#F59E0B',
    purple: '#8B5CF6',
    pink: '#EC4899',
    cyan: '#06B6D4',
    red: '#EF4444',
  },
  background: {
    blue: '#EFF6FF',
    green: '#F0FDF4',
    orange: '#FFFBEB',
    purple: '#FEF7FF',
    pink: '#FEF6FF',
    cyan: '#EFF8FF',
    red: '#FEF2F2',
  },
  text: {
    primary: '#0F131A',
    secondary: '#4B5563',
    tertiary: '#64748B',
    white: '#FFFFFF',
  },
  gradient: {
    hero: ['#A5B4FC', '#C4B5FD', '#DDD6FE'],
    blue: ['#3B82F6', '#60A5FA'],
    green: ['#10B981', '#34D399'],
    orange: ['#F59E0B', '#FBBF24'],
  },
};
