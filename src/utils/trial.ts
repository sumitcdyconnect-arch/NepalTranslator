import AsyncStorage from '@react-native-async-storage/async-storage';

const TRIAL_KEY = 'nepal_translator_trial';
const TRIAL_DAYS = 2; // 48 hours

export interface TrialStatus {
  isExpired: boolean;
  daysRemaining: number;
  startDate: string | null;
  isActivated: boolean;
}

export async function initTrial(): Promise<void> {
  const existing = await AsyncStorage.getItem(TRIAL_KEY);
  if (!existing) {
    const startDate = new Date().toISOString();
    await AsyncStorage.setItem(TRIAL_KEY, JSON.stringify({ startDate, isActivated: false }));
  }
}

export async function getTrialStatus(): Promise<TrialStatus> {
  const data = await AsyncStorage.getItem(TRIAL_KEY);
  if (!data) {
    return { isExpired: false, daysRemaining: TRIAL_DAYS, startDate: null, isActivated: false };
  }

  const { startDate, isActivated } = JSON.parse(data);
  if (!startDate) {
    return { isExpired: false, daysRemaining: TRIAL_DAYS, startDate: null, isActivated: false };
  }

  if (isActivated) {
    return { isExpired: false, daysRemaining: 999, startDate, isActivated: true };
  }

  const start = new Date(startDate).getTime();
  const now = Date.now();
  const diffMs = now - start;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, TRIAL_DAYS - diffDays);

  return {
    isExpired: daysRemaining <= 0,
    daysRemaining,
    startDate,
    isActivated: false,
  };
}

export async function activateLicense(): Promise<void> {
  await AsyncStorage.setItem(TRIAL_KEY, JSON.stringify({ startDate: new Date().toISOString(), isActivated: true }));
}

export async function resetTrial(): Promise<void> {
  await AsyncStorage.removeItem(TRIAL_KEY);
}

export async function forceExpireTrial(): Promise<void> {
  const expiredDate = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
  await AsyncStorage.setItem(TRIAL_KEY, JSON.stringify({ startDate: expiredDate, isActivated: false }));
}