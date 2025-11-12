const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });

// metro.config.js
// const { getDefaultConfig } = require('expo/metro-config');
// const config = getDefaultConfig(__dirname);

// try {
//   const { withNativeWind } = require('nativewind/metro');
//   module.exports = withNativeWind(config, { input: './global.css' });
// } catch {
//   module.exports = config;
// }

