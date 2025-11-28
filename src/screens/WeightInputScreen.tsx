import React, { useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ButtonPrimary } from '../components/ButtonPrimary';
import { useTripStore } from '../store/useTripStore';
import { tripAPI, CompleteTripRequest } from '../api/tripAPI';
import { offlineStorage } from '../utils/storage';
import NetInfo from '@react-native-community/netinfo';
import { useAccessibilityStore } from '../store/useAccessibilityStore';
import { triggerSuccessHaptic, triggerWarningHaptic } from '../utils/haptics';
import { useI18n } from '../i18n';

interface WeightInputScreenProps {
  navigation: any;
  route: {
    params: {
      tripToken: string;
    };
  };
}

export const WeightInputScreen: React.FC<WeightInputScreenProps> = ({ navigation, route }) => {
  const { tripToken } = route.params;
  const token = tripToken.trim();
  const updateTrip = useTripStore((s) => s.updateTrip);
  const trip = useTripStore((s) => s.trips.find((t) => t.tripToken === token));
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);
  const { highContrast, largeText } = useAccessibilityStore();
  const { t } = useI18n();

  if (!trip) {
    return (
      <View className={`flex-1 items-center justify-center px-6 ${highContrast ? 'bg-black' : 'bg-minex-dark'}`}>
        <Text className={`${highContrast ? 'text-white' : 'text-white'} ${largeText ? 'text-xl' : 'text-lg'} text-center mb-4 font-poppins-medium`}>
          {t('weight', 'notFoundTitle')}
        </Text>
        <ButtonPrimary
          title={t('weight', 'notFoundBack')}
          onPress={() => navigation.goBack()}
          variant="secondary"
        />
      </View>
    );
  }

  const handleSubmit = async () => {
    const weightKg = parseFloat(weight);

    if (!weight || isNaN(weightKg) || weightKg <= 0) {
      triggerWarningHaptic();
      Alert.alert(t('weight', 'invalidWeightTitle'), t('weight', 'invalidWeightMessage'));
      return;
    }

    // Prevent duplicate submissions if already in progress
    if ((trip as any)?.completionPending || loading) {
      return;
    }

    setLoading(true);

    const completeData: CompleteTripRequest = {
      tripToken,
      weightKg: Math.round(weightKg),
    };

    const netInfo = await NetInfo.fetch();
    const isOnline = netInfo.isConnected;

    if (!isOnline) {
      // Save offline
      const updatedTrip = {
        ...trip,
        arrivalAt: new Date().toISOString(),
        weightKg: completeData.weightKg,
        status: 'Completed' as const,
        offline: true,
        completionPending: true,
      };
      await offlineStorage.saveTrip(updatedTrip);
      updateTrip(tripToken, updatedTrip as any);
      setLoading(false);
      triggerSuccessHaptic();
      Alert.alert(
        t('weight', 'offlineTitle'),
        t('weight', 'offlineMessage'),
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
      return;
    }

    try {
      // Mark as pending completion to block rescans
      updateTrip(tripToken, { completionPending: true } as any);
      const completedTrip = await tripAPI.completeTrip(completeData);
      updateTrip(tripToken, { ...completedTrip, completionPending: false } as any);
      setLoading(false);
      triggerSuccessHaptic();
      Alert.alert(
        t('weight', 'completedTitle'),
        t('weight', 'completedMessage', tripToken, (weightKg / 1000).toFixed(2)),
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    } catch (error: any) {
      // Handle logical errors from server: do NOT create offline completion
      const status = error?.response?.status as number | undefined;
      if (status === 404 || status === 409) {
        // Already completed or not eligible; clear pending flag
        updateTrip(tripToken, { completionPending: false } as any);
        setLoading(false);
        triggerWarningHaptic();
        Alert.alert(
          t('weight', 'alreadyCompletedTitle'),
          t('weight', 'alreadyCompletedMessage'),
          [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
        );
        return;
      }

      // Fallback to offline storage only for network/timeouts/5xx
      const updatedTrip = {
        ...trip,
        arrivalAt: new Date().toISOString(),
        weightKg: completeData.weightKg,
        status: 'Completed' as const,
        offline: true,
        completionPending: true,
      };
      await offlineStorage.saveTrip(updatedTrip);
      updateTrip(tripToken, updatedTrip as any);
      setLoading(false);
      triggerSuccessHaptic();
      Alert.alert(
        t('weight', 'offlineErrorTitle'),
        t('weight', 'offlineErrorMessage'),
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${highContrast ? 'bg-black' : 'bg-minex-dark'}`} edges={['top','left','right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow px-6 py-6"
          keyboardShouldPersistTaps="handled"
        >
        {/* Header */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-2">
            <Text className={`${highContrast ? 'text-white' : 'text-white'} ${largeText ? 'text-3xl' : 'text-2xl'} font-poppins-bold`}>{t('weight', 'headerTitle')}</Text>
            <View className="w-10 h-10 rounded-full items-center justify-center bg-white/10 border border-white/10">
              <Text className="text-white" onPress={() => navigation.goBack()}>✕</Text>
            </View>
          </View>
          <Text className={`${highContrast ? 'text-white' : 'text-white/70'} ${largeText ? 'text-base' : 'text-sm'} font-poppins-medium`}>
            {t('weight', 'headerSubtitle')}
          </Text>
        </View>

        <View className={`rounded-xl p-4 mb-6 border ${highContrast ? 'border-yellow-400 bg-yellow-300' : 'border-[#0F67FE]/30 bg-[#0F67FE]/10'}`}>
          <Text className={`${highContrast ? 'text-black' : 'text-white/80'} ${largeText ? 'text-base' : 'text-sm'} mb-1 font-poppins-medium`}>{t('weight', 'tripTokenLabel')}</Text>
          <Text className={`${highContrast ? 'text-black' : 'text-white'} ${largeText ? 'text-xl' : 'text-lg'} font-poppins-bold`}>{trip.tripToken}</Text>
        </View>

        <View className="mb-6">
          <Text className={`${highContrast ? 'text-white' : 'text-white'} ${largeText ? 'text-base' : 'text-sm'} font-poppins-medium mb-2`}>{t('weight', 'weightLabel')}</Text>
          <TextInput
            value={weight}
            onChangeText={setWeight}
            placeholder={t('weight', 'weightPlaceholder')}
            placeholderTextColor="#666"
            keyboardType="numeric"
            className={`px-4 py-4 rounded-xl ${largeText ? 'text-xl' : 'text-lg'} ${highContrast ? 'text-black bg-white border-white' : 'text-white bg-white/5 border border-white/10'}`}
            style={{ minHeight: 56 }}
            autoFocus
          />
          <Text className={`${highContrast ? 'text-white' : 'text-white/60'} ${largeText ? 'text-sm' : 'text-xs'} mt-2`}>
            {t('weight', 'weightExample')}
          </Text>
        </View>

        <View className="mb-4">
          {weight && !isNaN(parseFloat(weight)) && parseFloat(weight) > 0 && (
            <View className={`rounded-xl p-4 mb-4 border ${highContrast ? 'border-yellow-400 bg-yellow-300' : 'border-[#0F67FE]/30 bg-[#0F67FE]/10'}`}>
              <Text className={`${highContrast ? 'text-black' : 'text-[#0F67FE]'} text-center ${largeText ? 'text-xl' : 'text-lg'} font-poppins-bold`}>
                {t('weight', 'summaryTons', (parseFloat(weight) / 1000).toFixed(2))}
              </Text>
            </View>
          )}
        </View>

        <ButtonPrimary
          title={t('weight', 'completeButton')}
          onPress={handleSubmit}
          loading={loading}
          disabled={loading || !weight}
        />

          <ButtonPrimary
          title={t('weight', 'cancelButton')}
            onPress={() => navigation.goBack()}
            variant="secondary"
            size="medium"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
