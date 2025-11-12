import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { ButtonPrimary } from '../components/ButtonPrimary';
import { useAuthStore } from '../store/useAuthStore';
import { useTripStore } from '../store/useTripStore';
import { USER_ROLES } from '../utils/constants';
import { checkApiConnection } from '../utils/apiCheck';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [checkingApi, setCheckingApi] = useState(true);
  const { login, checkAuth, isAuthenticated, isLoading } = useAuthStore();
  const { setUser } = useTripStore();

  useEffect(() => {
    checkAuth();
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    setCheckingApi(true);
    const status = await checkApiConnection();
    setApiConnected(status.connected);
    setCheckingApi(false);
    
    if (!status.connected) {
      Alert.alert(
        'API Connection Failed',
        `Cannot connect to API server at ${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}. Please check your connection and API server status.`,
        [{ text: 'OK' }]
      );
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      const { user } = useAuthStore.getState();
      if (user) {
        setUser(user);
      }
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    // Check API connection before attempting login
    if (apiConnected === false) {
      Alert.alert(
        'API Not Available',
        'Cannot connect to API server. Please check your connection and try again.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry Connection', onPress: checkApiStatus },
        ]
      );
      return;
    }

    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Login Failed', result.error || 'Invalid credentials');
    } else {
      const { user } = useAuthStore.getState();
      if (user) {
        setUser(user);
      }
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-minex-dark">
        <Text className="text-white text-lg">Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-minex-dark"
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center mb-12">
          <Text className="text-minex-orange text-4xl font-bold mb-2">MINEX</Text>
          <Text className="text-minex-text-secondary text-lg">Mobile Trip Monitor</Text>
          
          {/* API Connection Status */}
          <View className="mt-4 flex-row items-center">
            {checkingApi ? (
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-minex-yellow rounded-full mr-2" />
                <Text className="text-minex-yellow text-xs">Checking API connection...</Text>
              </View>
            ) : apiConnected === true ? (
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-minex-green rounded-full mr-2" />
                <Text className="text-minex-green text-xs">API Connected</Text>
              </View>
            ) : apiConnected === false ? (
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                <Text className="text-red-500 text-xs">API Not Connected</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-white text-sm font-semibold mb-2">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#666"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            className="bg-minex-gray-light text-white px-4 py-4 rounded-lg text-lg border border-minex-gray"
            style={{ minHeight: 56 }}
          />
        </View>

        <View className="mb-8">
          <Text className="text-white text-sm font-semibold mb-2">Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor="#666"
            secureTextEntry
            autoCapitalize="none"
            className="bg-minex-gray-light text-white px-4 py-4 rounded-lg text-lg border border-minex-gray"
            style={{ minHeight: 56 }}
            onSubmitEditing={handleLogin}
          />
        </View>

        <ButtonPrimary
          title="Login"
          onPress={handleLogin}
          loading={loading}
          disabled={loading || apiConnected === false}
        />

        <View className="mt-8 px-4">
          <Text className="text-minex-text-secondary text-center text-sm">
            Select your role: Operator (Tambang) or Checker (Pabrik)
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

