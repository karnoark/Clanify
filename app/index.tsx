import { Link, Redirect, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
  useColorScheme,
} from 'react-native';
import { Button } from 'react-native-paper';

import { Text } from '@/src/components/common/Text';
import { Colors } from '@/src/constants/Colors';
import { Pdstyles } from '@/src/constants/Styles';
import { initializeAuth, useAuthStore } from '@/src/store/auth';

const { width, height } = Dimensions.get('window');

const Page = () => {
  const user = useAuthStore(state => state.user);
  const getAdminRegistrationStatus = useAuthStore(
    state => state.getAdminRegistrationStatus,
  );
  const refreshSession = useAuthStore(state => state.refreshSession);

  // const isPasswordRecovery = useAuthStore((state) => state.isPasswordRecovery);
  // console.log("index page:-> isPasswordRecovery: ", isPasswordRecovery);

  const colorScheme = useColorScheme() ?? 'dark';

  // useEffect(() => {
  //   console.log('Initializing Auth');
  //   initializeAuth();
  // }, []);

  // if (true) {
  //   return <Redirect href={'/(admin)/onboarding/'} />;
  // }

  // if (user) {
  //   console.log(
  //     'index:-> user is logged in... so redirecting to member tabs... user: ',
  //     user,
  //   );
  //   return <Redirect href={'/(member)/(tabs)/home'} />;
  // }

  // useEffect(() => {
  //   (async () => {
  //     if (user?.role === 'admin_verification_pending') {
  //       console.log('user role is admin_verification_pending');
  //       const checkAdminStatus = async () => {
  //         const registration = await getAdminRegistrationStatus(user.email);
  //         console.log('registration status is: ', registration?.status);

  //         if (registration) {
  //           switch (registration.status) {
  //             case 'pending_onboarding':
  //             case 'onboarding_in_progress':
  //               return <Redirect href="/(admin)/onboarding/" />;

  //             case 'verification_pending':
  //             case 'rejected':
  //               return (
  //                 <Redirect href="/(admin)/onboarding/verificationStatus" />
  //               );

  //             case 'approved':
  //               // Something's wrong - role should have been updated
  //               // Trigger a session refresh
  //               await refreshSession();
  //               break;
  //           }
  //         }
  //       };

  //       await checkAdminStatus();
  //     }
  //   })();
  // }, [getAdminRegistrationStatus, refreshSession, user]);

  // Add state to track redirection path
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user) return;

      // Handle admin verification pending case
      if (user.role === 'admin_verification_pending') {
        try {
          const registration = await getAdminRegistrationStatus(user.email);
          console.log('registration status is: ', registration?.status);

          if (registration) {
            switch (registration.status) {
              case 'pending_onboarding':
              case 'onboarding_in_progress':
                setRedirectPath('/(admin)/onboarding/');
                break;
              case 'verification_pending':
              case 'rejected':
                setRedirectPath('/(admin)/onboarding/verificationStatus');
                break;
              case 'approved':
                await refreshSession();
                break;
            }
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
        }
      } else {
        console.log('user role is: ', user.role);
        // Handle regular role-based routing
        switch (user.role) {
          case 'member':
            setRedirectPath('/(member)/(tabs)/home');
            break;
          case 'admin':
            setRedirectPath('/(admin)/(tabs)/dashboard');
            break;
        }
      }
    };

    checkUserStatus();
  }, [user, getAdminRegistrationStatus, refreshSession]);

  // Handle redirection
  if (redirectPath) {
    return <Redirect href={redirectPath} />;
  }

  // Check user role and redirect accordingly - this happens during render
  // if (user) {
  //   // if (user.role === 'admin' || user.role === 'admin_verification_pending') {
  //   //   return <Redirect href="/(admin)/" />;
  //   // }
  //   // if (user.role === 'member') {
  //   //   return <Redirect href="/(member)/(tabs)/home" />;
  //   // }
  //   // Handle role-based routing
  //   switch (user.role) {
  //     case 'member':
  //       return <Redirect href="/(admin)/" />;

  //     case 'admin':
  //       return <Redirect href="/(member)/(tabs)/home" />;

  //     case 'admin_verification_pending':
  //       (async () => {
  //         try {
  //           const registration = await getAdminRegistrationStatus(user.email);
  //           console.log('registration status is: ', registration?.status);

  //           if (registration) {
  //             switch (registration.status) {
  //               case 'pending_onboarding':
  //               case 'onboarding_in_progress':
  //                 return <Redirect href="/(admin)/onboarding/" />;
  //                 break;

  //               case 'verification_pending':
  //               case 'rejected':
  //                 return (
  //                   <Redirect href="/(admin)/onboarding/verificationStatus" />
  //                 );
  //                 break;

  //               case 'approved':
  //                 // Something's wrong - role should have been updated
  //                 // Trigger a session refresh
  //                 await refreshSession();
  //                 break;
  //             }
  //           }
  //         } catch (error) {
  //           console.error('Error checking admin status:', error);
  //           // Handle error appropriately
  //         }
  //       })();
  //       break;
  //   }
  // }

  return (
    <View style={styles.container}>
      {/* Background elements that create depth and visual interest */}
      <View
        style={[
          styles.mainGlow,
          { backgroundColor: Colors[colorScheme].onBackground },
        ]}
      />
      <View
        style={[
          styles.topDecoration,
          { backgroundColor: Colors[colorScheme].onBackground },
        ]}
      />
      <View
        style={[
          styles.bottomDecoration,
          { backgroundColor: Colors[colorScheme].onBackground },
        ]}
      />
      <View
        style={[
          styles.accentLine,
          { backgroundColor: Colors[colorScheme].onBackground },
        ]}
      />

      {/* Content container */}
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text
            style={[
              styles.header,
              {
                textShadowColor:
                  colorScheme === 'dark' ? 'rgba(253, 53, 109, 0.3)' : '',
              },
            ]}
          >
            From mess to bless
          </Text>
          <Text style={styles.headerSecondary}>your meals, sorted</Text>
        </View>
      </View>

      {/* Button container with enhanced styling */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          // style={styles.signInButton}
          labelStyle={Pdstyles.buttonLabelStyle}
          onPress={() => {
            console.log('Paper button pressed');
            router.push('/(auth)/signin');
          }}
        >
          <Text style={styles.buttonText}>Sign In</Text>
        </Button>

        <Button
          mode="contained"
          // style={styles.signInButton}
          labelStyle={Pdstyles.buttonLabelStyle}
          onPress={() => {
            console.log('Paper button pressed');
            router.push('/(auth)/signup');
          }}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </Button>

        <Button
          mode="contained"
          // style={styles.signInButton}
          labelStyle={Pdstyles.buttonLabelStyle}
          onPress={() => {
            console.log('Paper button pressed');
            router.push('/help');
          }}
        >
          <Text style={styles.buttonText}>help</Text>
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#202024",
    overflow: 'hidden', // Important for containing background elements
  },
  // Background decorative elements
  mainGlow: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    top: -width * 0.75,
    left: -width * 0.25,
    opacity: 0.08,
    transform: [{ scale: 1.2 }],
  },
  topDecoration: {
    position: 'absolute',
    width,
    height: height * 0.3,
    // backgroundColor: "#FD356D",
    top: 0,
    right: -width * 0.5,
    opacity: 0.05,
    transform: [{ rotate: '-45deg' }, { scale: 1.5 }],
  },
  bottomDecoration: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    // backgroundColor: "#FD356D",
    bottom: -width * 0.4,
    right: -width * 0.2,
    opacity: 0.06,
  },
  accentLine: {
    position: 'absolute',
    width: width * 2,
    height: 2,
    // backgroundColor: "#FD356D",
    top: height * 0.3,
    left: -width * 0.5,
    opacity: 0.1,
    transform: [{ rotate: '-15deg' }],
  },
  // Content styling
  contentContainer: {
    flex: 4,
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginTop: 40,
  },
  headerContainer: {
    width: '100%',
  },
  header: {
    fontSize: 42,
    // color: "#FD356D",
    textTransform: 'uppercase',
    lineHeight: 48,
    // textShadowColor: "rgba(253, 53, 109, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  headerSecondary: {
    fontSize: 36,
    // color: "#FD356D",
    textTransform: 'uppercase',
    opacity: 0.9,
    marginTop: 8,
  },
  // Button container and buttons
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  signInButton: {
    flex: 1,
    // backgroundColor: "#FD356D",
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FD356D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  signUpButton: {
    flex: 1,
    // backgroundColor: "#FD356D",
    paddingVertical: 10,
    // fontSize: 20,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FD356D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '300',
  },
});

export default Page;
