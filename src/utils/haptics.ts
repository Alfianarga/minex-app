import * as Haptics from 'expo-haptics'
import { Vibration, Platform } from 'react-native'
import { useAccessibilityStore } from '../store/useAccessibilityStore'

export function triggerTapHaptic() {
  const { hapticsOn } = useAccessibilityStore.getState()
  if (!hapticsOn) return
  try {
    Haptics.selectionAsync()
  } catch {
    // Fallback for bare environments
    if (Platform.OS === 'android') Vibration.vibrate(10)
  }
}

export function triggerSuccessHaptic() {
  const { hapticsOn } = useAccessibilityStore.getState()
  if (!hapticsOn) return
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  } catch {
    if (Platform.OS === 'android') Vibration.vibrate(20)
  }
}

export function triggerWarningHaptic() {
  const { hapticsOn } = useAccessibilityStore.getState()
  if (!hapticsOn) return
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
  } catch {
    if (Platform.OS === 'android') Vibration.vibrate(30)
  }
}
