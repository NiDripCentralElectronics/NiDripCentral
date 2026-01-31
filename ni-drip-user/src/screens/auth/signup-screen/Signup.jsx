import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  Dimensions,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
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
  validateFullName,
  validatePassword,
  validateEmail,
} from '../../../utilities/custom-components/validations/Validations.utility';
import Toast from 'react-native-toast-message';
import { registerUser } from '../../../redux/slices/auth.slice';
import ImagePicker from 'react-native-image-crop-picker';
import Modal from '../../../utilities/custom-components/modal/Modal.utility';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const Signup = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const formRef = useRef(null);

  const [photoURL, setPhotoURL] = useState('');
  const [newImageURL, setNewImageURL] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor('transparent');
  }, []);

  useEffect(() => {
    const hasErrors =
      nameError ||
      emailError ||
      passwordError ||
      !name.trim() ||
      !email ||
      !password;

    setIsButtonEnabled(!hasErrors);
  }, [nameError, emailError, passwordError, name, email, password]);

  const handleNameChange = value => {
    setName(value);
    setNameError(validateFullName(value));
  };

  const handleEmailChange = value => {
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  const handlePasswordChange = value => {
    setPassword(value);
    setPasswordError(validatePassword(value));
  };

  const pickFromGallery = () => {
    ImagePicker.openPicker({
      width: 512,
      height: 512,
      cropping: false,
      mediaType: 'photo',
      quality: 0.8,
      includeBase64: false,
    })
      .then(image => {
        handleImageUpload(image.path);
      })
      .catch(err => {
        if (err.code === 'E_PICKER_CANCELLED') {
          return;
        }
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: err.message || 'Failed to pick image',
          position: 'top',
        });
      });
  };

  const takePhoto = () => {
    ImagePicker.openCamera({
      width: 512,
      height: 512,
      cropping: false,
      mediaType: 'photo',
      quality: 0.8,
      includeBase64: false,
    })
      .then(image => {
        handleImageUpload(image.path);
      })
      .catch(err => {
        if (err.code === 'E_PICKER_CANCELLED') {
          return;
        }
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: err.message || 'Failed to take photo',
          position: 'top',
        });
      });
  };

  const handleImageUpload = url => {
    setShowImageUploadModal(false);
    setNewImageURL(url);
    setPhotoURL(url);
  };

  const handleSignup = async () => {
    if (!isValidInput(name, email, password)) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('userName', name);
      formData.append('email', email);
      formData.append('password', password);

      if (newImageURL) {
        const uriParts = newImageURL.split('/');
        const fileName = uriParts[uriParts.length - 1];
        const fileType = fileName.split('.').pop();

        formData.append('profilePicture', {
          uri: newImageURL,
          name: fileName,
          type: `image/${fileType}`,
        });
      }

      const resultAction = await dispatch(registerUser(formData));

      if (registerUser.fulfilled.match(resultAction)) {
        const message = resultAction.payload?.message;

        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: message,
        });

        setName('');
        setEmail('');
        setPassword('');
        setNewImageURL('');

        setTimeout(() => {
          navigation.replace('Signin');
        }, 1500);

        return;
      }

      if (registerUser.rejected.match(resultAction)) {
        formRef.current?.shake();

        const payload = resultAction.payload || {};
        const message = payload.message || 'Registration failed';

        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: message,
        });
      }
    } catch (err) {
      formRef.current?.shake();

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
        ref={formRef}
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
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.description}>Join Us!</Text>
            </View>

            <Animatable.View
              animation="bounceIn"
              delay={400}
              duration={1000}
              style={styles.profileImageWrapper}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowImageUploadModal(true)}
                style={styles.imageContainer}
              >
                {newImageURL || photoURL ? (
                  <Image
                    source={{ uri: newImageURL || photoURL }}
                    style={styles.image}
                  />
                ) : (
                  <Image
                    source={require('../../../assets/placeHolder/placeholder.png')}
                    style={styles.image}
                  />
                )}
                <View style={styles.cameraIconBadge}>
                  <MaterialCommunityIcons
                    name="camera-plus"
                    size={22}
                    color={theme.colors.white}
                  />
                </View>
              </TouchableOpacity>
            </Animatable.View>

            <View style={styles.inputsContainer}>
              <Animatable.View
                animation="fadeInLeft"
                delay={500}
                duration={800}
                style={styles.inputWrapper}
              >
                <InputField
                  placeholder="Full Name"
                  value={name}
                  onChangeText={handleNameChange}
                  leftIcon={
                    <MaterialCommunityIcons
                      name="account-outline"
                      size={24}
                      color={theme.colors.primary}
                    />
                  }
                />
                {nameError ? (
                  <Animatable.Text
                    animation="shake"
                    style={globalStyles.textError}
                  >
                    {nameError}
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
                  placeholder="Email Address"
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon={
                    <MaterialCommunityIcons
                      name="email-outline"
                      size={24}
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
                delay={700}
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
                      name="lock-outline"
                      size={24}
                      color={theme.colors.primary}
                    />
                  }
                  rightIcon={
                    <MaterialCommunityIcons
                      name={hidePassword ? 'eye-off-outline' : 'eye-outline'}
                      size={24}
                      color={theme.colors.primary}
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
              delay={900}
              duration={800}
              style={styles.btnContainer}
            >
              <Button
                title="SIGN UP"
                onPress={handleSignup}
                width={width * 0.95}
                loading={loading}
                disabled={!isButtonEnabled}
                backgroundColor={theme.colors.primary}
                textColor={theme.colors.white}
                borderRadius={theme.borderRadius.medium}
              />
            </Animatable.View>

            <Animatable.View
              animation="fadeInUp"
              delay={1000}
              duration={800}
              style={styles.footerContainer}
            >
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Signin')}
                activeOpacity={0.7}
              >
                <Text style={styles.signupLink}>Sign In</Text>
              </TouchableOpacity>
            </Animatable.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animatable.View>

      <Modal
        isOpen={showImageUploadModal}
        onClose={() => setShowImageUploadModal(false)}
        title="Select Profile Picture"
        showCloseButton={true}
        closeOnBackdrop={true}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.optionRow} onPress={takePhoto}>
            <MaterialCommunityIcons
              name="camera"
              size={32}
              color={theme.colors.primary}
            />
            <Text style={styles.optionText}>From Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionRow} onPress={pickFromGallery}>
            <MaterialCommunityIcons
              name="image-multiple"
              size={32}
              color={theme.colors.primary}
            />
            <Text style={styles.optionText}>From Gallery</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default Signup;

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

  profileImageWrapper: {
    alignItems: 'center',
    marginBottom: height * 0.035,
  },

  imageContainer: {
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 8,
  },

  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    resizeMode: 'cover',
    borderWidth: 4,
    borderColor: theme.colors.white,
  },

  cameraIconBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: theme.colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.white,
  },

  inputsContainer: {
    marginBottom: height * 0.02,
  },

  inputWrapper: {
    marginBottom: height * 0.018,
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

  modalContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  optionRow: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.06,
  },

  optionText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamilyMedium,
    color: theme.colors.white,
  },
});
