import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface AccessibilityState {
  largeText: boolean
  highContrast: boolean
  hapticsOn: boolean
  toggleLargeText: () => void
  toggleHighContrast: () => void
  toggleHaptics: () => void
}

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set) => ({
      largeText: false,
      highContrast: false,
      hapticsOn: true,
      toggleLargeText: () => set((s) => ({ largeText: !s.largeText })),
      toggleHighContrast: () => set((s) => ({ highContrast: !s.highContrast })),
      toggleHaptics: () => set((s) => ({ hapticsOn: !s.hapticsOn })),
    }),
    {
      name: 'minex-accessibility',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        largeText: state.largeText,
        highContrast: state.highContrast,
        hapticsOn: state.hapticsOn,
      }),
    }
  )
)
