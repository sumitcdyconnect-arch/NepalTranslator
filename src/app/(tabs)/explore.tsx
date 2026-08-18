import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';

type Phrase = {
  english: string;
  nepali: string;
};

type Category = {
  name: string;
  icon: string;
  phrases: Phrase[];
};

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

const CATEGORIES: Category[] = [
  {
    name: 'Trekking & Directions',
    icon: '🥾',
    phrases: [
      { english: 'Where is the trail?', nepali: 'बाटो कहाँ छ?' },
      { english: 'How far is it?', nepali: 'कति टाढा छ?' },
      { english: 'Is this the right way?', nepali: 'यो बाटो ठिक हो?' },
      { english: 'How many hours to walk?', nepali: 'कति घण्टा हिँड्नु पर्छ?' },
      { english: 'Is it safe?', nepali: 'यो सुरक्षित छ?' },
      { english: 'I am lost', nepali: 'म बाटो बिर्सेन्छु' },
    ],
  },
  {
    name: 'Food & Dining',
    icon: '🍛',
    phrases: [
      { english: 'I am vegetarian', nepali: 'म शाकाहारी हूँ' },
      { english: 'Not spicy please', nepali: 'पिरो नचाहियोस्' },
      { english: 'How much for this?', nepali: 'यो कति पर्‍यो?' },
      { english: 'Water please', nepali: 'पानी दिनुहोस्' },
      { english: 'The bill please', nepali: 'बिल दिनुहोस्' },
      { english: 'Very delicious', nepali: 'धेरै मिठो छ' },
    ],
  },
  {
    name: 'Emergency',
    icon: '🚨',
    phrases: [
      { english: 'I need help', nepali: 'मलाई मद्दत चाहियो' },
      { english: 'Call a doctor', nepali: 'डाक्टर बोलाउनुहोस्' },
      { english: 'I am sick', nepali: 'म बिरामी छु' },
      { english: 'Where is the hospital?', nepali: 'अस्पताल कहाँ छ?' },
      { english: 'I lost my passport', nepali: 'मेरो राहदानी हरायो' },
      { english: 'Call the police', nepali: 'प्रहरीलाई बोलाउनुहोस्' },
    ],
  },
  {
    name: 'Shopping',
    icon: '🛍️',
    phrases: [
      { english: 'How much does this cost?', nepali: 'यो कति पर्‍यो?' },
      { english: 'Too expensive', nepali: 'धेरै महँगो छ' },
      { english: 'Can you reduce the price?', nepali: 'मुल्य घटाउन सक्नुहुन्छ?' },
      { english: 'I will take this', nepali: 'म यो लिँदैछु' },
      { english: 'Do you have a smaller size?', nepali: 'सानो साइज छ?' },
    ],
  },
  {
    name: 'Accommodation',
    icon: '🏨',
    phrases: [
      { english: 'Do you have a room?', nepali: 'कोठा छ?' },
      { english: 'How much per night?', nepali: 'एक रात कति पर्‍यो?' },
      { english: 'Is breakfast included?', nepali: 'बिहानको खाना समावेश छ?' },
      { english: 'Is there hot water?', nepali: 'तातो पानी छ?' },
      { english: 'What time is checkout?', nepali: 'चेकआउट कति बजे हुन्छ?' },
    ],
  },
];

export default function PhrasebookScreen() {
  const scheme = useColorScheme();
  const t = scheme === 'dark' ? dark : light;

  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].name);

  const currentCategory = CATEGORIES.find((c) => c.name === activeCategory)!;

  const copyPhrase = (nepali: string) => {
    Clipboard.setStringAsync(nepali);
    Alert.alert('Copied', 'Phrase copied to clipboard.');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]}>
      <Text style={[styles.header, { color: t.text }]}>📖 Phrasebook</Text>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabRow}
        contentContainerStyle={styles.tabRowContent}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.name}
            style={[
              styles.tab,
              activeCategory === cat.name
                ? { backgroundColor: t.primary }
                : { backgroundColor: t.cardAlt },
              { borderWidth: activeCategory === cat.name ? 0 : 1, borderColor: t.border },
            ]}
            onPress={() => setActiveCategory(cat.name)}
          >
            <Text style={styles.tabIcon}>{cat.icon}</Text>
            <Text
              style={[
                styles.tabText,
                { color: activeCategory === cat.name ? '#fff' : t.textSub },
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Phrase List */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {currentCategory.phrases.map((phrase, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.phraseCard, { backgroundColor: t.card, borderColor: t.border }]}
            onPress={() => copyPhrase(phrase.nepali)}
          >
            <Text style={[styles.englishText, { color: t.textSub }]}>{phrase.english}</Text>
            <Text style={[styles.nepaliText, { color: t.text }]}>{phrase.nepali}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    fontSize: 24, fontWeight: '700',
    textAlign: 'center', paddingTop: 16, paddingBottom: 12,
  },
  tabRow: { flexGrow: 0, paddingLeft: 16 },
  tabRowContent: { gap: 8, paddingRight: 16, paddingBottom: 12 },
  tab: {
    borderRadius: 20,
    paddingVertical: 10, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  tabIcon: { fontSize: 16 },
  tabText: { fontSize: 13, fontWeight: '600' },

  list: { flex: 1 },
  listContent: { padding: 16, gap: 10 },
  phraseCard: {
    borderRadius: 12, borderWidth: 1,
    padding: 16, gap: 6,
  },
  englishText: { fontSize: 14 },
  nepaliText: { fontSize: 18, fontWeight: '600' },
});