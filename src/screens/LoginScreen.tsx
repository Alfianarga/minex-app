import * as React from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ButtonPrimary } from '../components/ButtonPrimary';
import { useAuthStore } from '../store/useAuthStore';
import { useTripStore } from '../store/useTripStore';
import { USER_ROLES } from '../utils/constants';
import { checkApiConnection } from '../utils/apiCheck';
import { useAccessibilityStore } from '../store/useAccessibilityStore';
import { useI18n } from '../i18n';
import { useLanguageStore } from '../store/useLanguageStore';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [apiConnected, setApiConnected] = React.useState<boolean | null>(null);
  const [checkingApi, setCheckingApi] = React.useState(true);
  const [showPassword, setShowPassword] = React.useState(false);
  const { login, checkAuth, isAuthenticated, isLoading } = useAuthStore();
  const { setUser } = useTripStore();
  const { highContrast, largeText } = useAccessibilityStore();
  const { language, t } = useI18n();
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  React.useEffect(() => {
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

  React.useEffect(() => {
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
      <View className={`flex-1 items-center justify-center ${highContrast ? 'bg-black' : 'bg-minex-dark'}`}>
        <Text className={`${highContrast ? 'text-white' : 'text-white'} ${largeText ? 'text-xl' : 'text-lg'} font-poppins-medium`}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${highContrast ? 'bg-black' : 'bg-minex-dark'}`} edges={['top','left','right']}>
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
          <Text className={`${highContrast ? 'text-white' : 'text-white'} ${largeText ? 'text-4xl' : 'text-3xl'} font-poppins-bold mb-1`}>{t('login', 'title')}</Text>
          <Text className={`${highContrast ? 'text-white' : 'text-white/80'} ${largeText ? 'text-lg' : 'text-base'} font-poppins-medium`}>{t('login', 'subtitle')}</Text>

          {/* Language toggle */}
          <View className="mt-5 flex-row items-center justify-center gap-2">
            <TouchableOpacity
              onPress={() => setLanguage('en')}
              activeOpacity={0.9}
              className={`px-4 py-2 rounded-full border ${
                highContrast
                  ? language === 'en'
                    ? 'bg-white border-white'
                    : 'bg-black border-white'
                  : language === 'en'
                  ? 'bg-[#0F67FE] border-[#0F67FE]'
                  : 'bg-transparent border-white/40'
              }`}
            >
              <Text
                className={`font-poppins-medium ${
                  highContrast
                    ? language === 'en'
                      ? 'text-black text-sm'
                      : 'text-white text-xs'
                    : language === 'en'
                    ? 'text-white text-sm'
                    : 'text-white/80 text-xs'
                }`}
              >
                EN · English
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setLanguage('id')}
              activeOpacity={0.9}
              className={`px-4 py-2 rounded-full border ${
                highContrast
                  ? language === 'id'
                    ? 'bg-white border-white'
                    : 'bg-black border-white'
                  : language === 'id'
                  ? 'bg-[#0F67FE] border-[#0F67FE]'
                  : 'bg-transparent border-white/40'
              }`}
            >
              <Text
                className={`font-poppins-medium ${
                  highContrast
                    ? language === 'id'
                      ? 'text-black text-sm'
                      : 'text-white text-xs'
                    : language === 'id'
                    ? 'text-white text-sm'
                    : 'text-white/80 text-xs'
                }`}
              >
                ID · Bahasa
              </Text>
            </TouchableOpacity>
          </View>

          {/* API Connection Status */}
          <View className="mt-4 flex-row items-center">
            {checkingApi ? (
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-[#0F67FE] rounded-full mr-2" />
                <Text className={`${highContrast ? 'text-white' : 'text-white/80'} ${largeText ? 'text-sm' : 'text-xs'} font-poppins-medium`}>{t('login', 'apiChecking')}</Text>
              </View>
            ) : apiConnected === true ? (
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-[#0F67FE] rounded-full mr-2" />
                <Text className={`text-[#0F67FE] ${largeText ? 'text-sm' : 'text-xs'} font-poppins-medium`}>{t('login', 'apiConnected')}</Text>
              </View>
            ) : apiConnected === false ? (
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                <Text className={`text-red-500 ${largeText ? 'text-sm' : 'text-xs'} font-poppins-medium`}>{t('login', 'apiNotConnected')}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View className="mb-6">
          <Text className={`${highContrast ? 'text-white' : 'text-white'} ${largeText ? 'text-base' : 'text-sm'} font-poppins-medium mb-2`}>{t('login', 'emailLabel')}</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder={t('login', 'emailPlaceholder')}
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            className={`${highContrast ? 'text-black bg-white border-white' : 'text-white bg-white/5 border border-white/20'} px-4 py-4 rounded-xl ${largeText ? 'text-xl' : 'text-lg'}`}
            style={{ minHeight: 56 }}
          />
        </View>

        <View className="mb-8">
          <Text className={`${highContrast ? 'text-white' : 'text-white'} ${largeText ? 'text-base' : 'text-sm'} font-poppins-medium mb-2`}>{t('login', 'passwordLabel')}</Text>
          <View className="relative">
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder={t('login', 'passwordPlaceholder')}
              placeholderTextColor="#94A3B8"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              className={`${highContrast ? 'text-black bg-white border-white' : 'text-white bg-white/5 border border-white/20'} px-4 py-4 pr-14 rounded-xl ${largeText ? 'text-xl' : 'text-lg'}`}
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
            <Text className="text-[#0F67FE] font-poppins-medium">{t('login', 'forgotPassword')}</Text>
          </TouchableOpacity>
        </View>

        <ButtonPrimary
          title={t('login', 'loginButton')}
          onPress={handleLogin}
          loading={loading}
          disabled={loading || apiConnected === false}
        />

        <View className="mt-8 px-4">
          <Text className={`${highContrast ? 'text-white' : 'text-white/60'} text-center ${largeText ? 'text-base' : 'text-sm'} font-poppins-medium`}>
            {t('login', 'roleHint')}
          </Text>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
