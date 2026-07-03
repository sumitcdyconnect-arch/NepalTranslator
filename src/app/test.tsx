import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { resetTrial } from '@/utils/trial';

export default function TestScreen() {
  const handleResetTrial = async () => {
    await resetTrial();
    Alert.alert('Trial reset', 'Trial reset — restart the app to see paywall');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Dev Test Screen</Text>
        <Text style={styles.subtitle}>Use this to test the trial/paywall flow</Text>

        <TouchableOpacity style={styles.button} onPress={handleResetTrial}>
          <Text style={styles.buttonText}>Reset Trial (48h)</Text>
        </TouchableOpacity>

        <Text style={styles.note}>After tapping, fully close and reopen the app to trigger the paywall check.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  content: {
    flex: 1, padding: 32,
    justifyContent: 'center', alignItems: 'center', gap: 20,
  },
  title: {
    fontSize: 24, fontWeight: '700',
    color: '#fff', textAlign: 'center',
  },
  subtitle: {
    fontSize: 15, color: '#999',
    textAlign: 'center', lineHeight: 22,
  },
  button: {
    backgroundColor: '#E63946', borderRadius: 12,
    padding: 18, alignSelf: 'stretch', alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  note: { fontSize: 13, color: '#555', textAlign: 'center', marginTop: 20 },
});