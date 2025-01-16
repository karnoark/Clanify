// app/(admin)/onboarding/verification-status.tsx
import React from 'react';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { Text } from '@/src/components/common/Text';
import { AdminRegistration, useAuthStore } from '@/src/store/auth';

export default function VerificationStatusScreen() {
  const theme = useTheme();
  const { user, getAdminRegistrationStatus } = useAuthStore();
  const [registration, setRegistration] =
    React.useState<AdminRegistration | null>(null);

  React.useEffect(() => {
    const loadRegistration = async () => {
      if (user?.email) {
        const reg = await getAdminRegistrationStatus(user.email);
        setRegistration(reg);
      }
    };

    loadRegistration();
  }, [user?.email, getAdminRegistrationStatus]);

  const getMessage = () => {
    if (!registration) return '';

    switch (registration.status) {
      case 'verification_pending':
        return {
          title: 'Registration Under Review',
          message:
            "Thank you for completing your registration. Our team is reviewing your details. We'll notify you once your registration is approved.",
        };

      case 'rejected':
        return {
          title: 'Registration Not Approved',
          message:
            'We apologize, but your registration could not be approved at this time. Please contact support for more information.',
        };

      default:
        return {
          title: 'Status Pending',
          message: 'Please complete your registration process.',
        };
    }
  };

  const xyz = getMessage();

  const { title, message } =
    xyz === ''
      ? {
          title: 'Admin Registration cannot be found',
          message: 'Not able to find the admin registration entry',
        }
      : xyz;

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
      }}
    >
      <Text
        variant="headlineMedium"
        style={{
          textAlign: 'center',
          marginBottom: 20,
          color: theme.colors.onBackground,
        }}
      >
        {title}
      </Text>
      <Text
        variant="bodyLarge"
        style={{
          textAlign: 'center',
          color: theme.colors.onSurfaceVariant,
        }}
      >
        {message}
      </Text>
    </View>
  );
}
