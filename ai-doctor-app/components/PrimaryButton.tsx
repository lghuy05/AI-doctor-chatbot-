// ------------------------------------------------------
// Step 1: Import React Native components
// ------------------------------------------------------
// Pressable → handles touch interactions with feedback
// Text → displays the button label
// View → provides a wrapper for shadows and layout
// StyleSheet → holds consistent, reusable styles
import { Pressable, Text, StyleSheet, View } from 'react-native';

// ------------------------------------------------------
// Step 2: Define the PrimaryButton component
// ------------------------------------------------------
// Props:
// - title: text label shown on the button
// - onPress: callback function when the button is tapped
// - variant: determines button style ("primary" or "secondary")
export default function PrimaryButton({
  title,
  onPress,
  variant = 'primary',
}: {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
}) {
  // Step 2a: Check if this button uses the secondary variant
  const isSecondary = variant === 'secondary';

  // Step 2b: Return the rendered button
  return (
    // Shadow wrapper for elevation on Android and shadow on iOS
    <View style={[styles.shadowWrap, isSecondary && styles.secondaryShadow]}>
      {/* Step 3: Pressable provides visual feedback when pressed */}
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.base,
          isSecondary ? styles.secondary : styles.primary, // toggle style by variant
          pressed && { opacity: 0.85 }, // visual feedback when pressed
        ]}
      >
        {/* Step 4: Render button text */}
        <Text style={[styles.text, isSecondary && styles.secondaryText]}>
          {title}
        </Text>
      </Pressable>
    </View>
  );
}

// ------------------------------------------------------
// Step 5: Define consistent button styles
// ------------------------------------------------------
// Shadow, shape, and text design follow consistent UI guidelines
const styles = StyleSheet.create({
  // Outer wrapper: adds rounded corners and a light shadow
  shadowWrap: {
    borderRadius: 28,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3, // Android shadow
  },

  // Lighter shadow for secondary variant
  secondaryShadow: { shadowOpacity: 0.04 },

  // Base style shared by both variants
  base: {
    height: 48,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    minWidth: 220,
  },

  // Solid black background for primary button
  primary: { backgroundColor: '#0F131A' },

  // Light background for secondary button
  secondary: { backgroundColor: '#F1F5F9' },

  // Default text style (white text)
  text: { color: '#fff', fontSize: 16, fontWeight: '600' },

  // Dark text for secondary variant
  secondaryText: { color: '#0F131A' },
});
