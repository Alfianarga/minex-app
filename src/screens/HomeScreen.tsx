import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ButtonPrimary } from '../components/ButtonPrimary';
import { useAuthStore } from '../store/useAuthStore';
import { useTripStore } from '../store/useTripStore';
import { USER_ROLES } from '../utils/constants';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const { pendingTrips } = useTripStore();

  const isOperator = user?.role === USER_ROLES.OPERATOR;
  const isChecker = user?.role === USER_ROLES.CHECKER;

  const handleLogout = async () => {
    await logout();
    useTripStore.getState().logout();
  };

  return (
    <View className="flex-1 bg-minex-dark">
      {/* Header */}
      <View className="bg-minex-gray px-6 py-6 pt-12">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-white text-2xl font-bold">MINEX Mobile</Text>
            <Text className="text-minex-text-secondary text-sm mt-1">
              {user?.email} • {user?.role?.toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-minex-gray-light px-4 py-2 rounded-lg"
          >
            <Text className="text-minex-orange text-sm font-semibold">Logout</Text>
          </TouchableOpacity>
        </View>

        {pendingTrips.length > 0 && (
          <View className="bg-minex-yellow/20 border border-minex-yellow rounded-lg p-3 mt-2">
            <Text className="text-minex-yellow text-sm font-semibold">
              {pendingTrips.length} Pending Trip{pendingTrips.length > 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>

      {/* Menu */}
      <ScrollView className="flex-1 px-6 py-6">
        {/* Scan QR Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('QRScanner')}
          className="bg-minex-gray-light rounded-lg p-6 border border-minex-gray mb-4"
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <View className="bg-minex-orange/20 rounded-full p-4 mr-4">
              <Text className="text-minex-orange text-2xl">📷</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white text-xl font-bold mb-1">
                {user?.role?.toUpperCase() === 'OPERATOR' ? 'Scan QR - Start Trip' : 'Scan QR - Complete Trip'}
              </Text>
              <Text className="text-minex-text-secondary text-sm">
                {user?.role?.toUpperCase() === 'OPERATOR'
                  ? 'Scan QR code at source to create new trip'
                  : 'Scan QR code at destination to complete trip'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* View Trips Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('TripList')}
          className="bg-minex-gray-light rounded-lg p-6 border border-minex-gray mb-4"
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <View className="bg-minex-green/20 rounded-full p-4 mr-4">
              <Text className="text-minex-green text-2xl">📋</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white text-xl font-bold mb-1">View Trips</Text>
              <Text className="text-minex-text-secondary text-sm">
                View all trips (Pending and Completed)
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Role-specific info */}
        <View className="bg-minex-gray-light rounded-lg p-4 mt-4 border border-minex-gray">
          <Text className="text-white font-semibold mb-2">Your Role: {user?.role?.toUpperCase()}</Text>
          <Text className="text-minex-text-secondary text-sm">
            {user?.role?.toUpperCase() === 'OPERATOR'
              ? 'As an Operator, you scan QR codes at the source (Tambang) to start new trips.'
              : user?.role?.toUpperCase() === 'CHECKER'
              ? 'As a Checker, you scan QR codes at the destination (Pabrik) to complete trips and enter weight.'
              : 'Admin access for monitoring and reporting.'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

