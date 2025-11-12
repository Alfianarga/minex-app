import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';

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
    if (variant === 'secondary') return 'bg-minex-gray-light';
    if (variant === 'danger') return 'bg-red-600';
    return 'bg-minex-orange';
  };

  const getTextColor = () => {
    if (variant === 'secondary') return 'text-minex-orange';
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
      onPress={onPress}
      disabled={disabled || loading}
      className={`
        ${getBgColor()}
        ${getSizeClasses()}
        rounded-lg
        items-center
        justify-center
        ${disabled || loading ? 'opacity-50' : 'opacity-100'}
        active:opacity-80
      `}
      style={{ minHeight: size === 'large' ? 56 : size === 'medium' ? 48 : 40 }}
    >
      {loading ? (
        <ActivityIndicator color="white" size="small" />
      ) : (
        <Text className={`${getTextColor()} ${getTextSize()} font-bold`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

