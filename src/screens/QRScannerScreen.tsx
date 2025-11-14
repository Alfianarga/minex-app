import React, { useState } from 'react';
import { View, Text, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { QRScannerView } from '../components/QRScannerView';
import { useAuthStore } from '../store/useAuthStore';
import { useTripStore } from '../store/useTripStore';
import { tripAPI, StartTripRequest } from '../api/tripAPI';
import { USER_ROLES, TRIP_STATUS } from '../utils/constants';
import { offlineStorage } from '../utils/storage';
import NetInfo from '@react-native-community/netinfo';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface QRScannerScreenProps {
  navigation: any;
}

export const QRScannerScreen: React.FC<QRScannerScreenProps> = ({ navigation }) => {
  const { user } = useAuthStore();
  const { addTrip, getTripByToken, updateTrip } = useTripStore();
  const [processing, setProcessing] = useState(false);
  const insets = useSafeAreaInsets();

  const isOperator = user?.role === USER_ROLES.OPERATOR;
  const isChecker = user?.role === USER_ROLES.CHECKER;

  // const parseQRData = (data: string): { tripToken: string; vehicleId?: number; driverName?: string; destinationId?: number; materialId?: number } | null => {
  //   try {
  //     // Try parsing as JSON first
  //     const parsed = JSON.parse(data);
  //     return parsed;
  //   } catch {
  //     // If not JSON, assume it's just the tripToken
  //     return { tripToken: data };
  //   }
  // };

  const parseQRData = (data: string) => {
    try {
      return JSON.parse(data);
    } catch {
      return { tripToken: data };
    }
  };
  
  let lastScanTime = 0;

  const handleScan = async (data: string) => {
    if (processing) return;

    const now = Date.now();

    // Ignore scans within 1 second
    if (now - lastScanTime < 1000) return;
    lastScanTime = now;

    setProcessing(true);

    try {
      const qrData = parseQRData(data);
      if (!qrData) {
        Alert.alert('Invalid QR Code', 'QR data unreadable');
        setProcessing(false);
        return;
      }
      
      if ((user?.role?.toUpperCase() === 'OPERATOR') && !qrData.vehicleId) {
        Alert.alert('Invalid QR Code', 'QR code missing vehicle information');
        setProcessing(false);
        return;
      }
      
      if ((user?.role?.toUpperCase() === 'CHECKER') && !qrData.tripToken) {
        Alert.alert('Invalid QR Code', 'QR code missing trip token');
        setProcessing(false);
        return;
      }      

      const { tripToken } = qrData;

      if (user?.role?.toUpperCase() === 'OPERATOR') {
        // Operator: Start new trip
        await handleStartTrip(qrData);
      } else if (user?.role?.toUpperCase() === 'CHECKER') {
        // Checker: Complete existing trip
        handleCompleteTrip(tripToken);
      } else {
        Alert.alert('Unauthorized', 'Your role does not have permission to scan QR codes');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to process QR code');
    } finally {
      setProcessing(false);
    }
  };

  // const handleStartTrip = async (qrData: any) => {
  //   const startData: StartTripRequest = {
  //     tripToken: qrData.tripToken,
  //     vehicleId: qrData.vehicleId || 1, // Default values if not in QR
  //     driverName: qrData.driverName || 'Unknown',
  //     destinationId: qrData.destinationId || 1,
  //     materialId: qrData.materialId || 1,
  //   };
  const handleStartTrip = async (qrData: any) => {
  
    const startData: StartTripRequest = {
      tripToken: qrData.tripToken,           // ✅ from QR
      vehicleId: qrData.vehicleId,           // ✅ from QR
      destination: qrData.destination,       // ✅ required by backend
      material: qrData.material,             // ✅ required by backend
    };

    try {
      // 1️⃣ Check local offline trips first
      const existingTrip = getTripByToken(qrData.tripToken);
      if (existingTrip && existingTrip.status?.toUpperCase() === "PENDING") {
        Alert.alert(
          'Trip Already Pending',
          `Trip ${qrData.tripToken} is already in progress. Complete it before starting a new one.`
        );
        setProcessing(false);
        return;
      }
  
      // 2️⃣ Check network connection
      const netInfo = await NetInfo.fetch();
      const isOnline = netInfo.isConnected;
  
      if (!isOnline) {
        // Save offline if no connection
        const offlineTrip = {
          ...startData,
          departureAt: new Date().toISOString(),
          status: "PENDING",
          offline: true,
        };
        await offlineStorage.saveTrip(offlineTrip);
        addTrip(offlineTrip as any);
        Alert.alert(
          'Trip Saved Offline',
          'Trip will be synced when connection is restored',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        setProcessing(false);
        return;
      }
  
      // 3️⃣ Start trip via API
      const trip = await tripAPI.startTrip(startData);
      addTrip(trip);

      Alert.alert(
        'Trip Started',
        `Trip ${qrData.tripToken} has been created successfully`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      // 4️⃣ Handle duplicate trip or network error
      if (error?.response?.status === 409) {
        Alert.alert('Trip Already Pending', error.response.data.error);
      } else {
        // Save offline if API fails
        const offlineTrip = {
          ...startData,
          departureAt: new Date().toISOString(),
          status: "PENDING",
          offline: true,
        };
        await offlineStorage.saveTrip(offlineTrip);
        addTrip(offlineTrip as any);
        Alert.alert(
          'Trip Saved Offline',
          'Network error. Trip will be synced when connection is restored',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleCompleteTrip = (tripToken: string) => {
    const existingTrip = getTripByToken(tripToken);
  
    if (!existingTrip) {
      Alert.alert('Trip Not Found', 'This trip does not exist.', [{ text: 'OK' }]);
      return;
    }
  
    if (existingTrip.status?.toUpperCase() === 'COMPLETED') {
      Alert.alert('Already Completed', 'This trip has already been completed', [{ text: 'OK' }]);
      return;
    }
  
    // 1️⃣ Close the modal first
    navigation.goBack();
  
    // 2️⃣ Navigate after a slight delay
    setTimeout(() => {
      navigation.navigate('WeightInput', { tripToken });
    }, 100);
  };

  if (processing) {
    return (
      <View className="flex-1 items-center justify-center bg-minex-dark">
        <ActivityIndicator size="large" color="#0F67FE" />
        <Text className="text-white text-lg mt-4 font-poppins-medium">Processing...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-minex-dark" edges={['top','left','right']}>
      <QRScannerView onScan={handleScan} />
      <View
        className="absolute left-0 right-0 px-6"
        style={{ top: insets.top + 12 }}
      >
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-2xl font-poppins-bold">Scan QR Code</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 rounded-full items-center justify-center bg-white/10 border border-white/10" activeOpacity={0.8}>
            <Text className="text-white">✕</Text>
          </TouchableOpacity>
        </View>
        <View className="rounded-xl p-4 border border-[#0F67FE]/30 bg-[#0F67FE]/10">
          <Text className="text-white text-center text-base font-poppins-medium">
            {user?.role?.toUpperCase() === 'OPERATOR' ? 'Scan QR to Start Trip' : 'Scan QR to Complete Trip'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

