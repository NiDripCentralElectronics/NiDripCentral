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
import { globalStyles } from '../../../styles/GlobalStyles';
import AuthHeader from '../../../utilities/custom-components/header/auth-header/AuthHeader';
import Logo from '../../../assets/logo/logo.png';
import InputField from '../../../utilities/custom-components/input-field/InputField.utility';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Button from '../../../utilities/custom-components/button/Button.utility';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import {
  isValidInput,
  validatePassword,
  validateEmail,
} from '../../../utilities/custom-components/validations/Validations.utility';
import Toast from 'react-native-toast-message';
import { loginUser } from '../../../redux/slices/auth.slice';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const Signin = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isButtonEnabled, setIsButtonEnabled] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor('transparent');
  }, []);

  useEffect(() => {
    const hasErrors = emailError || passwordError || !email || !password;
    setIsButtonEnabled(!hasErrors);
  }, [emailError, passwordError, email, password]);

  const handleEmailChange = value => {
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  const handlePasswordChange = value => {
    setPassword(value);
    setPasswordError(validatePassword(value));
  };

  const handleSignin = async () => {
    if (!isValidInput(email, password)) return;

    setLoading(true);

    try {
      const resultAction = await dispatch(loginUser({ email, password }));

      if (loginUser.fulfilled.match(resultAction)) {
        const message = resultAction.payload?.message;

        Toast.show({
          type: 'success',
          text1: 'Sucess',
          text2: message,
        });

        setTimeout(() => {
          navigation.replace('Main');
        }, 1200);

        setEmail('');
        setPassword('');
        return;
      }

      if (loginUser.rejected.match(resultAction)) {
        const payload = resultAction.payload || {};
        const message = payload.message || 'Authentication failed';
        const status = payload.status;

        if (status === 423 && message.includes('Account locked')) {
          Toast.show({
            type: 'error',
            text1: 'Account Locked',
            text2: message,
          });
          return;
        }

        if (status === 423 && message.includes('Too many')) {
          Toast.show({
            type: 'error',
            text1: 'Too Many Attempts',
            text2: message,
          });
          return;
        }

        if (typeof payload.attempts === 'number') {
          const remaining = Math.max(0, 3 - payload.attempts);

          Toast.show({
            type: 'error',
            text1: message,
            text2: remaining ? `${remaining} attempts remaining` : message,
          });
          return;
        }

        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: message,
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Unexpected Error',
        text2: err?.message || 'Unexpected error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <Animatable.View animation="fadeInDown" duration={1200} useNativeDriver>
          <AuthHeader logo={Logo} />
        </Animatable.View>
      </LinearGradient>

      <Animatable.View
        animation="fadeInUpBig"
        duration={1000}
        style={styles.formWrapper}
      >
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.description}>
                Login to continue your reading journey.
              </Text>
            </View>

            <View style={styles.inputsContainer}>
              <Animatable.View
                animation="fadeInLeft"
                delay={400}
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

              <Animatable.View
                animation="fadeInLeft"
                delay={600}
                duration={800}
                style={styles.inputWrapper}
              >
                <InputField
                  placeholder="Password"
                  value={password}
                  onChangeText={handlePasswordChange}
                  secureTextEntry={hidePassword}
                  leftIcon={
                    <MaterialCommunityIcons
                      name={'lock-outline'}
                      size={22}
                      color={theme.colors.primary}
                    />
                  }
                  rightIcon={
                    <MaterialCommunityIcons
                      name={hidePassword ? 'eye-off-outline' : 'eye-outline'}
                      size={22}
                      color={theme.colors.textLight}
                    />
                  }
                  onRightIconPress={() => setHidePassword(!hidePassword)}
                />
                {passwordError ? (
                  <Animatable.Text
                    animation="shake"
                    style={globalStyles.textError}
                  >
                    {passwordError}
                  </Animatable.Text>
                ) : null}
              </Animatable.View>
            </View>

            <Animatable.View
              animation="fadeInUp"
              delay={800}
              duration={800}
              style={styles.actionContainer}
            >
              <View style={styles.forgotPassContainer}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('Forgot_Password')}
                >
                  <Text style={styles.forgotPassText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.btnContainer}>
                <Button
                  title="SIGN IN"
                  onPress={handleSignin}
                  width={width * 0.95}
                  loading={loading}
                  disabled={!isButtonEnabled}
                  backgroundColor={theme.colors.primary}
                  textColor={theme.colors.white}
                  borderRadius={theme.borderRadius.medium}
                />
              </View>

              <View style={styles.footerContainer}>
                <Text style={styles.footerText}>Don't have an account?</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Signup')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.signupLink}>Signup</Text>
                </TouchableOpacity>
              </View>
            </Animatable.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animatable.View>
    </View>
  );
};

export default Signin;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },

  gradientHeader: {
    height: height * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: height * 0.05,
  },

  formWrapper: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -height * 0.05,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    overflow: 'hidden',
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: width * 0.03,
    paddingTop: height * 0.04,
    paddingBottom: height * 0.03,
  },

  headerTextContainer: {
    marginBottom: height * 0.03,
  },

  title: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.semiBold,
    color: theme.colors.dark,
    marginBottom: height * 0.012,
  },

  description: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.regular,
    color: theme.colors.dark,
  },

  inputWrapper: {
    marginBottom: height * 0.014,
  },

  actionContainer: {
    marginTop: height * 0.01,
    alignItems: 'center',
  },

  forgotPassContainer: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: height * 0.03,
    marginRight: width * 0.02,
  },

  forgotPassText: {
    color: theme.colors.primary,
    fontFamily: theme.typography.regular,
    fontSize: theme.typography.fontSize.sm,
  },

  btnContainer: {
    width: '100%',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },

  footerContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: height * 0.04,
    width: '100%',
  },

  footerText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.dark,
    fontFamily: theme.typography.regular,
  },

  signupLink: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    fontFamily: theme.typography.bold,
  },
});
