import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ne', label: 'Nepali' },
  { code: 'zh', label: 'Mandarin' },
  { code: 'ko', label: 'Korean' },
  { code: 'ja', label: 'Japanese' },
  { code: 'de', label: 'German' },
  { code: 'fr', label: 'French' },
  { code: 'he', label: 'Hebrew' },
  { code: 'ru', label: 'Russian' },
  { code: 'es', label: 'Spanish' },
];

export default function TranslatorScreen() {
  const [fromLang, setFromLang] = useState(LANGUAGES[0]);
  const [toLang, setToLang] = useState(LANGUAGES[1]);
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const swapLanguages = () => {
    setFromLang(toLang);
    setToLang(fromLang);
    setInputText(result);
    setResult(inputText);
  };

  const translate = async () => {
    Keyboard.dismiss();
    if (!inputText.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const response = await fetch('https://nepaltranslatorapi.onrender.com/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          from: fromLang.code,
          to: toLang.code,
        }),
      });
      const data = await response.json();
      if (data.translation) {
        setResult(data.translation);
      } else {
        Alert.alert('Error', data.error || 'Translation failed.');
      }
    } catch (e) {
      Alert.alert('Error', 'Cannot reach server. Check your connection.');
    }
    setLoading(false);
  };

  const LanguagePicker = ({
    visible,
    selected,
    onSelect,
    exclude,
  }: {
    visible: boolean;
    selected: typeof LANGUAGES[0];
    onSelect: (lang: typeof LANGUAGES[0]) => void;
    exclude: typeof LANGUAGES[0];
  }) => {
    if (!visible) return null;
    return (
      <View style={styles.picker}>
        {LANGUAGES.filter((l) => l.code !== exclude.code).map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[styles.pickerItem, selected.code === lang.code && styles.pickerItemActive]}
            onPress={() => onSelect(lang)}
          >
            <Text style={[styles.pickerItemText, selected.code === lang.code && styles.pickerItemTextActive]}>
              {lang.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <Text style={styles.header}>🏔️ Nepal Translator</Text>

        {/* Language Selector Row */}
        <View style={styles.langRow}>
          <TouchableOpacity
            style={styles.langButton}
            onPress={() => { setShowFromPicker(!showFromPicker); setShowToPicker(false); }}
          >
            <Text style={styles.langButtonText}>{fromLang.label}</Text>
            <Text style={styles.langArrow}>▼</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.swapButton} onPress={swapLanguages}>
            <Text style={styles.swapText}>⇄</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.langButton}
            onPress={() => { setShowToPicker(!showToPicker); setShowFromPicker(false); }}
          >
            <Text style={styles.langButtonText}>{toLang.label}</Text>
            <Text style={styles.langArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Language Pickers */}
        <LanguagePicker
          visible={showFromPicker}
          selected={fromLang}
          exclude={toLang}
          onSelect={(lang) => { setFromLang(lang); setShowFromPicker(false); }}
        />
        <LanguagePicker
          visible={showToPicker}
          selected={toLang}
          exclude={fromLang}
          onSelect={(lang) => { setToLang(lang); setShowToPicker(false); }}
        />

        {/* Input */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder={`Type in ${fromLang.label}... (add . or ?)`}
            placeholderTextColor="#888"
            multiline
            value={inputText}
            onChangeText={(text) => text.length <= 500 && setInputText(text)}
          />
          <Text style={styles.charCount}>{inputText.length}/500</Text>
        </View>

        {/* Translate Button */}
        <TouchableOpacity style={styles.translateButton} onPress={translate}>
          <Text style={styles.translateButtonText}>Translate</Text>
        </TouchableOpacity>

        {/* Result */}
        {loading && <ActivityIndicator size="large" color="#E63946" style={{ marginTop: 24 }} />}
        {result !== '' && !loading && (
          <TouchableOpacity
            style={styles.resultBox}
            onPress={() => {
              Clipboard.setStringAsync(result);
              Alert.alert('Copied', 'Translation copied to clipboard.');
            }}
          >
            <Text style={styles.resultLabel}>{toLang.label} — tap to copy</Text>
            <Text style={styles.resultText}>{result}</Text>
          </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  scroll: { padding: 20, gap: 16 },
  header: { fontSize: 24, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 8 },

  langRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  langButton: {
    flex: 1, backgroundColor: '#1e1e1e', borderRadius: 12,
    padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  langButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  langArrow: { color: '#888', fontSize: 12 },
  swapButton: {
    backgroundColor: '#E63946', borderRadius: 12,
    width: 44, height: 44, justifyContent: 'center', alignItems: 'center',
  },
  swapText: { color: '#fff', fontSize: 20 },

  picker: {
    backgroundColor: '#1e1e1e', borderRadius: 12,
    padding: 8, gap: 4,
  },
  pickerItem: { padding: 12, borderRadius: 8 },
  pickerItemActive: { backgroundColor: '#E63946' },
  pickerItemText: { color: '#ccc', fontSize: 15 },
  pickerItemTextActive: { color: '#fff', fontWeight: '700' },

  inputWrapper: { position: 'relative' },
  input: {
    backgroundColor: '#1e1e1e', borderRadius: 12,
    padding: 16, color: '#fff', fontSize: 17,
    minHeight: 130, textAlignVertical: 'top',
  },
  charCount: {
    position: 'absolute', bottom: 8, right: 12,
    color: '#555', fontSize: 12,
  },

  translateButton: {
    backgroundColor: '#E63946', borderRadius: 12,
    padding: 16, alignItems: 'center',
  },
  translateButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },

  resultBox: {
    backgroundColor: '#1a1a2e', borderRadius: 12,
    padding: 16, gap: 8, borderLeftWidth: 3, borderLeftColor: '#E63946',
  },
  resultLabel: { color: '#E63946', fontSize: 13, fontWeight: '600', textTransform: 'uppercase' },
  resultText: { color: '#fff', fontSize: 18, lineHeight: 28 },
});