import { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import PaywallScreen from '@/app/paywall';
import { initTrial, getTrialStatus } from '@/utils/trial';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [trialChecked, setTrialChecked] = useState(false);
  const [isTrialExpired, setIsTrialExpired] = useState(false);

  useEffect(() => {
    const checkTrial = async () => {
      await initTrial();
      const status = await getTrialStatus();
      console.log('[Trial Status]', status);
      setIsTrialExpired(status.isExpired);
      setTrialChecked(true);
    };
    checkTrial();
  }, []);

  if (!trialChecked) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
      </ThemeProvider>
    );
  }

  if (isTrialExpired) {
    return <PaywallScreen />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}