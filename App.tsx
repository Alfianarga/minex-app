import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useAuthStore } from './src/store/useAuthStore';
import { useTripStore } from './src/store/useTripStore';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { Text as RNText } from 'react-native';
import './global.css';

export default function App() {
  const { checkAuth } = useAuthStore();
  const { setUser } = useTripStore();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
  });

  useEffect(() => {
    // Initialize auth check
    checkAuth().then(() => {
      const { user } = useAuthStore.getState();
      if (user) {
        setUser(user);
      }
    });
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      // Set global default font for all React Native Text components
      // so the app uses Poppins by default without changing each component.
      // This merges with any existing default style.
      (RNText as any).defaultProps = (RNText as any).defaultProps || {};
      (RNText as any).defaultProps.style = [
        (RNText as any).defaultProps.style,
        { fontFamily: 'Poppins_400Regular' },
      ];
    }
  }, [fontsLoaded]);

  return fontsLoaded ? (
    <>
      <StatusBar style="light" />
      <AppNavigator />
    </>
  ) : null;
}
