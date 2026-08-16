import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { activate } from '@/utils/credits';

const VALID_KEY = 'NEPAL2024';

export default function UnlockScreen() {
  const [keyInput, setKeyInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (loading) return;
    const trimmed = keyInput.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    if (trimmed === VALID_KEY) {
      await activate();
      Alert.alert('Unlocked!', 'Enjoy unlimited translations.', [{ text: 'OK', onPress: () => router.back() }]);
    } else {
      Alert.alert('Invalid License Key', 'Please check your key and try again.');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>🔓</Text>
        <Text style={styles.title}>Unlock Unlimited Translations</Text>
        <Text style={styles.subtitle}>
          Enter your license key to unlock unlimited offline translations forever.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="License Key (e.g., NEPAL2024)"
          placeholderTextColor="#555"
          value={keyInput}
          onChangeText={setKeyInput}
          autoCapitalize="characters"
          textAlign="center"
          autoCorrect={false}
          spellCheck={false}
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading || !keyInput.trim()}>
          <Text style={[styles.buttonText, loading && styles.buttonTextDisabled]}>{loading ? 'Verifying...' : 'Unlock'}</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>One-time purchase — no subscription</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  content: {
    flex: 1,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  icon: { fontSize: 64 },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  input: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 17,
    textAlign: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#333',
  },
  button: {
    backgroundColor: '#E63946',
    borderRadius: 12,
    padding: 18,
    alignSelf: 'stretch',
    alignItems: 'center',
    marginTop: 8,
    opacity: 1,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  buttonTextDisabled: { opacity: 0.6 },
  hint: { fontSize: 13, color: '#555', textAlign: 'center', marginTop: 8 },
});