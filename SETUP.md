# Minex Mobile - Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   
   Create a `.env` file in the root directory:
   ```
   EXPO_PUBLIC_API_URL=http://localhost:3000/api
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```

4. **Run on Device/Emulator**
   - iOS: Press `i` in the terminal or run `npm run ios`
   - Android: Press `a` in the terminal or run `npm run android`

## Project Structure

```
minex/
├── App.tsx                 # Main app entry point
├── app.json                # Expo configuration
├── package.json            # Dependencies
├── tailwind.config.js      # Tailwind/NativeWind config
├── babel.config.js         # Babel configuration
├── metro.config.js         # Metro bundler config
├── global.css              # Global styles
├── src/
│   ├── screens/            # Screen components
│   │   ├── LoginScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── QRScannerScreen.tsx
│   │   ├── WeightInputScreen.tsx
│   │   └── TripListScreen.tsx
│   ├── components/         # Reusable components
│   │   ├── ButtonPrimary.tsx
│   │   ├── QRScannerView.tsx
│   │   └── TripCard.tsx
│   ├── navigation/         # Navigation setup
│   │   └── AppNavigator.tsx
│   ├── store/              # Zustand stores
│   │   ├── useAuthStore.ts
│   │   └── useTripStore.ts
│   ├── api/                # API client
│   │   ├── client.ts
│   │   └── tripAPI.ts
│   └── utils/              # Utilities
│       ├── constants.ts
│       ├── formatDate.ts
│       └── storage.ts
└── assets/                 # Images and assets
```

## Features Implemented

✅ **Authentication**
- Supabase Auth integration
- Role-based access (Operator, Checker, Admin)
- Persistent login state

✅ **QR Code Scanning**
- expo-camera integration
- QR code parsing (JSON or plain text)
- Camera permissions handling

✅ **Trip Management**
- Start trip (Operator)
- Complete trip with weight (Checker)
- Trip status tracking (Pending/Completed)
- Offline trip storage

✅ **Offline Support**
- AsyncStorage for local caching
- Network detection with NetInfo
- Automatic offline trip saving
- Sync when online (manual sync can be added)

✅ **UI/UX**
- Dark industrial theme
- Large, touch-friendly buttons
- High contrast for outdoor use
- NativeWind (Tailwind) styling

✅ **State Management**
- Zustand stores for auth and trips
- Reactive state updates
- Persistent storage integration

## Backend API Requirements

The app expects these endpoints:

- `POST /api/trip/start`
  ```json
  {
    "tripToken": "MINE-2025-11-09-L8480AA-001",
    "vehicleId": 3,
    "driverName": "Agus",
    "destinationId": 2,
    "materialId": 1
  }
  ```

- `POST /api/trip/complete`
  ```json
  {
    "tripToken": "MINE-2025-11-09-L8480AA-001",
    "weightKg": 13200
  }
  ```

- `GET /api/trip` - Get all trips
- `GET /api/trip/:tripToken` - Get trip by token

## QR Code Format

The app supports two QR code formats:

1. **JSON Format** (Recommended):
   ```json
   {
     "tripToken": "MINE-2025-11-09-L8480AA-001",
     "vehicleId": 3,
     "driverName": "Agus",
     "destinationId": 2,
     "materialId": 1
   }
   ```

2. **Plain Text**: Just the `tripToken` string

## Testing

1. **Test Authentication**
   - Create test users in Supabase with roles in `user_metadata.role`
   - Test login with different roles

2. **Test QR Scanning**
   - Generate QR codes with trip data
   - Test offline scanning (airplane mode)
   - Verify offline trips are saved

3. **Test Trip Flow**
   - Operator: Scan QR → Start trip
   - Checker: Scan same QR → Complete trip with weight
   - Verify trip status updates

## Troubleshooting

**Camera not working?**
- Check app permissions in device settings
- Ensure `expo-camera` is properly installed
- Try rebuilding the app

**Network errors?**
- Verify API_BASE_URL in `.env`
- Check backend is running
- App will save offline if network fails

**Styling issues?**
- Ensure NativeWind is properly configured
- Check `tailwind.config.js` and `metro.config.js`
- Clear Metro cache: `npx expo start -c`

## Next Steps

1. Add asset images (icon, splash screen)
2. Implement offline sync functionality
3. Add error boundaries
4. Add loading states
5. Implement push notifications (optional)
6. Add analytics (optional)

