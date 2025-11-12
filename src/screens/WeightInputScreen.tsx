import React, { useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { ButtonPrimary } from '../components/ButtonPrimary';
import { useTripStore } from '../store/useTripStore';
import { tripAPI, CompleteTripRequest } from '../api/tripAPI';
import { offlineStorage } from '../utils/storage';
import NetInfo from '@react-native-community/netinfo';

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
  const { getTripByToken, updateTrip } = useTripStore();
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);

  const trip = getTripByToken(tripToken);

  if (!trip) {
    return (
      <View className="flex-1 items-center justify-center bg-minex-dark px-6">
        <Text className="text-white text-lg text-center mb-4">
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
      Alert.alert('Invalid Weight', 'Please enter a valid weight in kilograms');
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
      };
      await offlineStorage.saveTrip(updatedTrip);
      updateTrip(tripToken, updatedTrip);
      setLoading(false);
      Alert.alert(
        'Trip Completed (Offline)',
        'Trip will be synced when connection is restored',
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
      return;
    }

    try {
      const completedTrip = await tripAPI.completeTrip(completeData);
      updateTrip(tripToken, completedTrip);
      setLoading(false);
      Alert.alert(
        'Trip Completed',
        `Trip ${tripToken} completed successfully with ${(weightKg / 1000).toFixed(2)} tons`,
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    } catch (error: any) {
      // Fallback to offline storage
      const updatedTrip = {
        ...trip,
        arrivalAt: new Date().toISOString(),
        weightKg: completeData.weightKg,
        status: 'Completed' as const,
        offline: true,
      };
      await offlineStorage.saveTrip(updatedTrip);
      updateTrip(tripToken, updatedTrip);
      setLoading(false);
      Alert.alert(
        'Trip Completed (Offline)',
        'Network error. Trip will be synced when connection is restored',
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-minex-dark"
    >
      <ScrollView
        contentContainerClassName="flex-grow px-6 py-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-6">
          <Text className="text-white text-2xl font-bold mb-2">Complete Trip</Text>
          <Text className="text-minex-text-secondary text-sm">
            Enter the weight (tonnage) for this trip
          </Text>
        </View>

        <View className="bg-minex-gray-light rounded-lg p-4 mb-6 border border-minex-gray">
          <Text className="text-minex-text-secondary text-sm mb-1">Trip Token</Text>
          <Text className="text-white text-lg font-bold">{trip.tripToken}</Text>
        </View>

        <View className="mb-6">
          <Text className="text-white text-sm font-semibold mb-2">Weight (Kilograms)</Text>
          <TextInput
            value={weight}
            onChangeText={setWeight}
            placeholder="Enter weight in kg (e.g., 13200)"
            placeholderTextColor="#666"
            keyboardType="numeric"
            className="bg-minex-gray-light text-white px-4 py-4 rounded-lg text-lg border border-minex-gray"
            style={{ minHeight: 56 }}
            autoFocus
          />
          <Text className="text-minex-text-secondary text-xs mt-2">
            Example: 13200 kg = 13.2 tons
          </Text>
        </View>

        <View className="mb-4">
          {weight && !isNaN(parseFloat(weight)) && parseFloat(weight) > 0 && (
            <View className="bg-minex-orange/20 rounded-lg p-4 mb-4">
              <Text className="text-minex-orange text-center text-lg font-bold">
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
  );
};

