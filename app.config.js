export default ({ config }) => ({
  expo: {
    name: "Clanify",
    slug: "Clanify",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "clanify",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#CBB799",
    },
    ios: {
      supportsTablet: true,
      userInterfaceStyle: "automatic",
    },
    android: {
      userInterfaceStyle: "automatic",
      adaptiveIcon: {
        foregroundImage: "./assets/images/foreground.png",
        backgroundColor: "#CBB799",
      },
      package: "com.karnoark.clanify",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: ["expo-router"],
    experiments: {
      typedRoutes: true,
    },
  },
});
