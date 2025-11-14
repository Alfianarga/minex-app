import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TripCard } from '../components/TripCard';
import { useTripStore } from '../store/useTripStore';
import { tripAPI } from '../api/tripAPI';
import { offlineStorage } from '../utils/storage';
import { TRIP_STATUS } from '../utils/constants';
import NetInfo from '@react-native-community/netinfo';

interface TripListScreenProps {
  navigation: any;
}

export const TripListScreen: React.FC<TripListScreenProps> = ({ navigation }) => {
  const { trips, setTrips, offlineTrips } = useTripStore();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    loadTrips();
    loadOfflineTrips();
  }, []);

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

  // Only show today's trips by default (regardless of role)
  const isSameYMD = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const today = new Date();

  // Build today's pool for counts and list
  const todayTrips = trips.filter((t) => {
    const dep = t.departureAt ? new Date(t.departureAt) : null;
    return dep && isSameYMD(dep, today);
  });

  const filteredTrips = todayTrips.filter((trip) => {
    if (filter === 'pending') return trip.status?.toUpperCase() === "PENDING";
    if (filter === 'completed') return trip.status?.toUpperCase() === "COMPLETED";
    return true;
  });

  const sortedTrips = [...filteredTrips].sort((a, b) => {
    const dateA = new Date(a.departureAt).getTime();
    const dateB = new Date(b.departureAt).getTime();
    return dateB - dateA; // Newest first
  });

  return (
    <SafeAreaView className="flex-1 bg-minex-dark" edges={['top','left','right']}>
      {/* Header */}
      <View className="px-6 pt-4 pb-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-2xl font-poppins-bold">Trip List</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 rounded-full items-center justify-center bg-white/10 border border-white/10" activeOpacity={0.8}>
            <Text className="text-white">✕</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View className="flex-row">
          <TouchableOpacity
            onPress={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl mr-2 border ${
              filter === 'all' ? 'bg-[#0F67FE] border-[#0F67FE]' : 'bg-white/5 border-white/10'
            }`}
          >
            <Text
              className={`text-sm font-poppins-medium ${
                filter === 'all' ? 'text-white' : 'text-white/70'
              }`}
            >
              All ({todayTrips.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilter('pending')}
            className={`px-4 py-2 rounded-xl mr-2 border ${
              filter === 'pending' ? 'bg-amber-500/20 border-amber-400' : 'bg-white/5 border-white/10'
            }`}
          >
            <Text
              className={`text-sm font-poppins-medium ${
                filter === 'pending' ? 'text-amber-300' : 'text-white/70'
              }`}
            >
              Pending ({todayTrips.filter((t) => t.status?.toUpperCase() === 'PENDING').length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilter('completed')}
            className={`px-4 py-2 rounded-xl border ${
              filter === 'completed' ? 'bg-emerald-500/20 border-emerald-400' : 'bg-white/5 border-white/10'
            }`}
          >
            <Text
              className={`text-sm font-poppins-medium ${
                filter === 'completed' ? 'text-emerald-300' : 'text-white/70'
              }`}
            >
              Completed ({todayTrips.filter((t) => t.status?.toUpperCase() === 'COMPLETED').length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Trip List */}
      <FlatList
        data={sortedTrips}
        keyExtractor={(item, index) => `${item.tripToken ?? 'offline'}-${index}`}
        renderItem={({ item }) => (
          <View className="px-6 mt-4">
            <TripCard trip={item} />
          </View>
        )}
        contentContainerClassName="pb-6"
        ListEmptyComponent={
          <View className="items-center justify-center py-12 px-6">
            <Text className="text-white/80 text-lg text-center font-poppins-medium">
              No trips found
            </Text>
            <Text className="text-white/60 text-sm text-center mt-2">
              {filter === 'all'
                ? 'Start scanning QR codes to create trips'
                : `No ${filter} trips available`}
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
    </SafeAreaView>
  );
};

