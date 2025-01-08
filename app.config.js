export default ({ config }) => ({
  expo: {
    name: "Clanify",
    slug: "Clanify",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./src/assets/images/icon.png",
    scheme: "clanify",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./src/assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#CBB799",
    },
    ios: {
      supportsTablet: true,
      userInterfaceStyle: "automatic",
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "EtherealEats needs your location to find nearby meal vendors and ensure accurate delivery.",
        NSPhotoLibraryUsageDescription: "We need access to your photos to let you upload images of meals and dining.",
        NSCameraUsageDescription: "We need access to your camera to let you take pictures of meals and dining."
      }
    },
    android: {
      userInterfaceStyle: "automatic",
      adaptiveIcon: {
        foregroundImage: "./src/assets/images/foreground.png",
        backgroundColor: "#CBB799",
      },
      package: "com.karnoark.clanify",
      permissions: [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE"
      ]
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./src/assets/images/favicon.png",
    },
    plugins: [
      "expo-router", 
    [
      "expo-location",
      {
        "locationAlwaysAndWhenInUsePermission": "Allow Clanify to use your location."
      }
    ],
    [
      "expo-image-picker",
      {
        "photosPermission": "Enable photo access to upload pictures of your meals and dining setup for customers to browse.",
        "cameraPermission": "Enable camera access to take pictures of your meals and dining setup.",
      }
    ]
  ],
    experiments: {
      typedRoutes: true,
    },
  },
});
