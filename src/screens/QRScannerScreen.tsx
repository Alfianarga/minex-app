import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { QRScannerView } from '../components/QRScannerView';
import { useAuthStore } from '../store/useAuthStore';
import { useTripStore } from '../store/useTripStore';
import { tripAPI, StartTripRequest } from '../api/tripAPI';
import { USER_ROLES, TRIP_STATUS, STORAGE_KEYS } from '../utils/constants';
import { offlineStorage } from '../utils/storage';
import { storage } from '../utils/storage';
import NetInfo from '@react-native-community/netinfo';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAccessibilityStore } from '../store/useAccessibilityStore';
import { triggerSuccessHaptic, triggerWarningHaptic } from '../utils/haptics';
import { useI18n } from '../i18n';

interface QRScannerScreenProps {
  navigation: any;
}

export const QRScannerScreen: React.FC<QRScannerScreenProps> = ({ navigation }) => {
  const { user } = useAuthStore();
  const { addTrip, getTripByToken, updateTrip } = useTripStore();
  const [processing, setProcessing] = useState(false);
  const insets = useSafeAreaInsets();
  const { highContrast, largeText } = useAccessibilityStore();
  const { t } = useI18n();

  const isOperator = user?.role === USER_ROLES.OPERATOR;
  const isChecker = user?.role === USER_ROLES.CHECKER;

  useEffect(() => {
    const ensureToken = async () => {
      const token = await storage.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) {
        Alert.alert(
          'Session expired',
          'Your session has expired. Please log in again to continue scanning.',
          [
            {
              text: 'OK',
              onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }),
            },
          ]
        );
      }
    };

    ensureToken();
  }, [navigation, t]);

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
  
  const lastScanTimeRef = useRef(0);

  const handleScan = async (data: string) => {
    if (processing) return;

    const now = Date.now();

    // Ignore scans within 1 second
    if (now - lastScanTimeRef.current < 1000) return;
    lastScanTimeRef.current = now;

    setProcessing(true);

    try {
      const qrData = parseQRData(data);
      if (!qrData) {
        triggerWarningHaptic();
        Alert.alert(t('qr', 'invalidTitle'), t('qr', 'invalidMessage'));
        setProcessing(false);
        return;
      }
      
      if ((user?.role?.toUpperCase() === 'OPERATOR') && !qrData.vehicleId) {
        triggerWarningHaptic();
        Alert.alert(t('qr', 'invalidTitle'), t('qr', 'invalidVehicle'));
        setProcessing(false);
        return;
      }
      
      if ((user?.role?.toUpperCase() === 'CHECKER') && !qrData.tripToken) {
        triggerWarningHaptic();
        Alert.alert(t('qr', 'invalidTitle'), t('qr', 'invalidTripToken'));
        setProcessing(false);
        return;
      }      

      if (user?.role?.toUpperCase() === 'OPERATOR') {
        // Operator: Start new trip
        await handleStartTrip(qrData);
      } else if (user?.role?.toUpperCase() === 'CHECKER') {
        // Checker: Complete existing trip
        await handleCompleteTrip(qrData.tripToken);
      } else {
        Alert.alert(t('qr', 'unauthorizedTitle'), t('qr', 'unauthorizedMessage'));
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to process QR code');
    } finally {
      setProcessing(false);
    }
  };

  const handleStartTrip = async (qrData: any) => {
    const startData: StartTripRequest = {
      vehicleId: qrData.vehicleId,
      destination: qrData.destination,
      material: qrData.material,
    };

    const maybeToken = qrData.tripToken as string | undefined;

    // If this QR refers to an existing trip token and we already have an OPEN trip locally,
    // shortcut to TripList and show the popup instead of trying to start again.
    if (maybeToken) {
      const existingTrip = getTripByToken(maybeToken);
      if (existingTrip && existingTrip.status?.toUpperCase() === 'OPEN') {
        triggerWarningHaptic();
        Alert.alert(
          t('qr', 'tripAlreadyPendingTitle'),
          t('qr', 'tripAlreadyPendingMessage', maybeToken),
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.goBack();
                setTimeout(() => {
                  navigation.navigate('TripList', { focusTripToken: maybeToken });
                }, 100);
              },
            },
          ]
        );
        return;
      }
    }

    try {
      const trip = await tripAPI.startTrip(startData);
      addTrip(trip);

      triggerSuccessHaptic();
      Alert.alert(
        t('qr', 'tripStartedTitle'),
        t('qr', 'tripStartedMessage', trip.tripToken),
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      const status = error?.response?.status as number | undefined;
      const conflictToken =
        (error?.response?.data?.tripToken as string | undefined) || maybeToken;

      if (status === 409) {
        triggerWarningHaptic();
        Alert.alert(
          t('qr', 'tripAlreadyPendingTitle'),
          (error?.response?.data?.error as string) ||
            t('qr', 'tripAlreadyPendingMessage', conflictToken || ''),
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.goBack();
                setTimeout(() => {
                  if (conflictToken) {
                    navigation.navigate('TripList', { focusTripToken: conflictToken });
                  } else {
                    navigation.navigate('TripList');
                  }
                }, 100);
              },
            },
          ]
        );
        return;
      }

      if (status) {
        triggerWarningHaptic();
        Alert.alert('Error', error?.response?.data?.error || 'Failed to start trip');
        return;
      }

      const offlineTrip = {
        ...startData,
        departureAt: new Date().toISOString(),
        status: 'OPEN',
        offline: true,
      };
      await offlineStorage.saveTrip(offlineTrip);
      addTrip(offlineTrip as any);
      triggerSuccessHaptic();
      Alert.alert(
        t('qr', 'offlineStartTitle'),
        t('qr', 'offlineErrorMessage'),
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleCompleteTrip = async (tripToken: string) => {
    const token = tripToken.trim();
    // Always check server for the latest state first
    let existingTrip = null as any;
    try {
      const serverTrip = await tripAPI.getTripByToken(token);
      if (serverTrip) {
        addTrip(serverTrip);
        existingTrip = serverTrip as any;
      }
    } catch (e: any) {
      // If server says 404, fall back to local (covers legit offline-started trips)
      const status = e?.response?.status as number | undefined;
      if (status !== 404) {
        // For network or other errors, we still can fall back to local
      }
    }

    if (!existingTrip) {
      existingTrip = getTripByToken(token) as any;
    }
    const status = existingTrip?.status?.toUpperCase();
    if (existingTrip && (status === 'COMPLETED_PLANT' || (existingTrip as any).completionPending)) {
      triggerWarningHaptic();
      Alert.alert(t('qr', 'completeAlreadyTitle'), t('qr', 'completeAlreadyMessage'), [{ text: 'OK' }]);
      return;
    }

    // 1️⃣ Close the modal first
    navigation.goBack();

    // 2️⃣ Navigate after a slight delay
    setTimeout(() => {
      navigation.navigate('WeightInput', { tripToken: token });
    }, 100);
  };

  if (processing) {
    return (
      <View className={`flex-1 items-center justify-center ${highContrast ? 'bg-black' : 'bg-minex-dark'}`}>
        <ActivityIndicator size="large" color="#0F67FE" />
        <Text className={`${highContrast ? 'text-white' : 'text-white'} ${largeText ? 'text-xl' : 'text-lg'} mt-4 font-poppins-medium`}>{t('qr', 'processing')}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${highContrast ? 'bg-black' : 'bg-minex-dark'}`} edges={['top','left','right']}>
      <QRScannerView onScan={handleScan} />
      <View
        className="absolute left-0 right-0 px-6"
        style={{ top: insets.top + 12 }}
      >
        <View className="flex-row justify-between items-center mb-4">
          <Text className={`${highContrast ? 'text-white' : 'text-white'} ${largeText ? 'text-3xl' : 'text-2xl'} font-poppins-bold`}>{t('qr', 'startHeader')}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 rounded-full items-center justify-center bg-white/10 border border-white/10" activeOpacity={0.8}>
            <Text className="text-white">✕</Text>
          </TouchableOpacity>
        </View>
        <View className={`rounded-xl p-4 border ${highContrast ? 'border-yellow-400 bg-yellow-300' : 'border-[#0F67FE]/30 bg-[#0F67FE]/10'}`}>
          <Text className={`${highContrast ? 'text-black' : 'text-white'} text-center ${largeText ? 'text-lg' : 'text-base'} font-poppins-medium`}>
            {user?.role?.toUpperCase() === 'OPERATOR' ? t('qr', 'helperOperator') : t('qr', 'helperChecker')}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
;

