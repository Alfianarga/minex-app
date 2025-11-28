import { useLanguageStore, type Language } from './store/useLanguageStore'

const translations = {
  en: {
    common: {
      appName: 'MINEX Mobile',
      cancel: 'Cancel',
      save: 'Save',
    },
    login: {
      title: 'MINEX Mobile',
      subtitle: 'Sign in to continue',
      emailLabel: 'Email',
      emailPlaceholder: 'Enter your email',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter your password',
      loginButton: 'Login',
      forgotPassword: 'Forgot password?',
      apiChecking: 'Checking API connection...',
      apiConnected: 'API Connected',
      apiNotConnected: 'API Not Connected',
      roleHint: 'Select your role: Operator (Tambang) or Checker (Pabrik)',
    },
    home: {
      welcomeBack: 'Welcome back',
      scanQR: 'Scan QR',
      viewTrips: 'View Trips',
      yourRole: 'Your Role',
      operatorDesc: 'As an Operator, you scan QR codes at the source (Tambang) to start new trips.',
      checkerDesc: 'As a Checker, you scan QR codes at the destination (Pabrik) to complete trips and enter weight.',
      adminDesc: 'Admin access for monitoring and reporting.',
      accessibilityTitle: 'Accessibility & Display',
      largeText: 'Large Text',
      highContrast: 'High Contrast',
      haptics: 'Haptics',
      languageLabel: 'Language',
      en: 'English',
      id: 'Bahasa Indonesia',
      pendingTrips: (n: number) => `${n} Pending Trip${n > 1 ? 's' : ''}`,
    },
    qr: {
      processing: 'Processing...',
      invalidTitle: 'Invalid QR Code',
      invalidMessage: 'QR data unreadable',
      invalidVehicle: 'QR code missing vehicle information',
      invalidTripToken: 'QR code missing trip token',
      unauthorizedTitle: 'Unauthorized',
      unauthorizedMessage: 'Your role does not have permission to scan QR codes',
      startHeader: 'Scan QR Code',
      helperOperator: 'Scan QR to Start Trip',
      helperChecker: 'Scan QR to Complete Trip',
      tripAlreadyPendingTitle: 'Trip Already Pending',
      tripAlreadyPendingMessage: (token: string) =>
        `Trip ${token} is already in progress. Complete it before starting a new one.`,
      offlineStartTitle: 'Trip Saved Offline',
      offlineStartMessage: 'Trip will be synced when connection is restored',
      tripStartedTitle: 'Trip Started',
      tripStartedMessage: (token: string) =>
        `Trip ${token} has been created successfully`,
      offlineErrorMessage: 'Network error. Trip will be synced when connection is restored',
      completeAlreadyTitle: 'Already Completed',
      completeAlreadyMessage:
        'This trip has already been completed or is being completed. Please wait.',
    },
    weight: {
      notFoundTitle: 'Trip not found',
      notFoundBack: 'Go Back',
      invalidWeightTitle: 'Invalid Weight',
      invalidWeightMessage: 'Please enter a valid weight in kilograms',
      offlineTitle: 'Trip Completed (Offline)',
      offlineMessage: 'Trip will be synced when connection is restored',
      completedTitle: 'Trip Completed',
      completedMessage: (tripToken: string, tons: string) =>
        `Trip ${tripToken} completed successfully with ${tons} tons`,
      alreadyCompletedTitle: 'Already Completed',
      alreadyCompletedMessage: 'This trip has already been completed on the server.',
      offlineErrorTitle: 'Trip Completed (Offline)',
      offlineErrorMessage: 'Network error. Trip will be synced when connection is restored',
      headerTitle: 'Complete Trip',
      headerSubtitle: 'Enter the weight (tonnage) for this trip',
      tripTokenLabel: 'Trip Token',
      weightLabel: 'Weight (Kilograms)',
      weightPlaceholder: 'Enter weight in kg (e.g., 13200)',
      weightExample: 'Example: 13200 kg = 13.2 tons',
      summaryTons: (tons: string) => `${tons} tons`,
      completeButton: 'Complete Trip',
      cancelButton: 'Cancel',
    },
    trips: {
      headerTitle: 'Trip List',
      filterAll: 'All',
      filterPending: 'Pending',
      filterCompleted: 'Completed',
      emptyTitle: 'No trips found',
      emptyAllDescription: 'Start scanning QR codes to create trips',
      emptyFilteredDescription: (filter: string) => `No ${filter} trips available`,
      todayLabel: "Today's trips",
    },
    app: {
      syncingBanner: (count: number) =>
        `Syncing ${count} offline trip${count === 1 ? '' : 's'}...`,
    },
  },
  id: {
    common: {
      appName: 'MINEX Mobile',
      cancel: 'Batal',
      save: 'Simpan',
    },
    login: {
      title: 'MINEX Mobile',
      subtitle: 'Masuk untuk melanjutkan',
      emailLabel: 'Email',
      emailPlaceholder: 'Masukkan email Anda',
      passwordLabel: 'Kata sandi',
      passwordPlaceholder: 'Masukkan kata sandi Anda',
      loginButton: 'Masuk',
      forgotPassword: 'Lupa kata sandi?',
      apiChecking: 'Memeriksa koneksi API...',
      apiConnected: 'API Terhubung',
      apiNotConnected: 'API Tidak Terhubung',
      roleHint: 'Pilih peran Anda: Operator (Tambang) atau Checker (Pabrik)',
    },
    home: {
      welcomeBack: 'Selamat datang kembali',
      scanQR: 'Scan QR',
      viewTrips: 'Lihat Perjalanan',
      yourRole: 'Peran Anda',
      operatorDesc:
        'Sebagai Operator, Anda melakukan scan QR di sumber (Tambang) untuk memulai perjalanan baru.',
      checkerDesc:
        'Sebagai Checker, Anda melakukan scan QR di tujuan (Pabrik) untuk menyelesaikan perjalanan dan mengisi berat.',
      adminDesc: 'Akses Admin untuk pemantauan dan pelaporan.',
      accessibilityTitle: 'Aksesibilitas & Tampilan',
      largeText: 'Teks Besar',
      highContrast: 'Kontras Tinggi',
      haptics: 'Getaran (Haptics)',
      languageLabel: 'Bahasa',
      en: 'Inggris',
      id: 'Bahasa Indonesia',
      pendingTrips: (n: number) => `${n} perjalanan tertunda`,
    },
    qr: {
      processing: 'Memproses...',
      invalidTitle: 'QR Code tidak valid',
      invalidMessage: 'Data QR tidak dapat dibaca',
      invalidVehicle: 'QR code tidak memiliki informasi kendaraan',
      invalidTripToken: 'QR code tidak memiliki token perjalanan',
      unauthorizedTitle: 'Tidak Diizinkan',
      unauthorizedMessage: 'Peran Anda tidak memiliki izin untuk scan QR code',
      startHeader: 'Scan QR Code',
      helperOperator: 'Scan QR untuk Memulai Perjalanan',
      helperChecker: 'Scan QR untuk Menyelesaikan Perjalanan',
      tripAlreadyPendingTitle: 'Perjalanan Masih Berjalan',
      tripAlreadyPendingMessage: (token: string) =>
        `Perjalanan ${token} masih berjalan. Selesaikan dulu sebelum memulai yang baru.`,
      offlineStartTitle: 'Perjalanan Disimpan Offline',
      offlineStartMessage: 'Perjalanan akan disinkronkan saat koneksi kembali tersedia',
      tripStartedTitle: 'Perjalanan Dimulai',
      tripStartedMessage: (token: string) =>
        `Perjalanan ${token} berhasil dibuat`,
      offlineErrorMessage: 'Gangguan jaringan. Perjalanan akan disinkronkan saat koneksi kembali.',
      completeAlreadyTitle: 'Sudah Selesai',
      completeAlreadyMessage:
        'Perjalanan ini sudah diselesaikan atau sedang dalam proses penyelesaian. Harap tunggu.',
    },
    weight: {
      notFoundTitle: 'Perjalanan tidak ditemukan',
      notFoundBack: 'Kembali',
      invalidWeightTitle: 'Berat tidak valid',
      invalidWeightMessage: 'Silakan masukkan berat yang valid dalam kilogram',
      offlineTitle: 'Perjalanan Selesai (Offline)',
      offlineMessage: 'Perjalanan akan disinkronkan saat koneksi kembali tersedia',
      completedTitle: 'Perjalanan Selesai',
      completedMessage: (tripToken: string, tons: string) =>
        `Perjalanan ${tripToken} berhasil diselesaikan dengan ${tons} ton`,
      alreadyCompletedTitle: 'Sudah Selesai',
      alreadyCompletedMessage: 'Perjalanan ini sudah diselesaikan di server.',
      offlineErrorTitle: 'Perjalanan Selesai (Offline)',
      offlineErrorMessage: 'Gangguan jaringan. Perjalanan akan disinkronkan saat koneksi kembali.',
      headerTitle: 'Selesaikan Perjalanan',
      headerSubtitle: 'Masukkan berat (tonase) untuk perjalanan ini',
      tripTokenLabel: 'Token Perjalanan',
      weightLabel: 'Berat (Kilogram)',
      weightPlaceholder: 'Masukkan berat dalam kg (contoh: 13200)',
      weightExample: 'Contoh: 13200 kg = 13.2 ton',
      summaryTons: (tons: string) => `${tons} ton`,
      completeButton: 'Selesaikan Perjalanan',
      cancelButton: 'Batal',
    },
    trips: {
      headerTitle: 'Daftar Perjalanan',
      filterAll: 'Semua',
      filterPending: 'Tertunda',
      filterCompleted: 'Selesai',
      emptyTitle: 'Tidak ada perjalanan',
      emptyAllDescription: 'Mulai scan QR code untuk membuat perjalanan',
      emptyFilteredDescription: (filter: string) => `Tidak ada perjalanan ${filter.toLowerCase()} untuk hari ini`,
      todayLabel: 'Perjalanan hari ini',
    },
    app: {
      syncingBanner: (count: number) =>
        `Menyinkronkan ${count} perjalanan offline...`,
    },
  },
} as const

export type TranslationNamespaces = keyof typeof translations['en']

export function useI18n() {
  const language = useLanguageStore((s) => s.language)

  function t<N extends TranslationNamespaces, K extends keyof (typeof translations)['en'][N]>(
    ns: N,
    key: K,
    ...args: any[]
  ): string {
    const value: any = (translations as any)[language]?.[ns]?.[key]
    if (typeof value === 'function') {
      return value(...args)
    }
    return value ?? `${String(ns)}.${String(key)}`
  }

  return { language, t }
}
