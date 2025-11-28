import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/useAuthStore';
import { useTripStore } from '../store/useTripStore';
import { USER_ROLES } from '../utils/constants';
import { useAccessibilityStore } from '../store/useAccessibilityStore';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const { pendingTrips } = useTripStore();
  const { largeText, highContrast, hapticsOn, toggleLargeText, toggleHighContrast, toggleHaptics } = useAccessibilityStore();

  const isOperator = user?.role === USER_ROLES.OPERATOR;
  const isChecker = user?.role === USER_ROLES.CHECKER;

  const handleLogout = async () => {
    await logout();
    useTripStore.getState().logout();
  };

  return (
    <SafeAreaView className={`flex-1 ${highContrast ? 'bg-black' : 'bg-minex-dark'}`} edges={['top', 'left', 'right']}>
      {/* Top section */}
      <View className="px-6 pt-4 pb-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${highContrast ? 'bg-white' : 'bg-[#0F67FE]'}`}>
              <Text className={`${highContrast ? 'text-black' : 'text-white'} font-bold`}>
                {(user?.email || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text className={`${highContrast ? 'text-white' : 'text-white/80'} ${largeText ? 'text-sm' : 'text-xs'} font-poppins-medium`}>Welcome back</Text>
              <Text className={`${highContrast ? 'text-white' : 'text-white'} ${largeText ? 'text-xl' : 'text-lg'} font-poppins-bold`}>{user?.email}</Text>
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
          <View className={`mt-4 rounded-xl p-3 ${highContrast ? 'bg-yellow-300' : 'bg-[#0F67FE]/10'} ${highContrast ? 'border-yellow-400' : 'border-[#0F67FE]/30'} border`}>
            <Text className={`${highContrast ? 'text-black' : 'text-[#0F67FE]'} ${largeText ? 'text-base' : 'text-sm'} font-poppins-medium`}>
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
            className={`w-48 h-48 rounded-3xl items-center justify-center mb-6 ${highContrast ? 'bg-white' : 'bg-[#0F67FE]'}`}
            style={{ shadowColor: '#0F67FE', shadowOpacity: 0.35, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 6 }}
          >
            <Text className={`${highContrast ? 'text-black' : 'text-white'} text-6xl mb-2`}>▦</Text>
            <Text className={`${highContrast ? 'text-black' : 'text-white'} ${largeText ? 'text-2xl' : 'text-xl'} font-poppins-bold`}>
              {isOperator ? 'Scan QR' : 'Scan QR'}
            </Text>
          </TouchableOpacity>

          {/* Secondary action */}
          <TouchableOpacity
            onPress={() => navigation.navigate('TripList')}
            activeOpacity={0.85}
            className={`w-64 h-16 rounded-2xl items-center justify-center ${highContrast ? 'bg-white border border-white' : 'bg-white/5 border border-white/10'}`}
            style={{ shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3 }}
          >
            <Text className={`${highContrast ? 'text-black' : 'text-white'} ${largeText ? 'text-xl' : 'text-lg'} font-poppins-bold`}>View Trips</Text>
          </TouchableOpacity>
        </View>

        <View className={`mt-8 rounded-xl p-4 w-full ${highContrast ? 'bg-white border border-white' : 'bg-white/5 border border-white/10'}`}>
          <Text className={`${highContrast ? 'text-black' : 'text-white'} font-poppins-medium mb-2`}>
            Your Role: {user?.role?.toUpperCase()}
          </Text>
          <Text className={`${highContrast ? 'text-black' : 'text-white/70'} ${largeText ? 'text-base' : 'text-sm'}`}>
            {user?.role?.toUpperCase() === 'OPERATOR'
              ? 'As an Operator, you scan QR codes at the source (Tambang) to start new trips.'
              : user?.role?.toUpperCase() === 'CHECKER'
              ? 'As a Checker, you scan QR codes at the destination (Pabrik) to complete trips and enter weight.'
              : 'Admin access for monitoring and reporting.'}
          </Text>
        </View>

        <View className="mt-8 w-full rounded-xl bg-white/5 border border-white/10 p-4">
          <Text className="text-white font-poppins-bold mb-3">Accessibility & Display</Text>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white">Large Text</Text>
            <Switch value={largeText} onValueChange={toggleLargeText} />
          </View>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white">High Contrast</Text>
            <Switch value={highContrast} onValueChange={toggleHighContrast} />
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-white">Haptics</Text>
            <Switch value={hapticsOn} onValueChange={toggleHaptics} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

