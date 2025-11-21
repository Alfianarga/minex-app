import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const [showPassword, setShowPassword] = useState(false);
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
        <Text className="text-white text-lg font-poppins-medium">Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-minex-dark" edges={['top','left','right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-6"
          keyboardShouldPersistTaps="handled"
        >
        <View className="items-center mb-12 mt-6">
          <View className="w-16 h-16 rounded-2xl items-center justify-center mb-4" style={{ shadowColor: '#0F67FE', shadowOpacity: 0.45, shadowRadius: 22, shadowOffset: { width: 0, height: 10 }, elevation: 8 }}>
            <Image
              source={require('../../assets/icon.png')}
              className="w-16 h-16 rounded-2xl"
              resizeMode="cover"
            />
          </View>
          <Text className="text-white text-3xl font-poppins-bold mb-1">MINEX Mobile</Text>
          <Text className="text-white/80 text-base font-poppins-medium">Sign in to continue</Text>

          {/* API Connection Status */}
          <View className="mt-4 flex-row items-center">
            {checkingApi ? (
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-[#0F67FE] rounded-full mr-2" />
                <Text className="text-white/80 text-xs font-poppins-medium">Checking API connection...</Text>
              </View>
            ) : apiConnected === true ? (
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-[#0F67FE] rounded-full mr-2" />
                <Text className="text-[#0F67FE] text-xs font-poppins-medium">API Connected</Text>
              </View>
            ) : apiConnected === false ? (
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                <Text className="text-red-500 text-xs font-poppins-medium">API Not Connected</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-white text-sm font-poppins-medium mb-2">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            className="text-white px-4 py-4 rounded-xl text-lg bg-white/5 border border-white/20"
            style={{ minHeight: 56 }}
          />
        </View>

        <View className="mb-8">
          <Text className="text-white text-sm font-poppins-medium mb-2">Password</Text>
          <View className="relative">
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#94A3B8"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              className="text-white px-4 py-4 pr-14 rounded-xl text-lg bg-white/5 border border-white/20"
              style={{ minHeight: 56 }}
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((s) => !s)}
              activeOpacity={0.8}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <Text className="text-[#0F67FE] font-poppins-medium">{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="-mt-6 mb-8">
          <TouchableOpacity onPress={() => {}} activeOpacity={0.8} className="self-end">
            <Text className="text-[#0F67FE] font-poppins-medium">Forgot password?</Text>
          </TouchableOpacity>
        </View>

        <ButtonPrimary
          title="Login"
          onPress={handleLogin}
          loading={loading}
          disabled={loading || apiConnected === false}
        />

        <View className="mt-8 px-4">
          <Text className="text-white/60 text-center text-sm font-poppins-medium">
            Select your role: Operator (Tambang) or Checker (Pabrik)
          </Text>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

