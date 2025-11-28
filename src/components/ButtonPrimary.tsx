import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { triggerTapHaptic } from '../utils/haptics';

interface ButtonPrimaryProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
}

export const ButtonPrimary: React.FC<ButtonPrimaryProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'large',
}) => {
  const getBgColor = () => {
    if (variant === 'secondary') return 'bg-white/5 border border-white/10';
    if (variant === 'danger') return 'bg-red-600';
    return 'bg-[#0F67FE]';
  };

  const getTextColor = () => {
    if (variant === 'secondary') return 'text-white';
    return 'text-white';
  };

  const getSizeClasses = () => {
    if (size === 'small') return 'px-4 py-2';
    if (size === 'medium') return 'px-6 py-3';
    return 'px-8 py-4';
  };

  const getTextSize = () => {
    if (size === 'small') return 'text-sm';
    if (size === 'medium') return 'text-base';
    return 'text-lg';
  };

  return (
    <TouchableOpacity
      onPress={() => { triggerTapHaptic(); onPress(); }}
      disabled={disabled || loading}
      className={`
        ${getBgColor()}
        ${getSizeClasses()}
        rounded-xl
        items-center
        justify-center
        ${disabled || loading ? 'opacity-50' : 'opacity-100'}
        active:opacity-80
      `}
      style={{
        minHeight: size === 'large' ? 56 : size === 'medium' ? 48 : 40,
        shadowColor: variant === 'primary' ? '#0F67FE' : 'transparent',
        shadowOpacity: variant === 'primary' ? 0.35 : 0,
        shadowRadius: variant === 'primary' ? 12 : 0,
        shadowOffset: { width: 0, height: variant === 'primary' ? 6 : 0 },
        elevation: variant === 'primary' ? 4 : 0,
      }}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      {loading ? (
        <ActivityIndicator color="white" size="small" />
      ) : (
        <Text className={`${getTextColor()} ${getTextSize()} font-poppins-bold`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

