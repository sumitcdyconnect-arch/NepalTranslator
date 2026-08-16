import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { initCredits } from '@/utils/credits';

export default function RootLayout() {
  const [initDone, setInitDone] = useState(false);

  useEffect(() => {
    const init = async () => {
      await initCredits();
      setInitDone(true);
    };
    init();
  }, []);

  if (!initDone) {
    return <AnimatedSplashOverlay />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="unlock" options={{ title: 'Unlock' }} />
      <Stack.Screen name="paywall" options={{ title: 'Unlock' }} />
    </Stack>
  );
}