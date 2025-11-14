import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    <SafeAreaView className="flex-1 bg-minex-dark" edges={['top', 'left', 'right']}>
      {/* Top section */}
      <View className="px-6 pt-4 pb-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-[#0F67FE] items-center justify-center mr-3">
              <Text className="text-white font-bold">
                {(user?.email || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text className="text-white/80 text-xs font-poppins-medium">Welcome back</Text>
              <Text className="text-white text-lg font-poppins-bold">{user?.email}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            className="w-10 h-10 rounded-full items-center justify-center bg-white/5 border border-white/10"
            activeOpacity={0.8}
          >
            <Text className="text-white">⎋</Text>
          </TouchableOpacity>
        </View>

        {pendingTrips.length > 0 && (
          <View className="mt-4 rounded-xl border border-[#0F67FE]/30 bg-[#0F67FE]/10 p-3">
            <Text className="text-[#0F67FE] text-sm font-poppins-medium">
              {pendingTrips.length} Pending Trip{pendingTrips.length > 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>

      {/* Main actions */}
      <ScrollView className="flex-1" contentContainerClassName="flex-grow items-center justify-center px-6 pb-6">
        <View className="w-full items-center">
          {/* Big Scan button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('QRScanner')}
            activeOpacity={0.85}
            className="w-48 h-48 rounded-3xl bg-[#0F67FE] items-center justify-center mb-6"
            style={{ shadowColor: '#0F67FE', shadowOpacity: 0.35, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 6 }}
          >
            <Text className="text-white text-6xl mb-2">▦</Text>
            <Text className="text-white text-xl font-poppins-bold">
              {isOperator ? 'Scan QR' : 'Scan QR'}
            </Text>
          </TouchableOpacity>

          {/* Secondary action */}
          <TouchableOpacity
            onPress={() => navigation.navigate('TripList')}
            activeOpacity={0.85}
            className="w-64 h-16 rounded-2xl bg-white/5 border border-white/10 items-center justify-center"
            style={{ shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3 }}
          >
            <Text className="text-white text-lg font-poppins-bold">View Trips</Text>
          </TouchableOpacity>
        </View>

        {/* Role-specific info */}
        <View className="mt-8 rounded-xl bg-white/5 border border-white/10 p-4 w-full">
          <Text className="text-white font-poppins-medium mb-2">
            Your Role: {user?.role?.toUpperCase()}
          </Text>
          <Text className="text-white/70 text-sm">
            {user?.role?.toUpperCase() === 'OPERATOR'
              ? 'As an Operator, you scan QR codes at the source (Tambang) to start new trips.'
              : user?.role?.toUpperCase() === 'CHECKER'
              ? 'As a Checker, you scan QR codes at the destination (Pabrik) to complete trips and enter weight.'
              : 'Admin access for monitoring and reporting.'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

