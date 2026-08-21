import * as Clipboard from 'expo-clipboard';

let ExpoSpeechRecognitionModule: any = null;
let useSpeechRecognitionEvent: any = () => {};
try {
  const speechModule = require('expo-speech-recognition');
  ExpoSpeechRecognitionModule = speechModule.ExpoSpeechRecognitionModule;
  useSpeechRecognitionEvent = speechModule.useSpeechRecognitionEvent;
} catch (e) {
  // Not available in Expo Go
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect, router } from 'expo-router';
import Reanimated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, interpolate, Easing } from 'react-native-reanimated';
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
  Dimensions,
} from 'react-native';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { initCredits, getCredits, useCredit, isActivated, debugReset } from '@/utils/credits';

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
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const expandedHeight = screenHeight * 0.18;

  const [fromLang, setFromLang] = useState(LANGUAGES[0]);
  const [toLang, setToLang] = useState(LANGUAGES[1]);
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [credits, setCredits] = useState<number>(50);
  const [activated, setActivated] = useState(false);
  const [listening, setListening] = useState(false);

  const islandHeight = useSharedValue(56);
  const islandWidth = useSharedValue(180);
  const islandRadius = useSharedValue(32);
  const contentOpacity = useSharedValue(1);
  const resultOpacity = useSharedValue(0);

  const islandStyle = useAnimatedStyle(() => ({
    height: islandHeight.value,
    width: islandWidth.value,
    borderRadius: islandRadius.value,
  }));

  const expandIsland = () => {
    console.log('expanding island');
    islandWidth.value = withSpring(screenWidth - 48, { damping: 30, stiffness: 400, mass: 1 });
    islandHeight.value = withSpring(expandedHeight, { damping: 30, stiffness: 400, mass: 1 });
    islandRadius.value = withSpring(20, { damping: 30, stiffness: 400, mass: 1 });
    contentOpacity.value = withTiming(0, { duration: 100 });
    resultOpacity.value = withTiming(1, { duration: 200 });
  };

  const collapseIsland = () => {
    resultOpacity.value = withTiming(0, { duration: 100 });
    contentOpacity.value = withTiming(1, { duration: 150 });
    islandWidth.value = withSpring(180, { damping: 30, stiffness: 400, mass: 1 });
    islandHeight.value = withSpring(56, { damping: 30, stiffness: 400, mass: 1 });
    islandRadius.value = withSpring(32, { damping: 30, stiffness: 400, mass: 1 });
  };

  useEffect(() => {
    debugReset();
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

  useSpeechRecognitionEvent('start', () => setListening(true));
  useSpeechRecognitionEvent('end', () => setListening(false));
  useSpeechRecognitionEvent('result', (event) => {
    if (event.results[0]) {
      const transcript = event.results[0].transcript.trim();
      setInputText(transcript);
      setResult(''); // clear any previous result
      collapseIsland(); // reset island to pill state
    }
  });

  const swapLanguages = () => {
    setFromLang(toLang);
    setToLang(fromLang);
    setInputText(result);
    setResult(inputText);
  };

  const startVoice = async () => {
    if (!ExpoSpeechRecognitionModule) {
      Alert.alert('Not available', 'Voice input requires the full app build.');
      return;
    }
    const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission denied', 'Microphone access is needed for voice input.');
      return;
    }
    ExpoSpeechRecognitionModule.start({ lang: fromLang.code, interimResults: false });
  };

  const stopVoice = () => {
    ExpoSpeechRecognitionModule.stop();
  };

  const translate = async () => {
    if (!inputText.trim()) return; // block if empty — MUST be first line
    Keyboard.dismiss();
    expandIsland();

    if (!activated) {
      const { allowed, remaining } = await useCredit();
      if (!allowed) {
        Alert.alert('No credits remaining', 'Purchase unlimited access to continue.');
        collapseIsland();
        return;
      }
      setCredits(remaining);
    }

    setLoading(true);
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
      } else {
        Alert.alert('Error', data.error || 'Translation failed.');
        setResult('');
      }
    } catch {
      Alert.alert('Error', 'Cannot reach server. Check your connection.');
      setResult('');
      collapseIsland();
    } finally {
      setLoading(false);
    }
  };

  const closePickers = () => {
    setShowFromPicker(false);
    setShowToPicker(false);
  };

  const isLow = credits <= 10;
  const isWarning = credits <= 20 && !activated;

  const creditFillColor = credits > 30
    ? '#2E7D32'   // green — plenty
    : credits > 15
    ? '#F59E0B'   // amber — moderate
    : '#DC143C';  // red — low

  return (
    <SafeAreaView style={[s.root, { backgroundColor: t.bg }]}>
      <StatusBar style="dark" backgroundColor={t.bg} />
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

          {/* Credit bar */}
          {!activated && (
            <View style={s.creditBar}>
              <View style={s.creditBarHeader}>
                <Text style={[s.creditBarLabel, { color: t.textSub }]}>Free translations</Text>
                <Text style={[s.creditBarCount, { color: creditFillColor }]}>{credits}/50</Text>
              </View>
              <View style={[s.creditBarTrack, { backgroundColor: t.border }]}>
                <View style={[s.creditBarFill, { width: `${(credits / 50) * 100}%` as any, backgroundColor: creditFillColor }]} />
              </View>
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

          {/* Input card with mic */}
          <View style={[s.inputCard, { backgroundColor: t.inputBg, borderColor: t.border }]}>
            <TextInput
              style={[s.input, { color: t.text }]}
              placeholder={`Type in ${fromLang.label}...`}
              placeholderTextColor={t.textSub}
              multiline
              value={inputText}
              onChangeText={text => text.length <= 500 && setInputText(text)}
              onFocus={() => { if (result) { collapseIsland(); setResult(''); } }}
            />
            <Text style={[s.charCount, { color: t.textSub }]}>{inputText.length}/500</Text>

            <TouchableOpacity
              onPress={listening ? stopVoice : startVoice}
              style={[s.micBtn, { backgroundColor: listening ? t.primary : t.cardAlt }]}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 22 }}>{listening ? '⏹' : '🎤'}</Text>
            </TouchableOpacity>
          </View>

          {/* Dynamic Island */}
          <View style={s.btnRow}>
            <Reanimated.View style={[s.island, { backgroundColor: '#DC143C' }, islandStyle]}>
              {/* Compact — only shown when no result and not loading */}
              {!loading && !result && (
                <TouchableOpacity
                  style={[s.islandCompactInner, { width: '100%', alignItems: 'center' }]}
                  onPress={translate}
                  activeOpacity={0.85}
                >
                  <Text style={[s.islandBtnText, { color: '#fff' }]}>Translate</Text>
                </TouchableOpacity>
              )}

              {/* Expanded — loading or result */}
              <Reanimated.View style={[s.islandExpanded, { opacity: resultOpacity }]} pointerEvents={result || loading ? 'auto' : 'none'}>
                {loading ? (
                  <View style={s.islandExpandedInner}>
                    <Text style={[s.islandLang, { color: 'rgba(255,255,255,0.7)' }]}>TRANSLATING...</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={s.islandExpandedInner}
                    onPress={() => {
                      Clipboard.setStringAsync(result);
                      collapseIsland();
                      setResult('');
                    }}
                  >
                    <Text style={[s.islandLang, { color: 'rgba(255,255,255,0.7)' }]}>{toLang.label.toUpperCase()}</Text>
                    <Text style={[s.islandResult, { color: '#fff' }]}>{result}</Text>
                    <Text style={[s.islandCopy, { color: 'rgba(255,255,255,0.6)' }]}>Tap to copy & close</Text>
                  </TouchableOpacity>
                )}
              </Reanimated.View>
            </Reanimated.View>
          </View>

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

  creditBar: { gap: 6 },
  creditBarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  creditBarLabel: { fontSize: 11, fontWeight: '600' },
  creditBarTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  creditBarFill: { height: 6, borderRadius: 3 },
  creditBarCount: { fontSize: 11, fontWeight: '600' },
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
    position: 'relative',
  },
  input: {
    fontSize: 17, lineHeight: 24,
    minHeight: 80, textAlignVertical: 'top',
  },
  charCount: { position: 'absolute', bottom: 12, left: 12, fontSize: 12 },
  micBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  btnRow: { alignItems: 'center' },
  island: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 56,
  },
  islandCompact: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  islandCompactInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  islandBtnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  islandExpanded: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  islandExpandedInner: { padding: 16, gap: 6 },
  islandLang: { color: '#DC143C', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  islandResult: { color: '#fff', fontSize: 20, lineHeight: 28, fontWeight: '500' },
  islandCopy: { color: '#888', fontSize: 12, marginTop: 4 },

  unlockLink: { alignItems: 'center', paddingVertical: 8 },
  unlockLinkText: { fontSize: 14 },
});
