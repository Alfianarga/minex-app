# Minex Mobile

A React Native (Expo) mobile application for monitoring and recording truck trips in mining and quarry operations using QR-based validation.

## Features

- **QR Code Scanning**: Scan QR codes to start and complete trips
- **Role-Based Access**: Support for Operator (Tambang) and Checker (Pabrik) roles
- **Offline Support**: Store trips locally when network is unavailable
- **Dark Industrial Theme**: Optimized for outdoor field usage
- **Real-time Trip Tracking**: Monitor trip status (Pending/Completed)
- **Weight Entry**: Manual tonnage input for completed trips

## Tech Stack

- **React Native** with Expo
- **NativeWind** (Tailwind CSS for React Native)
- **Zustand** for state management
- **Supabase Auth** for authentication
- **Axios** for API calls
- **AsyncStorage** for offline caching
- **expo-camera** for QR scanning

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env` file in the root directory:
```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Start the development server:
```bash
npm start
```

4. Run on device:
- iOS: `npm run ios`
- Android: `npm run android`

## Project Structure

```
/minex
├── App.tsx                 # App entry point
├── package.json
├── /src
│   ├── /screens           # Screen components
│   ├── /components        # Reusable components
│   ├── /api              # API client and functions
│   ├── /store            # Zustand stores
│   ├── /utils            # Utility functions
│   └── /navigation       # Navigation setup
└── assets/               # Images and assets
```

## User Roles

1. **Operator (Tambang)**: Scans QR at source to start trips
2. **Checker (Pabrik)**: Scans QR at destination to complete trips and enter weight
3. **Admin**: Web dashboard access (not in mobile app)

## App Flow

### Operator Flow
1. Login → Home Screen
2. Tap "Scan QR - Start Trip"
3. Scan QR code at source
4. Trip created with `status = Pending`

### Checker Flow
1. Login → Home Screen
2. Tap "Scan QR - Complete Trip"
3. Scan QR code at destination
4. Enter weight (tonnage)
5. Trip updated with `status = Completed`

## Offline Support

The app automatically saves trips to local storage when:
- Network is unavailable
- API calls fail

Trips are synced when connection is restored (manual sync can be implemented).

## API Endpoints

The app expects the following backend endpoints:

- `POST /api/trip/start` - Create new trip
- `POST /api/trip/complete` - Complete trip with weight
- `GET /api/trip` - Get all trips
- `GET /api/trip/:tripToken` - Get trip by token

## License

Private - Minex Mobile

