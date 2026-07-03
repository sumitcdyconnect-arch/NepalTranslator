import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
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
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].name);

  const currentCategory = CATEGORIES.find((c) => c.name === activeCategory)!;

  const copyPhrase = (nepali: string) => {
    Clipboard.setStringAsync(nepali);
    Alert.alert('Copied', 'Phrase copied to clipboard.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>📖 Phrasebook</Text>

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
            style={[styles.tab, activeCategory === cat.name && styles.tabActive]}
            onPress={() => setActiveCategory(cat.name)}
          >
            <Text style={styles.tabIcon}>{cat.icon}</Text>
            <Text style={[styles.tabText, activeCategory === cat.name && styles.tabTextActive]}>
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
            style={styles.phraseCard}
            onPress={() => copyPhrase(phrase.nepali)}
          >
            <Text style={styles.englishText}>{phrase.english}</Text>
            <Text style={styles.nepaliText}>{phrase.nepali}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  header: {
    fontSize: 24, fontWeight: '700', color: '#fff',
    textAlign: 'center', paddingTop: 16, paddingBottom: 12,
  },
  tabRow: { flexGrow: 0, paddingLeft: 16 },
  tabRowContent: { gap: 8, paddingRight: 16, paddingBottom: 12 },
  tab: {
    backgroundColor: '#1e1e1e', borderRadius: 20,
    paddingVertical: 10, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  tabActive: { backgroundColor: '#E63946' },
  tabIcon: { fontSize: 16 },
  tabText: { color: '#ccc', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#fff' },

  list: { flex: 1 },
  listContent: { padding: 16, gap: 10 },
  phraseCard: {
    backgroundColor: '#1e1e1e', borderRadius: 12,
    padding: 16, gap: 6,
  },
  englishText: { color: '#999', fontSize: 14 },
  nepaliText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});