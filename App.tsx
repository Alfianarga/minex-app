import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useAuthStore } from './src/store/useAuthStore';
import { useTripStore } from './src/store/useTripStore';
import './global.css';

export default function App() {
  const { checkAuth } = useAuthStore();
  const { setUser } = useTripStore();

  useEffect(() => {
    // Initialize auth check
    checkAuth().then(() => {
      const { user } = useAuthStore.getState();
      if (user) {
        setUser(user);
      }
    });
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <AppNavigator />
    </>
  );
}

