import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function PaywallScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>🏔️</Text>
        <Text style={styles.title}>Your free trial has ended</Text>
        <Text style={styles.subtitle}>
          You have used all 30 free translations. Purchase once for unlimited access forever.
        </Text>

        <View style={styles.features}>
          <Text style={styles.feature}>✅ Full offline translation</Text>
          <Text style={styles.feature}>✅ All 9 languages</Text>
          <Text style={styles.feature}>✅ Works without internet</Text>
          <Text style={styles.feature}>✅ One-time payment, lifetime access</Text>
        </View>

        <TouchableOpacity
          style={styles.buyButton}
          onPress={() => router.push('/unlock')}
        >
          <Text style={styles.buyButtonText}>Unlock for $2</Text>
        </TouchableOpacity>

        <Text style={styles.note}>Online translation remains free forever.</Text>
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
  icon: { fontSize: 64 },
  title: {
    fontSize: 24, fontWeight: '700',
    color: '#fff', textAlign: 'center',
  },
  subtitle: {
    fontSize: 15, color: '#999',
    textAlign: 'center', lineHeight: 22,
  },
  features: { gap: 10, alignSelf: 'stretch' },
  feature: { fontSize: 15, color: '#ccc' },
  buyButton: {
    backgroundColor: '#E63946', borderRadius: 12,
    padding: 18, alignSelf: 'stretch', alignItems: 'center',
  },
  buyButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  note: { fontSize: 13, color: '#555', textAlign: 'center' },
});