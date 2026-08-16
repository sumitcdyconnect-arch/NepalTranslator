import AsyncStorage from '@react-native-async-storage/async-storage';

const CREDITS_KEY = 'free_credits';
const ACTIVATED_KEY = 'is_activated';
const FREE_CREDITS = 50;

export const initCredits = async (): Promise<void> => {
  const existing = await AsyncStorage.getItem(CREDITS_KEY);
  if (existing === null) {
    await AsyncStorage.setItem(CREDITS_KEY, FREE_CREDITS.toString());
  }
};

export const getCredits = async (): Promise<number> => {
  const val = await AsyncStorage.getItem(CREDITS_KEY);
  return val !== null ? parseInt(val) : FREE_CREDITS;
};

export const useCredit = async (): Promise<{ allowed: boolean; remaining: number }> => {
  const activated = await AsyncStorage.getItem(ACTIVATED_KEY);
  if (activated === 'true') return { allowed: true, remaining: -1 };
  const credits = await getCredits();
  if (credits <= 0) return { allowed: false, remaining: 0 };
  const newCredits = credits - 1;
  await AsyncStorage.setItem(CREDITS_KEY, newCredits.toString());
  return { allowed: true, remaining: newCredits };
};

export const isActivated = async (): Promise<boolean> => {
  const val = await AsyncStorage.getItem(ACTIVATED_KEY);
  return val === 'true';
};

export const activate = async (): Promise<void> => {
  await AsyncStorage.setItem(ACTIVATED_KEY, 'true');
};

export const resetCredits = async (): Promise<void> => {
  await AsyncStorage.removeItem(CREDITS_KEY);
  await AsyncStorage.removeItem(ACTIVATED_KEY);
};