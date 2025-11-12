import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
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

  const filteredTrips = trips.filter((trip) => {
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
    <View className="flex-1 bg-minex-dark">
      {/* Header */}
      <View className="bg-minex-gray px-6 py-4 pt-12">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-2xl font-bold">Trip List</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-minex-orange text-sm font-semibold">Close</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View className="flex-row">
          <TouchableOpacity
            onPress={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg mr-2 ${
              filter === 'all' ? 'bg-minex-orange' : 'bg-minex-gray-light'
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                filter === 'all' ? 'text-white' : 'text-minex-text-secondary'
              }`}
            >
              All ({trips.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg mr-2 ${
              filter === 'pending' ? 'bg-minex-yellow' : 'bg-minex-gray-light'
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                filter === 'pending' ? 'text-white' : 'text-minex-text-secondary'
              }`}
            >
              Pending ({trips.filter((t) => t.status?.toUpperCase() === 'PENDING').length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'completed' ? 'bg-minex-green' : 'bg-minex-gray-light'
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                filter === 'completed' ? 'text-white' : 'text-minex-text-secondary'
              }`}
            >
              Completed ({trips.filter((t) => t.status?.toUpperCase() === 'COMPLETED').length})
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
            <Text className="text-minex-text-secondary text-lg text-center">
              No trips found
            </Text>
            <Text className="text-minex-text-secondary text-sm text-center mt-2">
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
            tintColor="#ff6b35"
            colors={['#ff6b35']}
          />
        }
      />
    </View>
  );
};

