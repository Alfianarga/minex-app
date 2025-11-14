import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Trip } from '../api/tripAPI';
import { formatDate, getDuration } from '../utils/formatDate';
import { TRIP_STATUS } from '../utils/constants';

interface TripCardProps {
  trip: Trip;
  onPress?: () => void;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, onPress }) => {
  const status = (trip.status ?? '').trim().toUpperCase();
  const isCompleted = status === 'COMPLETED';
  const isPending = status === 'PENDING';
  const badgeContainer = isCompleted
    ? 'bg-emerald-400/15 border border-emerald-400'
    : 'bg-amber-400/15 border border-amber-400';
  const badgeText = isCompleted ? 'text-emerald-300' : 'text-amber-300';

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white/5 rounded-xl p-4 mb-3 border border-white/10"
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-white text-lg font-poppins-bold mb-1">{trip.tripToken}</Text>
          <Text className="text-white/70 text-sm">Destination: {trip.destination}</Text>
        </View>
        <View className={`${badgeContainer} px-3 py-1 rounded-full`}>
          <Text className={`${badgeText} text-xs font-poppins-medium`}>
            {trip.status}
          </Text>
        </View>
      </View>

      <View className="mt-3">
        <View className="flex-row justify-between mb-2">
          <Text className="text-white/70 text-sm">Departure:</Text>
          <Text className="text-white text-sm font-poppins-medium">
            {formatDate(trip.departureAt)}
          </Text>
        </View>

        {isCompleted && trip.arrivalAt && (
          <>
            <View className="flex-row justify-between mb-2">
              <Text className="text-white/70 text-sm">Arrival:</Text>
              <Text className="text-white text-sm font-poppins-medium">
                {formatDate(trip.arrivalAt)}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-white/70 text-sm">Duration:</Text>
              <Text className="text-white text-sm font-poppins-medium">
                {getDuration(trip.departureAt, trip.arrivalAt)}
              </Text>
            </View>
            {trip.weightKg && (
              <View className="flex-row justify-between">
                <Text className="text-white/70 text-sm">Weight:</Text>
                <Text className="text-[#0F67FE] text-sm font-poppins-bold">
                  {(trip.weightKg / 1000).toFixed(2)} tons
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

