/**
 * @file Profile.jsx
 * @module Screens/Profile
 * @description
 * The primary user account management screen for the NiDrip Central application.
 * * Responsibilities:
 * - Displays user identity information (Avatar, Username).
 * - Provides navigation to secondary account screens (My Profile, About Us, Orders).
 * - Manages session termination (Logout) with Redux state cleanup and feedback.
 * - Handles destructive actions (Account Deletion) via a secure modal workflow and reason collection.
 * * Features:
 * - Dynamic Profile Sync: Fetches latest user data via Redux on focus.
 * - Secure Logout: Resets navigation stack to 'Signin' upon successful session clearance.
 * - Enhanced Feedback: Integrates `react-native-toast-message` for process status (success/error).
 * - Modal Integration: Uses a custom utility modal for permanent account removal confirmations.
 */

import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  StatusBar,
  Text,
  Image,
  ScrollView,
  TextInput,
} from 'react-native';
import { theme } from '../../styles/Themes';
import { useDispatch, useSelector } from 'react-redux';
import { deleteAccount, getUser } from '../../redux/slices/user.slice';
import Header from '../../utilities/custom-components/header/header/Header';
import ProfileCard from '../../utilities/custom-components/card/profile-card/ProfileCard';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { logoutUser } from '../../redux/slices/auth.slice';
import Modal from '../../utilities/custom-components/modal/Modal.utility';
import Button from '../../utilities/custom-components/button/Button.utility';
import InputField from '../../utilities/custom-components/input-field/InputField.utility';

const { width, height } = Dimensions.get('window');

const Profile = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const user = useSelector(state => state.auth.user);
  const profile = useSelector(state => state.user.user);

  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

  useEffect(() => {
    if (user?.id) {
      dispatch(getUser(user.id));
    }
  }, [dispatch, user]);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor('transparent');
  }, []);

  const hasProfilePicture = !!profile?.profilePicture;

  const handleProfileNavigate = () => {
    navigation.navigate('My_Profile', {
      user: profile,
    });
  };

  const handleLogout = async () => {
    try {
      const resultAction = await dispatch(logoutUser());

      if (logoutUser.fulfilled.match(resultAction)) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: resultAction.payload?.message,
        });

        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Signin' }],
          });
        }, 2000);
      } else if (logoutUser.rejected.match(resultAction)) {
        Toast.show({
          type: 'error',
          text1: 'Failure',
          text2:
            resultAction.payload?.message ||
            'Something went wrong during logout.',
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

  const handleDeleteAccount = async () => {
    if (deleteReason.trim().length < 5) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Reason',
        text2: 'Please provide a reason (min 5 characters)',
      });
      return;
    }

    setLoading(true);
    try {
      const resultAction = await dispatch(
        deleteAccount({
          userId: profile?.id || profile?._id,
          reason: deleteReason,
        }),
      );

      if (deleteAccount.fulfilled.match(resultAction)) {
        setShowDeleteModal(false);

        Toast.show({
          type: 'success',
          text1: 'Account Deleted',
          text2: resultAction.payload?.message,
        });

        setTimeout(() => {
          navigation.reset({ index: 0, routes: [{ name: 'Signin' }] });
        }, 2000);
      } else if (deleteAccount.rejected.match(resultAction)) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: resultAction.payload?.message || 'Failed to delete account.',
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

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Header logo={require('../../assets/logo/logo.png')} title="Profile" />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeaderContainer}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {hasProfilePicture ? (
                <Image
                  source={{ uri: profile.profilePicture }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={require('../../assets/placeHolder/placeholder.png')}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              )}
            </View>
          </View>
          <Text style={styles.name}>{profile?.userName || 'User'}</Text>
        </View>

        <View style={styles.menuGroup}>
          <ProfileCard
            title="My Profile"
            iconName="account-circle-outline"
            onPressFunction={handleProfileNavigate}
          />
        </View>

        <View style={styles.menuGroup}>
          <ProfileCard
            title="My Orders"
            iconName="package-variant-closed"
            onPressFunction={() => navigation.navigate('My_Orders')}
          />
          <ProfileCard
            title="Favorites"
            iconName="heart-outline"
            onPressFunction={() => navigation.navigate('Favorites')}
          />
        </View>

        <View style={styles.menuGroup}>
          <ProfileCard
            title="Support Center"
            iconName="headphones"
            navigationTarget={'Support_Center'}
          />
          <ProfileCard
            title="About Us"
            iconName="information-outline"
            navigationTarget={'About_Us'}
          />
        </View>

        <View style={styles.menuGroup}>
          <ProfileCard
            title="Logout"
            iconName="logout-variant"
            onPressFunction={handleLogout}
          />
          <ProfileCard
            title="Delete Account"
            iconName="account-remove-outline"
            onPressFunction={() => setShowDeleteModal(true)}
          />
        </View>
      </ScrollView>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
        showCloseButton={true}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalSubTitle}>
            This action is permanent. Please tell us why you are leaving:
          </Text>
          <InputField
            style={styles.reasonInput}
            placeholder="Enter reason (min 5 chars)..."
            value={deleteReason}
            onChangeText={setDeleteReason}
            multiline
          />
          <View style={styles.btnContainer}>
            <Button
              title="Confirm Delete"
              onPress={handleDeleteAccount}
              loading={loading}
              backgroundColor="#F44336"
              textColor={theme.colors.white}
              width={width * 0.8}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F5F7',
  },

  headerContainer: {
    backgroundColor: theme.colors.white,
  },

  scrollContent: {
    paddingBottom: height * 0.05,
    paddingHorizontal: width * 0.034,
  },

  profileHeaderContainer: {
    alignItems: 'center',
    marginTop: height * 0.02,
    marginBottom: height * 0.03,
  },

  avatarContainer: {
    marginBottom: height * 0.015,
  },

  avatar: {
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: (width * 0.25) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: theme.colors.white,
  },

  avatarImage: {
    width: '100%',
    height: '100%',
  },

  name: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.semiBold,
  },

  menuGroup: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.large,
    paddingVertical: height * 0.014,
    paddingHorizontal: width * 0.024,
    marginBottom: height * 0.02,
  },

  modalContent: {
    alignItems: 'center',
  },

  modalSubTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.regular,
    color: theme.colors.white,
    textAlign: 'justify',
  },

  reasonInput: {
    marginBottom: height * 0.04,
  },
});
