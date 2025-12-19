import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { QRScannerScreen } from '../screens/QRScannerScreen';
import { WeightInputScreen } from '../screens/WeightInputScreen';
import { TripListScreen } from '../screens/TripListScreen';
import { useAuthStore } from '../store/useAuthStore';
import { useTripStore } from '../store/useTripStore';
import { useAccessibilityStore } from '../store/useAccessibilityStore';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  QRScanner: undefined;
  WeightInput: { tripToken: string };
  TripList: { focusTripToken?: string } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, checkAuth, user } = useAuthStore();
  const { setUser } = useTripStore();
  const highContrast = useAccessibilityStore((s) => s.highContrast);

  useEffect(() => {
    checkAuth().then(() => {
      const { user } = useAuthStore.getState();
      if (user) {
        setUser(user);
      }
    });
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: highContrast ? '#000000' : '#0a0a0a' },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen
              name="QRScanner"
              component={QRScannerScreen}
              options={{
                presentation: 'fullScreenModal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="WeightInput"
              component={WeightInputScreen}
              options={{
                presentation: 'card',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="TripList"
              component={TripListScreen}
              options={{
                presentation: 'card',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

