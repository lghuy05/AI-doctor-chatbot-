// ------------------------------------------------------
// Step 1: Import React + React Native building blocks
// ------------------------------------------------------
import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator, ScrollView
} from 'react-native';
import { router } from 'expo-router';

// ------------------------------------------------------
// Step 2: Point to your API (works on simulators/emulators)
//  - iOS Simulator / Web: localhost
//  - Android Emulator: 10.0.2.2
//  - Physical device: replace with your computer’s LAN IP (e.g., http://192.168.1.23:8000)
// ------------------------------------------------------
const BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:8000' // Android emulator -> host machine
    : 'http://localhost:8000'; // iOS Simulator (or web). For real device: use LAN IP.

// ------------------------------------------------------
// Step 3: Create a tiny POST helper with timeout + good errors
//  - Uses AbortController to avoid requests hanging forever
//  - Surfaces server text when status is not OK
// ------------------------------------------------------
async function postJSON(path: string, body: any, timeoutMs = 20000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const text = await res.text();
    if (!res.ok) {
      // include status + body text to help debugging
      throw new Error(`${res.status} ${res.statusText}: ${text || '(no body)'}`);
    }

    // Try to parse JSON; throw helpful error if server returned non-JSON
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Invalid JSON from ${path}: ${text.slice(0, 200)}`);
    }
  } finally {
    clearTimeout(t);
  }
}

// ------------------------------------------------------
// Step 4: Build the screen (same UI/flow you had)
//  - On Send: call /triage → if emergency, show banner
//             else call /advice and render steps
// ------------------------------------------------------
export default function ChatIntroScreen() {
  // Step 4a: Local UI state
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 4b: Output can be one of:
  //  - error    → show error card
  //  - emergency→ show emergency notice card
  //  - advice   → render advice JSON from API
  const [output, setOutput] = useState<null | {
    emergency?: boolean;
    advice?: {
      advice: { step: string; details: string }[];
      when_to_seek_care: string[];
      disclaimer: string;
    };
    error?: string;
    notice?: string;
  }>(null);

  // ------------------------------------------------------
  // Step 5: Send handler
  //  - Guards against empty/duplicate sends
  //  - Calls /triage first, then /advice if routine
  // ------------------------------------------------------
  const send = async () => {
    const text = message.trim();
    if (!text || loading) return;

    setLoading(true);
    setOutput(null);


    try {
      // 5a) TRIAGE FIRST
      const payload = { age: 30, sex: 'female', symptoms: text, meds: [], conditions: [] };
      const triage = await postJSON('/triage', payload);

      if (triage.risk === 'emergency') {
        // 5b) EARLY EXIT IF EMERGENCY
        setOutput({ emergency: true, notice: 'Possible emergency. Please call 911 (or local equivalent).' });
        return;
      }

      // 5c) OTHERWISE GET PATIENT ADVICE
      const advice = await postJSON('/advice', payload);
      setOutput({ advice });
    } catch (e: any) {
      // 5d) SURFACE HELPFUL ERROR MESSAGE
      setOutput({ error: e?.message ?? 'Something went wrong.' });
    } finally {
      // 5e) ALWAYS RESET LOADING + CLEAR INPUT
      setLoading(false);
      setMessage('');
    }
  };

  // ------------------------------------------------------
  // Step 6: Render UI (header, notices, results, input bar)
  // ------------------------------------------------------
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Text style={{ fontSize: 16 }}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>AI Doctor App</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Safety notices */}
        <View style={styles.card}>
          <Text style={styles.cardText}>In instances of a medical emergency, please dial 911.</Text>
        </View>
        <View style={[styles.card, { marginTop: 10 }]}>
          <Text style={styles.cardText}>Suggestions are subject to error; verify with your primary care doctor.</Text>
        </View>

        {/* Results */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 10 }}>
          {loading && (
            <View style={[styles.card, { alignItems: 'center' }]}>
              <ActivityIndicator />
              <Text style={{ marginTop: 8, color: '#5B6472' }}>Thinking…</Text>
            </View>
          )}

          {!!output?.error && (
            <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: '#EF4444' }]}>
              <Text style={{ color: '#991B1B', fontWeight: '700', marginBottom: 6 }}>Error</Text>
              <Text style={{ color: '#5B6472' }}>{output.error}</Text>
            </View>
          )}

          {!!output?.emergency && (
            <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: '#EF4444' }]}>
              <Text style={{ color: '#991B1B', fontWeight: '700', marginBottom: 6 }}>Emergency</Text>
              <Text style={{ color: '#5B6472' }}>{output.notice}</Text>
            </View>
          )}

          {!!output?.advice && (
            <View style={styles.card}>
              <Text style={{ fontWeight: '800', color: '#0F131A', marginBottom: 8 }}>At-home steps</Text>
              {output.advice.advice?.map((a, idx) => (
                <View key={idx} style={{ marginBottom: 8 }}>
                  <Text style={{ color: '#0F131A', fontWeight: '700' }}>{a.step}</Text>
                  <Text style={{ color: '#5B6472' }}>{a.details}</Text>
                </View>
              ))}

              {!!output.advice.when_to_seek_care?.length && (
                <>
                  <Text style={{ fontWeight: '800', color: '#0F131A', marginTop: 8, marginBottom: 4 }}>
                    When to seek care
                  </Text>
                  {output.advice.when_to_seek_care.map((w, idx) => (
                    <Text key={idx} style={{ color: '#5B6472' }}>• {w}</Text>
                  ))}
                </>
              )}

              {!!output.advice.disclaimer && (
                <Text style={{ color: '#6B7280', marginTop: 10 }}>{output.advice.disclaimer}</Text>
              )}
            </View>
          )}
        </ScrollView>

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Send a message..."
            value={message}
            onChangeText={setMessage}
            placeholderTextColor="#9AA5B1"
            editable={!loading}
            returnKeyType="send"
            onSubmitEditing={send}
          />
          <TouchableOpacity
            style={[styles.sendBtn, loading && { opacity: 0.6 }]}
            onPress={send}
            disabled={loading}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>{loading ? '...' : 'Send'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ------------------------------------------------------
// Step 7: Keep styles tidy and consistent
// ------------------------------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 18 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, paddingBottom: 6 },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: '#FFFFFFAA' },
  title: { fontSize: 20, fontWeight: '800', color: '#0F131A' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginTop: 14 },
  cardText: { color: '#5B6472', textAlign: 'center' },
  inputBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 8, marginBottom: 14 },
  input: { flex: 1, height: 40, paddingHorizontal: 10, color: '#0F131A' },
  sendBtn: { backgroundColor: '#0F131A', paddingHorizontal: 16, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
});
