import * as Clipboard from 'expo-clipboard';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect, router } from 'expo-router';
import {
  Animated,
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useColorScheme,
  Platform,
} from 'react-native';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { initCredits, getCredits, useCredit, isActivated } from '@/utils/credits';

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

const light = {
  bg: '#FAFAF8',
  card: '#FFFFFF',
  cardAlt: '#F2F1EE',
  text: '#1C1C1E',
  textSub: '#8A8A8E',
  primary: '#DC143C',
  border: '#E5E4E0',
  inputBg: '#F7F6F3',
  shadow: '#00000012',
};

const dark = {
  bg: '#111110',
  card: '#1C1C1E',
  cardAlt: '#2C2C2E',
  text: '#F5F5F0',
  textSub: '#8A8A8E',
  primary: '#DC143C',
  border: '#2C2C2E',
  inputBg: '#1C1C1E',
  shadow: '#00000040',
};

export default function TranslatorScreen() {
  const scheme = useColorScheme();
  const t = scheme === 'dark' ? dark : light;

  const [fromLang, setFromLang] = useState(LANGUAGES[0]);
  const [toLang, setToLang] = useState(LANGUAGES[1]);
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [credits, setCredits] = useState<number>(50);
  const [activated, setActivated] = useState(false);

  const resultAnim = useRef(new Animated.Value(0)).current;
  const resultOpacity = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initCredits();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const check = async () => {
        const act = await isActivated();
        setActivated(act);
        if (!act) {
          const c = await getCredits();
          setCredits(c);
        }
      };
      check();
    }, [])
  );

  const animateResult = () => {
    resultAnim.setValue(40);
    resultOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(resultAnim, {
        toValue: 0,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(resultOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const startProgress = () => {
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start();
  };

  const swapLanguages = () => {
    setFromLang(toLang);
    setToLang(fromLang);
    setInputText(result);
    setResult(inputText);
  };

  const translate = async () => {
    Keyboard.dismiss();
    if (!inputText.trim()) return;

    if (!activated) {
      const { allowed, remaining } = await useCredit();
      if (!allowed) {
        Alert.alert('No credits remaining', 'Purchase unlimited access to continue.');
        return;
      }
      setCredits(remaining);
    }

    setLoading(true);
    startProgress();
    animateResult();
    setResult('');
    try {
      const response = await fetch('https://nepaltranslatorapi.onrender.com/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, from: fromLang.code, to: toLang.code }),
      });
      const data = await response.json();
      if (data.translation) {
        setResult(data.translation);
        animateResult();
      } else {
        Alert.alert('Error', data.error || 'Translation failed.');
      }
    } catch {
      Alert.alert('Error', 'Cannot reach server. Check your connection.');
    }
    setLoading(false);
  };

  const closePickers = () => {
    setShowFromPicker(false);
    setShowToPicker(false);
  };

  const isLow = credits <= 10;
  const isWarning = credits <= 20 && !activated;

  return (
    <SafeAreaView style={[s.root, { backgroundColor: t.bg }]}>
      <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); closePickers(); }}>
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* Header */}
          <View style={s.headerRow}>
            <Text style={[s.headerTitle, { color: t.text }]}>Nepal</Text>
            <Text style={[s.headerAccent, { color: t.primary }]}>Translate</Text>
          </View>
          <Text style={[s.headerSub, { color: t.textSub }]}>
            {activated ? 'Unlimited access' : `${credits} of 50 free translations`}
          </Text>

          {/* Credit hairline */}
          {!activated && (
            <View style={[s.creditLine, { backgroundColor: t.border }]}>
              <View style={[
                s.creditFill,
                {
                  width: `${(credits / 50) * 100}%` as any,
                  backgroundColor: isLow ? t.primary : t.primary + '66',
                },
              ]} />
            </View>
          )}

          {/* Warning */}
          {isWarning && (
            <Text style={[s.warningText, { color: t.primary }]}>
              {isLow ? '🚨 Running low — unlock before your trek' : '⚠️ Unlock before heading into the mountains'}
            </Text>
          )}

          {/* Language Selector — unified card */}
          <View style={[s.langCard, { backgroundColor: t.card, borderColor: t.border,
            shadowColor: t.shadow,
          }]}>
            <TouchableOpacity
              style={s.langSide}
              onPress={() => { setShowFromPicker(!showFromPicker); setShowToPicker(false); }}
            >
              <Text style={[s.langLabel, { color: t.textSub }]}>FROM</Text>
              <Text style={[s.langValue, { color: t.text }]}>{fromLang.label}</Text>
              <Text style={[s.langChevron, { color: t.textSub }]}>▾</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[s.swapZone]} onPress={swapLanguages}>
              <View style={[s.swapPill, { backgroundColor: t.primary }]}>
                <Text style={s.swapIcon}>⇄</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.langSide, s.langRight]}
              onPress={() => { setShowToPicker(!showToPicker); setShowFromPicker(false); }}
            >
              <Text style={[s.langLabel, { color: t.textSub }]}>TO</Text>
              <Text style={[s.langValue, { color: t.text }]}>{toLang.label}</Text>
              <Text style={[s.langChevron, { color: t.textSub }]}>▾</Text>
            </TouchableOpacity>
          </View>

          {/* From picker */}
          {showFromPicker && (
            <View style={[s.picker, { backgroundColor: t.card, borderColor: t.border }]}>
              {LANGUAGES.filter(l => l.code !== toLang.code).map(lang => (
                <TouchableOpacity
                  key={lang.code}
                  style={[s.pickerItem, fromLang.code === lang.code && { backgroundColor: t.primary + '18' }]}
                  onPress={() => { setFromLang(lang); setShowFromPicker(false); }}
                >
                  <Text style={[s.pickerText, { color: fromLang.code === lang.code ? t.primary : t.text }]}>
                    {lang.label}
                  </Text>
                  {fromLang.code === lang.code && <Text style={{ color: t.primary }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* To picker */}
          {showToPicker && (
            <View style={[s.picker, { backgroundColor: t.card, borderColor: t.border }]}>
              {LANGUAGES.filter(l => l.code !== fromLang.code).map(lang => (
                <TouchableOpacity
                  key={lang.code}
                  style={[s.pickerItem, toLang.code === lang.code && { backgroundColor: t.primary + '18' }]}
                  onPress={() => { setToLang(lang); setShowToPicker(false); }}
                >
                  <Text style={[s.pickerText, { color: toLang.code === lang.code ? t.primary : t.text }]}>
                    {lang.label}
                  </Text>
                  {toLang.code === lang.code && <Text style={{ color: t.primary }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Input */}
          <View style={[s.inputCard, { backgroundColor: t.inputBg, borderColor: t.border }]}>
            <TextInput
              style={[s.input, { color: t.text }]}
              placeholder={`Type in ${fromLang.label}...`}
              placeholderTextColor={t.textSub}
              multiline
              value={inputText}
              onChangeText={text => text.length <= 500 && setInputText(text)}
            />
            <Text style={[s.charCount, { color: t.textSub }]}>{inputText.length}/500</Text>
          </View>

          {/* Translate button — centered pill */}
          <View style={s.btnRow}>
            <TouchableOpacity
              style={[s.translateBtn, { backgroundColor: t.primary }]}
              onPress={translate}
              activeOpacity={0.85}
            >
              <Text style={s.translateBtnText}>Translate</Text>
            </TouchableOpacity>
          </View>

          {/* Result */}
          {(loading || result !== '') && (
            <Animated.View style={{ transform: [{ translateY: resultAnim }], opacity: resultOpacity }}>
              <View style={[s.resultCard, { backgroundColor: t.card, borderColor: t.border }]}>
                {/* Animated left border */}
                <Animated.View style={{
                  position: 'absolute',
                  left: 0, top: 0, bottom: 0,
                  width: 3,
                  borderRadius: 3,
                  backgroundColor: t.primary,
                  transform: [{
                    scaleY: loading ? progressAnim : 1
                  }],
                  transformOrigin: 'top',
                }} />
                {loading ? (
                  <Text style={[s.resultLang, { color: t.textSub }]}>TRANSLATING...</Text>
                ) : (
                  <TouchableOpacity onPress={() => { Clipboard.setStringAsync(result); Alert.alert('Copied', 'Translation copied to clipboard.'); }}>
                    <Text style={[s.resultLang, { color: t.primary }]}>{toLang.label.toUpperCase()}</Text>
                    <Text style={[s.resultText, { color: t.text }]}>{result}</Text>
                    <Text style={[s.resultCopy, { color: t.textSub }]}>Tap to copy</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          )}

          {/* Unlock link */}
          {!activated && (
            <TouchableOpacity style={s.unlockLink} onPress={() => router.push('/unlock')}>
              <Text style={[s.unlockLinkText, { color: t.textSub }]}>
                Unlock unlimited access →
              </Text>
            </TouchableOpacity>
          )}

        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 24, gap: 14, paddingBottom: 48 },

  headerRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  headerTitle: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  headerAccent: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  headerSub: { fontSize: 13, marginTop: -8, marginBottom: 4 },

  creditLine: { height: 2, borderRadius: 1, overflow: 'hidden' },
  creditFill: { height: 2, borderRadius: 1 },
  warningText: { fontSize: 12 },

  langCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 16, borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1, shadowRadius: 8,
    elevation: 3,
  },
  langSide: { flex: 1, padding: 16, gap: 2 },
  langRight: { alignItems: 'flex-end' },
  langLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  langValue: { fontSize: 16, fontWeight: '600' },
  langChevron: { fontSize: 11 },

  swapZone: { paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center' },
  swapPill: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  swapIcon: { color: '#fff', fontSize: 16 },

  picker: {
    borderRadius: 12, borderWidth: 1,
    overflow: 'hidden',
    marginTop: -8,
  },
  pickerItem: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 14,
  },
  pickerText: { fontSize: 15 },

  inputCard: {
    borderRadius: 16, borderWidth: 1,
    padding: 16, gap: 8,
    minHeight: 120,
  },
  input: {
    fontSize: 17, lineHeight: 24,
    minHeight: 80, textAlignVertical: 'top',
  },
  charCount: { fontSize: 12, textAlign: 'right' },

  btnRow: { alignItems: 'center' },
  translateBtn: {
    paddingVertical: 14, paddingHorizontal: 52,
    borderRadius: 32, alignItems: 'center',
    minWidth: 180,
  },
  translateBtnText: { color: '#fff', fontSize: 17, fontWeight: '600', letterSpacing: 0.2 },

  resultCard: {
    borderRadius: 16, borderWidth: 1,
    padding: 18, gap: 6,
  },
  resultLang: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  resultText: { fontSize: 20, lineHeight: 30, fontWeight: '500' },
  resultCopy: { fontSize: 12, marginTop: 4 },

  unlockLink: { alignItems: 'center', paddingVertical: 8 },
  unlockLinkText: { fontSize: 14 },
});
