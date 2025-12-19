import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TripCard } from '../components/TripCard';
import { useTripStore } from '../store/useTripStore';
import { tripAPI } from '../api/tripAPI';
import { offlineStorage } from '../utils/storage';
import { TRIP_STATUS } from '../utils/constants';
import NetInfo from '@react-native-community/netinfo';
import { useAccessibilityStore } from '../store/useAccessibilityStore';
import { useI18n } from '../i18n';
import { formatDate } from '../utils/formatDate';

interface TripListScreenProps {
  navigation: any;
}

export const TripListScreen: React.FC<TripListScreenProps> = ({ navigation, route }: any) => {
  const { trips, setTrips, offlineTrips, updateTrip } = useTripStore();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [closingToken, setClosingToken] = useState<string | null>(null);
  const [selectedTripToken, setSelectedTripToken] = useState<string | null>(null);
  const { highContrast, largeText } = useAccessibilityStore();
  const { t } = useI18n();

  useEffect(() => {
    loadTrips();
    loadOfflineTrips();
  }, []);

  // If navigated with a specific trip token (e.g. from QR scan), focus that trip once
  useEffect(() => {
    const focusToken = route?.params?.focusTripToken as string | undefined;
    if (!focusToken) return;

    // Always open the modal and focus the pending filter when a focus token is provided.
    // The detailed data will be filled from the store via selectedTrip when available.
    setFilter('pending');
    setSelectedTripToken(focusToken);
    // Clear param so the modal doesn't reopen after user closes it
    if (navigation?.setParams) {
      navigation.setParams({ focusTripToken: undefined });
    }
  }, [route?.params?.focusTripToken, navigation]);

  const loadTrips = async () => {
    try {
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        const fetchedTrips = await tripAPI.getTrips();
        setTrips(fetchedTrips);
      }
    } catch (error) {
      console.error('Error loading trips:', error);
    }
  };

  const loadOfflineTrips = async () => {
    try {
      const offline = await offlineStorage.getOfflineTrips();
  
      if (offline.length > 0) {
        const allTrips = [...trips, ...offline];
  
        // Deduplicate by tripToken
        const uniqueTrips = allTrips.filter(
          (trip, index, self) =>
            index === self.findIndex((t) => t.tripToken === trip.tripToken)
        );
  
        setTrips(uniqueTrips);
      }
    } catch (error) {
      console.error('Error loading offline trips:', error);
    }
  };
  

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTrips();
    await loadOfflineTrips();
    setRefreshing(false);
  };

  const handleCloseInField = (tripToken: string) => {
    Alert.alert(
      t('trips', 'closeFieldConfirmTitle'),
      t('trips', 'closeFieldConfirmMessage', tripToken),
      [
        { text: t('common', 'cancel'), style: 'cancel' },
        {
          text: t('trips', 'closeFieldButton'),
          onPress: async () => {
            try {
              setClosingToken(tripToken);
              const updated = await tripAPI.closeTripInField(tripToken);
              updateTrip(tripToken, updated as any);
              Alert.alert(
                t('trips', 'closeFieldSuccessTitle'),
                t('trips', 'closeFieldSuccessMessage')
              );
              setSelectedTripToken(null);
            } catch (error) {
              const status = (error as any)?.response?.status as number | undefined;
              if (status === 409) {
                Alert.alert(
                  t('trips', 'closeFieldAlreadyTitle'),
                  t('trips', 'closeFieldAlreadyMessage')
                );
              } else {
                console.error('Error closing trip in field:', error);
                Alert.alert('Error', 'Failed to close trip in field');
              }
            } finally {
              setClosingToken(null);
            }
          },
        },
      ]
    );
  };

  // Only show today's trips by default (regardless of role)
  const isSameYMD = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const today = new Date();

  // Build today's pool for counts and list
  const todayTrips = trips.filter((t) => {
    const dep = t.departureAt ? new Date(t.departureAt) : null;
    return dep && isSameYMD(dep, today);
  });

  const filteredTrips = todayTrips.filter((trip) => {
    const status = trip.status?.toUpperCase();
    if (filter === 'pending') return status === 'OPEN';
    if (filter === 'completed')
      return (
        status === 'COMPLETED_PLANT' ||
        status === 'CLOSED_FIELD' ||
        status === 'CLOSE_FIELD'
      );
    return true;
  });

  const sortedTrips = [...filteredTrips].sort((a, b) => {
    const dateA = new Date(a.departureAt).getTime();
    const dateB = new Date(b.departureAt).getTime();
    return dateB - dateA; // Newest first
  });

  const selectedTrip = selectedTripToken
    ? trips.find((trip) => trip.tripToken === selectedTripToken)
    : null;

  const selectedPlate = selectedTrip?.tripToken
    ? selectedTrip.tripToken.split('-')[1] || undefined
    : undefined;

  return (
    <SafeAreaView className={`flex-1 ${highContrast ? 'bg-black' : 'bg-minex-dark'}`} edges={['top','left','right']}>
      {/* Header */}
      <View className="px-6 pt-4 pb-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className={`${highContrast ? 'text-white' : 'text-white'} ${largeText ? 'text-3xl' : 'text-2xl'} font-poppins-bold`}>{t('trips', 'headerTitle')}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 rounded-full items-center justify-center bg-white/10 border border-white/10" activeOpacity={0.8}>
            <Text className="text-white">✕</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View className="flex-row flex-wrap mt-1">
          <TouchableOpacity
            onPress={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl mr-2 mb-2 border ${
              filter === 'all'
                ? (highContrast ? 'bg-white border-white' : 'bg-[#0F67FE] border-[#0F67FE]')
                : (highContrast ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10')
            }`}
          >
            <Text
              className={`${largeText ? 'text-base' : 'text-sm'} font-poppins-medium ${
                filter === 'all' ? (highContrast ? 'text-black' : 'text-white') : (highContrast ? 'text-white' : 'text-white/70')
              }`}
            >
              {t('trips', 'filterAll')} ({todayTrips.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilter('pending')}
            className={`px-4 py-2 rounded-xl mr-2 mb-2 border ${
              filter === 'pending'
                ? (highContrast ? 'bg-yellow-300 border-yellow-400' : 'bg-amber-500/20 border-amber-400')
                : (highContrast ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10')
            }`}
          >
            <Text
              className={`${largeText ? 'text-base' : 'text-sm'} font-poppins-medium ${
                filter === 'pending' ? (highContrast ? 'text-black' : 'text-amber-300') : (highContrast ? 'text-white' : 'text-white/70')
              }`}
            >
              {t('trips', 'filterActive')} ({todayTrips.filter((t) => t.status?.toUpperCase() === 'OPEN').length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilter('completed')}
            className={`px-4 py-2 rounded-xl mb-2 border ${
              filter === 'completed'
                ? (highContrast ? 'bg-green-300 border-green-400' : 'bg-emerald-500/20 border-emerald-400')
                : (highContrast ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10')
            }`}
          >
            <Text
              className={`${largeText ? 'text-base' : 'text-sm'} font-poppins-medium ${
                filter === 'completed' ? (highContrast ? 'text-black' : 'text-emerald-300') : (highContrast ? 'text-white' : 'text-white/70')
              }`}
            >
              {t('trips', 'filterCompleted')} ({
                todayTrips.filter((t) => {
                  const status = t.status?.toUpperCase();
                  return (
                    status === 'COMPLETED_PLANT' ||
                    status === 'CLOSED_FIELD' ||
                    status === 'CLOSE_FIELD'
                  );
                }).length
              })
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Trip List */}
      <FlatList
        data={sortedTrips}
        keyExtractor={(item, index) => `${item.tripToken ?? 'offline'}-${index}`}
        renderItem={({ item }) => {
          const status = item.status?.toUpperCase();
          const isOpen = status === 'OPEN';
          return (
            <View className="px-6 mt-4">
              <TripCard
                trip={item}
                onPress={() => {
                  if (isOpen) {
                    setSelectedTripToken(item.tripToken);
                  }
                }}
              />
            </View>
          );
        }}
        contentContainerClassName="pb-6"
        ListEmptyComponent={
          <View className="items-center justify-center py-12 px-6">
            <Text className={`${highContrast ? 'text-white' : 'text-white/80'} ${largeText ? 'text-xl' : 'text-lg'} text-center font-poppins-medium`}>
              {t('trips', 'emptyTitle')}
            </Text>
            <Text className={`${highContrast ? 'text-white' : 'text-white/60'} ${largeText ? 'text-base' : 'text-sm'} text-center mt-2`}>
              {filter === 'all'
                ? t('trips', 'emptyAllDescription')
                : t('trips', 'emptyFilteredDescription', filter)}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0F67FE"
            colors={["#0F67FE"]}
          />
        }
      />

      {/* Detail modal for OPEN trip */}
      <Modal
        visible={!!selectedTripToken}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedTripToken(null)}
      >
        <View className="flex-1 justify-center items-center bg-black/60">
          <View className="w-11/12 rounded-2xl p-6 bg-minex-dark border border-white/10">
            <Text className={`${highContrast ? 'text-white' : 'text-white'} ${largeText ? 'text-xl' : 'text-lg'} font-poppins-bold mb-2`}>
              {t('trips', 'statusOpen')}
            </Text>
            {selectedTrip && (
              <>
                <Text className={`${highContrast ? 'text-white/80' : 'text-white/80'} ${largeText ? 'text-base' : 'text-sm'} mb-1`}>
                  Token: {selectedTrip.tripToken}
                </Text>
                {selectedPlate && (
                  <Text className={`${highContrast ? 'text-white/80' : 'text-white/80'} ${largeText ? 'text-base' : 'text-sm'} mb-1`}>
                    Plat kendaraan: {selectedPlate}
                  </Text>
                )}
                {selectedTrip.destination && (
                  <Text className={`${highContrast ? 'text-white/80' : 'text-white/80'} ${largeText ? 'text-base' : 'text-sm'} mb-1`}>
                    Tujuan: {selectedTrip.destination}
                  </Text>
                )}
                {selectedTrip.material && (
                  <Text className={`${highContrast ? 'text-white/80' : 'text-white/80'} ${largeText ? 'text-base' : 'text-sm'} mb-1`}>
                    Material: {selectedTrip.material}
                  </Text>
                )}
                {selectedTrip.departureAt && (
                  <Text className={`${highContrast ? 'text-white/80' : 'text-white/80'} ${largeText ? 'text-base' : 'text-sm'} mb-4`}>
                    Berangkat: {formatDate(selectedTrip.departureAt)}
                  </Text>
                )}
              </>
            )}

            <View className="flex-row justify-end mt-2">
              <TouchableOpacity
                onPress={() => setSelectedTripToken(null)}
                className="px-4 py-2 rounded-full mr-2 border border-white/20 bg-white/5"
                activeOpacity={0.8}
              >
                <Text className={`${highContrast ? 'text-white' : 'text-white'} ${largeText ? 'text-sm' : 'text-xs'} font-poppins-medium`}>
                  {t('common', 'cancel')}
                </Text>
              </TouchableOpacity>
              {selectedTripToken && (
                <TouchableOpacity
                  disabled={closingToken === selectedTripToken}
                  onPress={() => {
                    handleCloseInField(selectedTripToken);
                  }}
                  className={`px-4 py-2 rounded-full border ${
                    highContrast
                      ? 'bg-yellow-300 border-yellow-400'
                      : 'bg-amber-500/20 border-amber-300'
                  } ${closingToken === selectedTripToken ? 'opacity-60' : ''}`}
                  activeOpacity={0.85}
                >
                  <Text className={`${
                    highContrast ? 'text-black' : 'text-amber-200'
                  } ${largeText ? 'text-sm' : 'text-xs'} font-poppins-medium`}>
                    {closingToken === selectedTripToken
                      ? t('trips', 'closeFieldProcessing')
                      : t('trips', 'closeFieldButton')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
;

