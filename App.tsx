import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useAuthStore } from './src/store/useAuthStore';
import { useTripStore } from './src/store/useTripStore';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { Text as RNText, View, Text } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import './global.css';

export default function App() {
  const { checkAuth } = useAuthStore();
  const { setUser, syncOfflineTrips, isSyncingOffline, syncingCount } = useTripStore();

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
    // Attempt an initial sync on app start
    syncOfflineTrips();
    // Subscribe to network changes (both Wi‑Fi and cellular)
    const unsub = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        syncOfflineTrips();
      }
    });
    return () => {
      unsub();
    };
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
      {isSyncingOffline && (
        <View
          style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50 }}
        >
          <View
            style={{
              backgroundColor: 'rgba(15,103,254,0.9)',
              paddingVertical: 8,
              paddingHorizontal: 12,
            }}
          >
            <Text style={{ color: 'white', textAlign: 'center' }}>
              Syncing {syncingCount} offline trip{syncingCount === 1 ? '' : 's'}...
            </Text>
          </View>
        </View>
      )}
      <AppNavigator />
    </>
  ) : null;
}
