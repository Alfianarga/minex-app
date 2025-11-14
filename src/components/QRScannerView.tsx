import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { ButtonPrimary } from './ButtonPrimary';

interface QRScannerViewProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
}

const { width, height } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

export const QRScannerView: React.FC<QRScannerViewProps> = ({ onScan, onError }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!permission?.granted && permission?.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (!scanned) {
      setScanned(true);
      onScan(data);
      // Reset after 2 seconds
      setTimeout(() => setScanned(false), 2000);
    }
  };

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-minex-dark">
        <Text className="text-white text-lg font-poppins-medium">Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-minex-dark px-6">
        <Text className="text-white text-lg text-center mb-4 font-poppins-medium">
          Camera permission is required to scan QR codes
        </Text>
        <View className="w-full max-w-xs">
          <ButtonPrimary title="Grant Permission" onPress={requestPermission} />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-minex-dark">
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />
      {/* Overlay */}
      <View className="flex-1 items-center justify-center">
        {/* Scan area frame */}
        <View
          className="border-4 border-[#0F67FE] rounded-2xl"
          style={{
            width: SCAN_AREA_SIZE,
            height: SCAN_AREA_SIZE,
          }}
        />
        {/* Instructions */}
        <View className="absolute bottom-32 px-6">
          <Text className="text-white text-center text-lg font-poppins-bold mb-2">
            Position QR code within frame
          </Text>
          <Text className="text-white/70 text-center text-sm font-poppins-medium">
            {scanned ? 'Scanning...' : 'Ready to scan'}
          </Text>
        </View>
      </View>
      {/* Dark overlay with cutout */}
      <View
        style={StyleSheet.absoluteFillObject}
        className="bg-black/60"
        pointerEvents="none"
      >
        <View
          style={{
            position: 'absolute',
            top: (height - SCAN_AREA_SIZE) / 2,
            left: (width - SCAN_AREA_SIZE) / 2,
            width: SCAN_AREA_SIZE,
            height: SCAN_AREA_SIZE,
            backgroundColor: 'transparent',
          }}
        />
      </View>
    </View>
  );
};

