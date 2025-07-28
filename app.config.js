export default {
  expo: {
    name: "Cart Scan",
    slug: "cart-scan",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true
    },
    android: {
      package: "com.edmundtutu.cartscan",
      versionCode: 1,
      adaptiveIcon: {
        backgroundColor: "#ffffff"
      }
    },
    web: {
      bundler: "metro",
      output: "single",
      favicon: "./assets/images/favicon.ico"
    },
    plugins: [
      "expo-router",
      "expo-font",
      "expo-web-browser"
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      eas: {
        projectId: "29e6c30d-2dd6-45bd-981e-bc3c2417b884"
      },

      // Add your AWS credentials here
      awsAccessKey: process.env.AWS_ACCESS_KEY,
      awsSecretKey: process.env.AWS_SECRET_KEY,
      awsRegion: process.env.AWS_REGION,
      awsBucketName: process.env.AWS_BUCKET_NAME,
    }
  }
};