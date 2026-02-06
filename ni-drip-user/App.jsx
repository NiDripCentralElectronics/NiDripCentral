/**
 * @file App.js
 * @module App
 * @description
 * Root entry point of the React Native application.
 *
 * Serves as the top-level component responsible for:
 * - Mounting the primary navigation structure via {@link RootNavigator}
 * - Initializing the global toast notification system (react-native-toast-message)
 *   with clean, modern, and consistent custom styling aligned to the application's design system
 * - Setting up Stripe payment provider for payment processing
 *
 * Enhanced toast features:
 * - Unified custom toast rendering via BaseToast for success & error (no more duplication)
 * - Stronger accent border, softer shadows, better spacing & responsive icon sizing
 * - Premium modern look: larger rounded corners, deeper elevation, tighter typography
 * - Reduced code clutter while improving visual hierarchy and polish
 */

import React from 'react';
import { Dimensions } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import Toast, { BaseToast } from 'react-native-toast-message';
import { StripeProvider } from '@stripe/stripe-react-native';
import { theme } from './src/styles/Themes';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CONFIG from './src/redux/config/Config';

const { width, height } = Dimensions.get('window');

const CustomToast = type => props => {
  const isSuccess = type === 'success';
  const color = isSuccess ? theme.colors.success : theme.colors.error;
  const iconName = isSuccess ? 'check-circle' : 'alert-circle';

  return (
    <BaseToast
      {...props}
      style={{
        borderLeftWidth: width * 0.03,
        borderLeftColor: color,
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.large,
        padding: width * 0.02,
        width: width * 0.9,
        marginTop: height * 0.016,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
      }}
      contentContainerStyle={{
        flex: 1,
        paddingLeft: width * 0.02,
      }}
      text1Style={{
        fontSize: width * 0.045,
        fontFamily: theme.typography.medium,
        color,
        marginBottom: 0,
      }}
      text2Style={{
        fontSize: width * 0.038,
        fontFamily: theme.typography.medium,
        color: theme.colors.dark,
      }}
      text1NumberOfLines={2}
      text2NumberOfLines={3}
      renderLeadingIcon={() => (
        <MaterialCommunityIcons
          name={iconName}
          size={width * 0.07}
          color={color}
          style={{ marginRight: width * 0.02 }}
        />
      )}
    />
  );
};

const toastConfig = {
  success: CustomToast('success'),
  error: CustomToast('error'),
};

const App = () => {
  return (
    <StripeProvider
      publishableKey={CONFIG.STRIPE_PUBLISHABLE_KEY}
      merchantIdentifier="merchant.com.nidrip"
    >
      <RootNavigator />
      <Toast config={toastConfig} />
    </StripeProvider>
  );
};

export default App;

