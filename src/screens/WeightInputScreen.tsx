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

  if (!trip) {
    return (
      <View className={`flex-1 items-center justify-center px-6 ${highContrast ? 'bg-black' : 'bg-minex-dark'}`}>
        <Text className={`${highContrast ? 'text-white' : 'text-white'} ${largeText ? 'text-xl' : 'text-lg'} text-center mb-4 font-poppins-medium`}>
          Trip not found
        </Text>
        <ButtonPrimary
          title="Go Back"
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
      Alert.alert('Invalid Weight', 'Please enter a valid weight in kilograms');
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
        'Trip Completed (Offline)',
        'Trip will be synced when connection is restored',
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
        'Trip Completed',
        `Trip ${tripToken} completed successfully with ${(weightKg / 1000).toFixed(2)} tons`,
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
          'Already Completed',
          'This trip has already been completed on the server.',
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
        'Trip Completed (Offline)',
        'Network error. Trip will be synced when connection is restored',
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
            <Text className={`${highContrast ? 'text-white' : 'text-white'} ${largeText ? 'text-3xl' : 'text-2xl'} font-poppins-bold`}>Complete Trip</Text>
            <View className="w-10 h-10 rounded-full items-center justify-center bg-white/10 border border-white/10">
              <Text className="text-white" onPress={() => navigation.goBack()}>✕</Text>
            </View>
          </View>
          <Text className={`${highContrast ? 'text-white' : 'text-white/70'} ${largeText ? 'text-base' : 'text-sm'} font-poppins-medium`}>
            Enter the weight (tonnage) for this trip
          </Text>
        </View>

        <View className={`rounded-xl p-4 mb-6 border ${highContrast ? 'border-yellow-400 bg-yellow-300' : 'border-[#0F67FE]/30 bg-[#0F67FE]/10'}`}>
          <Text className={`${highContrast ? 'text-black' : 'text-white/80'} ${largeText ? 'text-base' : 'text-sm'} mb-1 font-poppins-medium`}>Trip Token</Text>
          <Text className={`${highContrast ? 'text-black' : 'text-white'} ${largeText ? 'text-xl' : 'text-lg'} font-poppins-bold`}>{trip.tripToken}</Text>
        </View>

        <View className="mb-6">
          <Text className={`${highContrast ? 'text-white' : 'text-white'} ${largeText ? 'text-base' : 'text-sm'} font-poppins-medium mb-2`}>Weight (Kilograms)</Text>
          <TextInput
            value={weight}
            onChangeText={setWeight}
            placeholder="Enter weight in kg (e.g., 13200)"
            placeholderTextColor="#666"
            keyboardType="numeric"
            className={`px-4 py-4 rounded-xl ${largeText ? 'text-xl' : 'text-lg'} ${highContrast ? 'text-black bg-white border-white' : 'text-white bg-white/5 border border-white/10'}`}
            style={{ minHeight: 56 }}
            autoFocus
          />
          <Text className={`${highContrast ? 'text-white' : 'text-white/60'} ${largeText ? 'text-sm' : 'text-xs'} mt-2`}>
            Example: 13200 kg = 13.2 tons
          </Text>
        </View>

        <View className="mb-4">
          {weight && !isNaN(parseFloat(weight)) && parseFloat(weight) > 0 && (
            <View className={`rounded-xl p-4 mb-4 border ${highContrast ? 'border-yellow-400 bg-yellow-300' : 'border-[#0F67FE]/30 bg-[#0F67FE]/10'}`}>
              <Text className={`${highContrast ? 'text-black' : 'text-[#0F67FE]'} text-center ${largeText ? 'text-xl' : 'text-lg'} font-poppins-bold`}>
                {(parseFloat(weight) / 1000).toFixed(2)} tons
              </Text>
            </View>
          )}
        </View>

        <ButtonPrimary
          title="Complete Trip"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading || !weight}
        />

          <ButtonPrimary
            title="Cancel"
            onPress={() => navigation.goBack()}
            variant="secondary"
            size="medium"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
