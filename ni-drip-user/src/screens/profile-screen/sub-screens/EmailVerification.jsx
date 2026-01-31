/**
 * @file EmailVerification.jsx
 * @module Screens/EmailVerification
 * @description
 * A secure, high-interaction verification interface that facilitates 2-Factor Authentication (2FA)
 * via Email OTP (One-Time Password).
 * * * Responsibilities:
 * - OTP Input Orchestration: Manages a 6-digit split input array with automatic focus shifting and backspace handling.
 * - Temporal Logic: Implements a 60-second countdown timer to throttle resend requests and prevent API spamming.
 * - Secure Dispatch: Communicates with the Redux `user.slice` to verify credentials and update account status.
 * - UX Feedback: Provides haptic-like visual feedback via `Animatable` and informative system-level toasts.
 * * * Features:
 * - Smart Focus Management: Uses `useRef` to programmatically control keyboard focus across multiple input fields.
 * - Resilient UI: Employs `KeyboardAvoidingView` to ensure the "Verify" button remains accessible on all device sizes.
 * - Dynamic Styling: Input fields reflect their focus state through thematic border highlights and elevation.
 * - Adaptive Layout: All spacing, font sizes, and container dimensions are calculated relative to the device's viewport.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../../styles/Themes';
import { useDispatch, useSelector } from 'react-redux';
import {
  verifyEmail,
  requestEmailVerification,
} from '../../../redux/slices/user.slice';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import Header from '../../../utilities/custom-components/header/header/Header';
import Button from '../../../utilities/custom-components/button/Button.utility';

const { width, height } = Dimensions.get('window');

const EmailVerification = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const user = useSelector(state => state.user.user);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(59);
  const [loading, setLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = useRef([]);

  const isButtonEnabled = otp.every(digit => digit !== '');

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor('transparent');
  }, []);

  useEffect(() => {
    let interval = setInterval(() => {
      setTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Verification Incomplete',
        text2: 'Please enter the full 6-digit code.',
      });
      return;
    }

    setLoading(true);
    try {
      const resultAction = await dispatch(verifyEmail(otpString));

      if (verifyEmail.fulfilled.match(resultAction)) {
        Toast.show({
          type: 'success',
          text1: 'Account Verified',
          text2: resultAction.payload?.message,
        });
        navigation.goBack();
      } else if (verifyEmail.rejected.match(resultAction)) {
        Toast.show({
          type: 'error',
          text1: 'Verification Failed',
          text2:
            resultAction.payload?.message || 'Failed to verify your email.',
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Unexpected Error',
        text2: err?.message || 'Something went wrong.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;

    try {
      const resultAction = await dispatch(requestEmailVerification());

      if (requestEmailVerification.fulfilled.match(resultAction)) {
        Toast.show({
          type: 'info',
          text1: 'Code Resent',
          text2: resultAction.payload?.message,
        });
        setTimer(59);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else if (requestEmailVerification.rejected.match(resultAction)) {
        Toast.show({
          type: 'error',
          text1: 'Request Failed',
          text2:
            resultAction.payload?.message ||
            'Failed to resend the verification code.',
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Unexpected Error',
        text2: err?.message || 'Something went wrong.',
      });
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.headerContainer}>
          <Header
            logo={require('../../../assets/logo/logo.png')}
            title="Email Verification"
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animatable.View
            animation="fadeInDown"
            duration={1200}
            style={styles.topSection}
          >
            <View style={styles.iconBadge}>
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={width * 0.12}
                color={theme.colors.primary}
              />
            </View>
            <Text style={styles.mainHeading}>Email Verification</Text>
            <View style={styles.headingUnderline} />
          </Animatable.View>

          <Animatable.View
            animation="fadeInUp"
            delay={300}
            style={styles.infoBox}
          >
            <Text style={styles.description}>We have sent an OTP to</Text>
            <Text style={styles.emailText}>
              {user?.email || 'your email address'}
            </Text>
          </Animatable.View>

          <Animatable.View
            animation="zoomIn"
            delay={600}
            style={styles.otpWrapper}
          >
            {otp.map((digit, index) => (
              <View
                key={index}
                style={[
                  styles.inputContainer,
                  focusedIndex === index && styles.inputContainerActive,
                ]}
              >
                <TextInput
                  ref={ref => (inputRefs.current[index] = ref)}
                  style={styles.otpInput}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onFocus={() => setFocusedIndex(index)}
                  onChangeText={text => handleChange(text, index)}
                  onKeyPress={e => handleKeyPress(e, index)}
                  selectionColor={theme.colors.primary}
                />
              </View>
            ))}
          </Animatable.View>

          <Animatable.View
            animation="fadeInUp"
            delay={800}
            style={styles.footerAction}
          >
            <View style={styles.timerRow}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={20}
                color={timer > 0 ? '#64748B' : theme.colors.primary}
              />
              <Text style={styles.timerText}>
                {timer > 0 ? (
                  <>
                    Request a new code in{' '}
                    <Text style={styles.timerCount}>
                      00:{timer < 10 ? `0${timer}` : timer}
                    </Text>
                  </>
                ) : (
                  "Didn't receive the code?"
                )}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleResend}
              disabled={timer > 0}
              style={[
                styles.resendTouchable,
                timer > 0 && styles.disabledResend,
              ]}
            >
              <Text style={styles.resendText}>Resend Code</Text>
            </TouchableOpacity>

            <View style={styles.btnContainer}>
              <Button
                title="VERIFY & PROCEED"
                onPress={handleVerify}
                width={width * 0.84}
                loading={loading}
                disabled={!isButtonEnabled}
                backgroundColor={theme.colors.primary}
                textColor={theme.colors.white}
                borderRadius={theme.borderRadius.medium}
              />
            </View>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default EmailVerification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },

  flex: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: width * 0.08,
    paddingBottom: height * 0.05,
  },

  navHeader: {
    marginTop: height * 0.02,
    marginBottom: height * 0.02,
  },

  topSection: {
    alignItems: 'center',
    marginVertical: height * 0.03,
  },

  iconBadge: {
    width: width * 0.22,
    height: width * 0.22,
    borderRadius: width * 0.11,
    backgroundColor: `${theme.colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: height * 0.02,
  },

  mainHeading: {
    fontSize: width * 0.08,
    fontFamily: theme.typography.bold,
    color: theme.colors.dark,
    textAlign: 'center',
  },

  headingUnderline: {
    width: width * 0.24,
    height: height * 0.004,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.large,
    marginTop: height * 0.009,
  },

  infoBox: {
    alignItems: 'center',
    marginBottom: height * 0.05,
  },

  description: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.semiBold,
    color: theme.colors.dark,
  },

  emailText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.semiBold,
    color: theme.colors.dark,
    marginTop: height * 0.01,
  },

  otpWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: height * 0.06,
  },

  inputContainer: {
    width: width * 0.12,
    height: width * 0.15,
    borderRadius: 12,
    backgroundColor: theme.colors.white,
    borderWidth: 1.5,
    borderColor: theme.colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },

  inputContainerActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.white,
    borderWidth: 2,
    elevation: 8,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.15,
  },

  otpInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.bold,
    color: '#0F172A',
  },

  footerAction: {
    width: '100%',
    alignItems: 'center',
  },

  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.02,
  },

  timerText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.semiBold,
    color: theme.colors.dark,
    marginLeft: width * 0.02,
    color: '#64748B',
  },

  timerCount: {
    color: theme.colors.primary,
    fontFamily: theme.typography.bold,
  },

  resendTouchable: {
    marginBottom: height * 0.04,
  },

  resendText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.bold,
  },

  disabledResend: {
    opacity: 0.4,
  },
});
