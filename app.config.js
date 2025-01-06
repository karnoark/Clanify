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
        NSLocationWhenInUseUsageDescription: "EtherealEats needs your location to find nearby meal vendors and ensure accurate delivery."
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
    ]
  ],
    experiments: {
      typedRoutes: true,
    },
  },
});
