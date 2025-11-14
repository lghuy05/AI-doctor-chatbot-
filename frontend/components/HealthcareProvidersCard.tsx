// components/HealthcareProvidersCard.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  ScrollView,
  Alert,
} from 'react-native';
import { healthcareStyles } from '../app/styles/healthcareStyles';

interface HealthcareProvider {
  name: string;
  address: string;
  phone: string | null;
  website: string | null;
  rating: number | null;
  total_ratings: number | null;
  open_now: boolean | null;
  distance_km: number;
  place_id: string;
  types: string[];
  google_maps_url: string;
}

interface HealthcareRecommendations {
  providers: HealthcareProvider[];
  recommendation_reason: string;
  provider_type: string;
}

interface HealthcareProvidersCardProps {
  recommendations: HealthcareRecommendations;
}

const HealthcareProvidersCard: React.FC<HealthcareProvidersCardProps> = ({
  recommendations,
}) => {
  const { providers, recommendation_reason, provider_type } = recommendations;

  const handleOpenMaps = async (googleMapsUrl: string) => {
    try {
      const supported = await Linking.canOpenURL(googleMapsUrl);
      if (supported) {
        await Linking.openURL(googleMapsUrl);
      } else {
        Alert.alert('Error', 'Cannot open Google Maps on this device');
      }
    } catch (error) {
      console.error('Error opening maps:', error);
      Alert.alert('Error', 'Failed to open Google Maps');
    }
  };

  const handleCall = async (phoneNumber: string | null) => {
    if (!phoneNumber) {
      Alert.alert('No Phone Number', 'Phone number not available for this provider');
      return;
    }

    try {
      const phoneUrl = `tel:${phoneNumber}`;
      const supported = await Linking.canOpenURL(phoneUrl);
      if (supported) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Error', 'Cannot make phone calls on this device');
      }
    } catch (error) {
      console.error('Error making call:', error);
      Alert.alert('Error', 'Failed to make phone call');
    }
  };

  const handleOpenWebsite = async (websiteUrl: string | null) => {
    if (!websiteUrl) {
      Alert.alert('No Website', 'Website not available for this provider');
      return;
    }

    try {
      const supported = await Linking.canOpenURL(websiteUrl);
      if (supported) {
        await Linking.openURL(websiteUrl);
      } else {
        Alert.alert('Error', 'Cannot open website on this device');
      }
    } catch (error) {
      console.error('Error opening website:', error);
      Alert.alert('Error', 'Failed to open website');
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Text key={`star-${i}`} style={healthcareStyles.starIcon}>⭐</Text>);
    }

    if (hasHalfStar) {
      stars.push(<Text key="half-star" style={healthcareStyles.starIcon}>⭐</Text>);
    }

    return stars;
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  if (!providers || providers.length === 0) {
    return (
      <View style={healthcareStyles.healthcareCard}>
        <View style={healthcareStyles.header}>
          <Text style={healthcareStyles.headerIcon}>🏥</Text>
          <Text style={healthcareStyles.headerTitle}>Healthcare Providers</Text>
        </View>
        <View style={healthcareStyles.noProviders}>
          <Text style={healthcareStyles.noProvidersText}>
            No healthcare providers found in your area.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={healthcareStyles.healthcareCard}>
      {/* Header */}
      <View style={healthcareStyles.header}>
        <Text style={healthcareStyles.headerIcon}>🏥</Text>
        <Text style={healthcareStyles.headerTitle}>Recommended Providers</Text>
        <Text style={healthcareStyles.providerType}>
          {provider_type}
        </Text>
      </View>

      {/* Recommendation Reason */}
      <View style={healthcareStyles.recommendationReason}>
        <Text style={healthcareStyles.reasonText}>
          {recommendation_reason}
        </Text>
      </View>

      {/* Providers List */}
      <ScrollView style={healthcareStyles.providersContainer}>
        {providers.map((provider, index) => (
          <View key={provider.place_id} style={healthcareStyles.providerCard}>
            {/* Provider Header */}
            <View style={healthcareStyles.providerHeader}>
              <Text style={healthcareStyles.providerName}>
                {provider.name}
              </Text>
              <View style={healthcareStyles.distanceBadge}>
                <Text style={healthcareStyles.distanceText}>
                  {formatDistance(provider.distance_km)}
                </Text>
              </View>
            </View>

            {/* Provider Details */}
            <View style={healthcareStyles.providerDetails}>
              <Text style={healthcareStyles.address}>
                📍 {provider.address}
              </Text>

              {provider.phone && (
                <View style={healthcareStyles.contactInfo}>
                  <Text style={healthcareStyles.icon}>📞</Text>
                  <Text style={healthcareStyles.contactText}>
                    {provider.phone}
                  </Text>
                </View>
              )}
            </View>

            {/* Rating and Status */}
            <View style={healthcareStyles.ratingSection}>
              {provider.rating && (
                <View style={healthcareStyles.ratingContainer}>
                  {renderStars(provider.rating)}
                  <Text style={healthcareStyles.rating}>
                    {provider.rating}
                  </Text>
                  {provider.total_ratings && (
                    <Text style={healthcareStyles.ratingCount}>
                      ({provider.total_ratings})
                    </Text>
                  )}
                </View>
              )}

              {provider.open_now !== null && (
                <View style={[
                  healthcareStyles.statusBadge,
                  provider.open_now ? healthcareStyles.statusOpen : healthcareStyles.statusClosed
                ]}>
                  <Text style={healthcareStyles.icon}>
                    {provider.open_now ? '🟢' : '🔴'}
                  </Text>
                  <Text style={[
                    healthcareStyles.statusText,
                    provider.open_now ? healthcareStyles.statusOpenText : healthcareStyles.statusClosedText
                  ]}>
                    {provider.open_now ? 'Open Now' : 'Closed'}
                  </Text>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={healthcareStyles.actionButtons}>
              <TouchableOpacity
                style={healthcareStyles.mapButton}
                onPress={() => handleOpenMaps(provider.google_maps_url)}
              >
                <Text style={healthcareStyles.icon}>🗺️</Text>
                <Text style={healthcareStyles.buttonText}>Open Maps</Text>
              </TouchableOpacity>

              {provider.phone && (
                <TouchableOpacity
                  style={healthcareStyles.callButton}
                  onPress={() => handleCall(provider.phone)}
                >
                  <Text style={healthcareStyles.icon}>📞</Text>
                </TouchableOpacity>
              )}

              {provider.website && (
                <TouchableOpacity
                  style={healthcareStyles.websiteButton}
                  onPress={() => handleOpenWebsite(provider.website)}
                >
                  <Text style={healthcareStyles.icon}>🌐</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default HealthcareProvidersCard;
