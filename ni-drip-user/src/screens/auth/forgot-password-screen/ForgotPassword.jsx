import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  Dimensions,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../../../styles/Themes';
import * as Animatable from 'react-native-animatable';
import AuthHeader from '../../../utilities/custom-components/header/auth-header/AuthHeader';
import Logo from '../../../assets/logo/logo.png';
import InputField from '../../../utilities/custom-components/input-field/InputField.utility';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Button from '../../../utilities/custom-components/button/Button.utility';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { validateEmail } from '../../../utilities/custom-components/validations/Validations.utility';
import Toast from 'react-native-toast-message';
import { forgotPassword } from '../../../redux/slices/auth.slice'; // Ensure this matches your slice
import LinearGradient from 'react-native-linear-gradient';
import { globalStyles } from '../../../styles/GlobalStyles';

const { width, height } = Dimensions.get('window');

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    // Basic validation check to enable button
    setIsButtonEnabled(email.length > 0 && !emailError);
  }, [email, emailError]);

  const handleEmailChange = value => {
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  const handleResetRequest = async () => {
    if (!email || emailError) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid email',
      });
      return;
    }

    setLoading(true);

    try {
      // DYNAMIC ROLE: Change this logic based on how you identify Admins vs Users in your app
      const role = 'USER';

      const resultAction = await dispatch(forgotPassword({ email, role }));

      if (forgotPassword.fulfilled.match(resultAction)) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: resultAction.payload?.message,
        });

        // Optional: Navigate back to Login after a delay
        setTimeout(() => navigation.goBack(), 2000);
      } else {
        const message = resultAction.payload?.message || 'Something went wrong';
        Toast.show({
          type: 'error',
          text1: 'Failure',
          text2: message,
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Failure',
        text2: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.gradientHeader}
      >
        <Animatable.View animation="fadeInDown" duration={1000}>
          <AuthHeader logo={Logo} />
        </Animatable.View>
      </LinearGradient>

      <Animatable.View
        animation="fadeInUpBig"
        duration={800}
        style={styles.formWrapper}
      >
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Forgot Password?</Text>
              <Text style={styles.description}>
                Enter your email address below and we'll send you instructions
                to reset your password.
              </Text>
            </View>

            <View style={styles.inputsContainer}>
              <Animatable.View
                animation="fadeInLeft"
                duration={800}
                style={styles.inputWrapper}
              >
                <InputField
                  placeholder="Email Address"
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon={
                    <MaterialCommunityIcons
                      name={'email-outline'}
                      size={22}
                      color={theme.colors.primary}
                    />
                  }
                />
                {emailError ? (
                  <Animatable.Text
                    animation="shake"
                    style={globalStyles.textError}
                  >
                    {emailError}
                  </Animatable.Text>
                ) : null}
              </Animatable.View>
            </View>

            <View style={styles.btnContainer}>
              <Button
                title="SEND RESET LINK"
                onPress={handleResetRequest}
                width={width * 0.9}
                loading={loading}
                disabled={!isButtonEnabled}
                backgroundColor={theme.colors.primary}
                textColor={theme.colors.white}
                borderRadius={theme.borderRadius.medium}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animatable.View>
    </View>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },

  gradientHeader: {
    height: height * 0.25,
    justifyContent: 'center',
    alignItems: 'center',
  },

  formWrapper: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -height * 0.05,
    paddingHorizontal: width * 0.05,
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: height * 0.05,
  },

  headerTextContainer: {
    marginBottom: height * 0.04,
  },

  title: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.semiBold,
    color: theme.colors.dark,
    marginBottom: height * 0.02,
  },

  description: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.regular,
    color: theme.colors.textLight,
    lineHeight: 20,
  },

  inputWrapper: {
    marginBottom: height * 0.04,
  },

  btnContainer: {
    marginTop: height * 0.01,
    alignItems: 'center',
  },
});
