/**
 * @file MyProfile.jsx
 * @module Screens/MyProfile
 * @description
 * An interactive and highly polished profile management screen that allows users
 * to view and update their personal information including profile picture,
 * full name, phone number, and physical address.
 * * * Responsibilities:
 * - Managed Profile Sync: Displays real-time user data from the Redux store.
 * - Media Management: Handles image selection via camera or gallery using `react-native-image-crop-picker`.
 * - Security & Verification: Provides a dedicated workflow for email verification including OTP requests.
 * - Dynamic Modals: Implements separate modal forms for individual data point updates (Name, Phone, Address).
 * - Location/Phone Formatting: Uses `useMemo` to format complex objects (like international phone codes and flags) for UI display.
 * * * Features:
 * - Animated Transitions: Uses `react-native-animatable` for sophisticated entry effects (fade-ins, pulses).
 * - Interactive Feedback: Integrates `react-native-toast-message` for real-time status updates on API calls.
 * - Field Verification: Visually indicates verification status with dynamic icon badges (verified vs. unverified).
 * - Responsive UI: Layout values are calculated using screen dimensions and global theme constants.
 */

import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Image,
  TouchableOpacity,
  Text,
  StatusBar,
  ScrollView,
  TextInput,
} from 'react-native';
import { theme } from '../../../styles/Themes';
import * as Animatable from 'react-native-animatable';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ImagePicker from 'react-native-image-crop-picker';
import Modal from '../../../utilities/custom-components/modal/Modal.utility';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateUser,
  requestEmailVerification,
} from '../../../redux/slices/user.slice';
import Header from '../../../utilities/custom-components/header/header/Header';
import Button from '../../../utilities/custom-components/button/Button.utility';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const COUNTRY_FLAGS = {
  '+92': '🇵🇰',
  '+1': '🇺🇸',
  '+44': '🇬🇧',
  '+91': '🇮🇳',
  '+971': '🇦🇪',
  '+11': '🇨🇦',
  '+61': '🇦🇺',
  '+86': '🇨🇳',
  '+33': '🇫🇷',
  '+49': '🇩🇪',
  '+81': '🇯🇵',
  '+7': '🇷🇺',
  '+9 Saudi': '🇸🇦',
};

const MyProfile = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { user, loading } = useSelector(state => state.user);

  const isFirstRender = useRef(true);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [countryCode, setCountryCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const phoneDetails = useMemo(() => {
    const code = user?.phone?.countryCode || '';
    const number = user?.phone?.phoneNumber || '';
    const flag = COUNTRY_FLAGS[code] || '🏳️';
    return {
      fullDisplay: `${flag} ${code} ${number}`.trim() || 'N/A',
      flag,
    };
  }, [user?.phone]);

  useEffect(() => {
    setTimeout(() => {
      isFirstRender.current = false;
    }, 1000);
  });

  const handleUpdateProfile = async (formData, setModalVisible) => {
    try {
      const resultAction = await dispatch(
        updateUser({
          userId: user?.id || user?._id,
          formData,
        }),
      );

      if (updateUser.fulfilled.match(resultAction)) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: resultAction.payload?.message,
        });
        setModalVisible(false);
      } else if (updateUser.rejected.match(resultAction)) {
        Toast.show({
          type: 'error',
          text1: 'Update Failed',
          text2: resultAction.payload?.message || 'Failed to update profile',
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Unexpected Error',
        text2: err?.message || 'Something went wrong',
      });
    }
  };

  const handleImageUpload = async imagePath => {
    try {
      const formData = new FormData();
      formData.append('profilePicture', {
        uri: imagePath,
        type: 'image/jpeg',
        name: `profile_${Date.now()}.jpg`,
      });

      const resultAction = await dispatch(
        updateUser({
          userId: user?.id || user?._id,
          formData,
        }),
      );

      if (updateUser.fulfilled.match(resultAction)) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: resultAction.payload?.message,
        });
      } else if (updateUser.rejected.match(resultAction)) {
        Toast.show({
          type: 'error',
          text1: 'Update Failed',
          text2:
            resultAction.payload?.message ||
            'Failed to update profile picture.',
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Unexpected Error',
        text2: err?.message || 'Something went wrong.',
      });
    } finally {
      setShowImageUploadModal(false);
    }
  };

  const pickFromGallery = () => {
    ImagePicker.openPicker({
      width: 512,
      height: 512,
      cropping: true,
      mediaType: 'photo',
      quality: 0.8,
    })
      .then(image => handleImageUpload(image.path))
      .catch(err => {
        if (err.code !== 'E_PICKER_CANCELLED') {
          Toast.show({ type: 'error', text1: 'Error', text2: err.message });
        }
      });
  };

  const takePhoto = () => {
    ImagePicker.openCamera({
      width: 512,
      height: 512,
      cropping: true,
      mediaType: 'photo',
      quality: 0.8,
    })
      .then(image => handleImageUpload(image.path))
      .catch(err => {
        if (err.code !== 'E_PICKER_CANCELLED') {
          Toast.show({ type: 'error', text1: 'Error', text2: err.message });
        }
      });
  };

  const DetailRow = ({
    icon,
    label,
    value,
    isEditable,
    verificationStatus,
    onPress,
    delay = 400,
  }) => (
    <Animatable.View
      animation={isFirstRender.current ? 'fadeInUp' : undefined}
      delay={delay}
      easing="ease-out-expo"
      duration={800}
      style={styles.detailRow}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name={icon}
          size={width * 0.07}
          color={theme.colors.primary}
          style={styles.iconStyle}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.valueRow}>
          <Text style={styles.value}>{value || 'N/A'}</Text>
          {verificationStatus &&
            (verificationStatus === 'verified' ? (
              <MaterialCommunityIcons
                name="check-decagram"
                size={24}
                color="#4CAF50"
                style={styles.statusIcon}
              />
            ) : (
              <MaterialCommunityIcons
                name="alert-decagram"
                size={24}
                color="#F44336"
                style={styles.statusIcon}
              />
            ))}
        </View>
        {label === 'Email Address' && (
          <Text
            style={[
              styles.subNote,
              verificationStatus !== 'verified' && { color: '#F44336' },
            ]}
          >
            {verificationStatus === 'verified' ? 'Verified' : 'Not Verified'}
          </Text>
        )}
      </View>
      {isEditable && (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
          <Animatable.View animation="pulse" iterationCount="infinite">
            <MaterialCommunityIcons
              name="pencil-circle"
              size={width * 0.08}
              color={theme.colors.primary}
            />
          </Animatable.View>
        </TouchableOpacity>
      )}
    </Animatable.View>
  );

  const handleVerifyEmail = async () => {
    try {
      const resultAction = await dispatch(requestEmailVerification());

      if (requestEmailVerification.fulfilled.match(resultAction)) {
        Toast.show({
          type: 'success',
          text1: 'OTP Sent',
          text2: resultAction.payload?.message,
        });
        navigation.navigate('Email_Verification');
      } else if (requestEmailVerification.rejected.match(resultAction)) {
        Toast.show({
          type: 'error',
          text1: 'Request Failed',
          text2:
            resultAction.payload?.message || 'Failed to send verification code',
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Unexpected Error',
        text2: err?.message || 'Something went wrong',
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Header
          logo={require('../../../assets/logo/logo.png')}
          title="My Profile"
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollPadding}
      >
        <Animatable.View
          animation={isFirstRender.current ? 'zoomInDown' : undefined}
          delay={100}
          duration={900}
          style={styles.profileImageWrapper}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setShowImageUploadModal(true)}
            style={styles.imageContainer}
          >
            <Image
              source={
                user?.profilePicture
                  ? { uri: user.profilePicture }
                  : require('../../../assets/placeHolder/placeholder.png')
              }
              style={styles.image}
            />
            <Animatable.View
              animation="pulse"
              iterationCount="infinite"
              duration={1800}
              style={styles.cameraIconBadge}
            >
              <MaterialCommunityIcons
                name="camera-plus"
                size={width * 0.055}
                color={theme.colors.white}
              />
            </Animatable.View>
          </TouchableOpacity>
        </Animatable.View>

        {!user?.isEmailVerified && (
          <Animatable.View
            animation={isFirstRender.current ? 'fadeIn' : undefined}
            delay={300}
            style={styles.verificationBanner}
          >
            <MaterialCommunityIcons
              name="email-alert"
              size={28}
              color="#F44336"
            />
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>Email Not Verified</Text>
              <Text style={styles.bannerText}>
                Verify now to secure your account.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.verifyButton}
              onPress={handleVerifyEmail}
            >
              <Text style={styles.buttonText}>Verify Email</Text>
            </TouchableOpacity>
          </Animatable.View>
        )}

        <Animatable.View
          animation={isFirstRender.current ? 'fadeIn' : undefined}
          delay={500}
          duration={1000}
          style={styles.infoSection}
        >
          <DetailRow
            icon="account-circle"
            label="Full Name"
            value={user?.userName}
            isEditable
            delay={400}
            onPress={() => {
              setNewName(user?.userName || '');
              setShowNameModal(true);
            }}
          />
          <DetailRow
            icon="phone"
            label="Mobile Number"
            value={phoneDetails.fullDisplay}
            isEditable
            delay={600}
            onPress={() => {
              setCountryCode(user?.phone?.countryCode || '+92');
              setPhoneNumber(user?.phone?.phoneNumber || '');
              setShowPhoneModal(true);
            }}
          />
          <DetailRow
            icon="map-marker"
            label="Address"
            value={user?.address}
            isEditable
            delay={800}
            onPress={() => {
              setNewAddress(user?.address || '');
              setShowAddressModal(true);
            }}
          />
          <DetailRow
            icon="email"
            label="Email Address"
            value={user?.email}
            verificationStatus={
              user?.isEmailVerified ? 'verified' : 'not-verified'
            }
            delay={1000}
          />
        </Animatable.View>
      </ScrollView>

      <Modal
        isOpen={showImageUploadModal}
        onClose={() => setShowImageUploadModal(false)}
        title="Update Profile Picture"
        showCloseButton={true}
        closeOnBackdrop={true}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.optionRow} onPress={takePhoto}>
            <MaterialCommunityIcons
              name="camera"
              size={40}
              color={theme.colors.primary}
            />
            <Text style={styles.optionText}>Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionRow} onPress={pickFromGallery}>
            <MaterialCommunityIcons
              name="image-multiple"
              size={40}
              color={theme.colors.primary}
            />
            <Text style={styles.optionText}>Gallery</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        isOpen={showNameModal}
        onClose={() => setShowNameModal(false)}
        title="Update Full Name"
        showCloseButton={true}
        closeOnBackdrop={true}
      >
        <View style={styles.editModalContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={newName}
            onChangeText={setNewName}
            placeholderTextColor="#94A3B8"
          />
          <View style={styles.btnContainer}>
            <Button
              title="Save"
              onPress={() =>
                handleUpdateProfile(
                  { userName: newName.trim() },
                  setShowNameModal,
                )
              }
              width={width * 0.84}
              loading={loading}
              backgroundColor={theme.colors.primary}
              textColor={theme.colors.white}
              borderRadius={theme.borderRadius.medium}
            />
          </View>
        </View>
      </Modal>

      <Modal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        title="Update Address"
        showCloseButton={true}
        closeOnBackdrop={true}
      >
        <View style={styles.editModalContainer}>
          <TextInput
            style={[styles.input, { height: height * 0.12 }]}
            placeholder="Enter your address"
            value={newAddress}
            onChangeText={setNewAddress}
            placeholderTextColor="#94A3B8"
            multiline
          />
          <View style={styles.btnContainer}>
            <Button
              title="Save"
              onPress={() =>
                handleUpdateProfile(
                  { address: newAddress.trim() },
                  setShowAddressModal,
                )
              }
              width={width * 0.84}
              loading={loading}
              backgroundColor={theme.colors.primary}
              textColor={theme.colors.white}
              borderRadius={theme.borderRadius.medium}
            />
          </View>
        </View>
      </Modal>

      <Modal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        title="Update Phone Number"
        showCloseButton={true}
        closeOnBackdrop={true}
      >
        <View style={styles.editModalContainer}>
          <View style={styles.phoneInputContainer}>
            <TextInput
              style={[styles.input, styles.countryInput]}
              placeholder="+92"
              value={countryCode}
              onChangeText={setCountryCode}
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
            />
            <TextInput
              style={[styles.input, styles.numberInput]}
              placeholder="300 1234567"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
            />
          </View>
          <View style={styles.btnContainer}>
            <Button
              title="Save Phone"
              onPress={() =>
                handleUpdateProfile(
                  {
                    phone: {
                      countryCode: countryCode.trim(),
                      phoneNumber: phoneNumber.trim(),
                    },
                  },
                  setShowPhoneModal,
                )
              }
              width={width * 0.84}
              loading={loading}
              backgroundColor={theme.colors.primary}
              textColor={theme.colors.white}
              borderRadius={theme.borderRadius.medium}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MyProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    marginBottom: -height * 0.04,
  },

  scrollPadding: {
    paddingBottom: height * 0.1,
  },

  profileImageWrapper: {
    alignItems: 'center',
    marginTop: height * 0.02,
    marginBottom: height * 0.04,
  },

  imageContainer: {
    position: 'relative',
  },

  image: {
    width: width * 0.42,
    height: width * 0.42,
    borderRadius: width * 0.21,
    borderWidth: 5,
    borderColor: theme.colors.white,
    backgroundColor: theme.colors.white,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 15,
  },

  cameraIconBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: theme.colors.primary,
    width: width * 0.13,
    height: width * 0.13,
    borderRadius: width * 0.065,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: theme.colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },

  verificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: theme.borderRadius.large,
    padding: width * 0.04,
    marginHorizontal: width * 0.06,
    marginBottom: height * 0.03,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },

  bannerContent: {
    flex: 1,
    marginLeft: width * 0.03,
  },

  bannerTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.semiBold,
    color: '#B91C1C',
    marginBottom: height * 0.01,
  },

  bannerText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.semiBold,
    color: '#991B1B',
  },

  verifyButton: {
    backgroundColor: '#F44336',
    paddingVertical: height * 0.012,
    paddingHorizontal: width * 0.034,
    borderRadius: theme.borderRadius.large,
  },

  buttonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.regular,
  },

  infoSection: {
    paddingHorizontal: width * 0.05,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.large,
    padding: width * 0.05,
    marginBottom: height * 0.025,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },

  iconContainer: {
    width: width * 0.1,
    height: width * 0.1,
    borderRadius: width * 0.07,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconStyle: {
    opacity: 0.9,
  },

  textContainer: {
    flex: 1,
    marginLeft: width * 0.04,
  },

  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  label: {
    fontSize: theme.typography.fontSize.sm,
    color: '#64748B',
    fontFamily: theme.typography.regular,
    marginBottom: height * 0.01,
  },

  value: {
    fontSize: theme.typography.fontSize.sm,
    color: '#0F172A',
    fontFamily: theme.typography.bold,
  },

  subNote: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.bold,
    color: '#64748B',
    marginTop: height * 0.01,
  },

  modalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: height * 0.03,
  },

  optionRow: {
    alignItems: 'center',
    padding: width * 0.08,
    borderRadius: 24,
    backgroundColor: `${theme.colors.primary}08`,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}20`,
  },

  optionText: {
    marginTop: height * 0.015,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.bold,
    color: theme.colors.primary,
  },

  editModalContainer: {
    padding: width * 0.05,
    alignItems: 'center',
  },

  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: theme.borderRadius.medium,
    padding: width * 0.04,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.regular,
    color: '#0F172A',
    marginBottom: height * 0.03,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: width * 0.84,
    textAlignVertical: 'top',
  },

  btnContainer: {
    marginTop: height * 0.01,
  },

  phoneInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width * 0.84,
  },

  countryInput: {
    width: width * 0.2,
    marginRight: width * 0.02,
    textAlign: 'center',
  },

  numberInput: {
    flex: 1,
  },
});
