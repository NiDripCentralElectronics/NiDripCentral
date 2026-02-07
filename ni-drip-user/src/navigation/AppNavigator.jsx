/**
 * @file AppNavigator.jsx
 * @module Navigation/AppNavigator
 * @description
 * Root navigation configuration for the NiDrip Central application.
 * This navigator manages the top-level stack, including the splash sequence,
 * authentication flow, and the primary application entry points.
 *
 * Responsibilities:
 * - Orchestrates the main navigation hierarchy[cite: 1].
 * - Manages global StatusBar state with dynamic color updates[cite: 1].
 * - Implements consistent screen transitions and gesture navigation[cite: 1].
 *
 * Features:
 * - Dynamic StatusBar management[cite: 1].
 * - Smooth 'fade_from_bottom' animations[cite: 1].
 * - Centralized route definitions for Auth, Profile, and Main flows[cite: 1].
 */

import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from '../styles/Themes';

// --- Screen Imports ---
import Splash from '../screens/splash-screen/Splash';
import OnBoarding from '../screens/onboarding-screen/OnBoarding';

// Auth Screens
import Signin from '../screens/auth/signin-screen/Signin';
import Signup from '../screens/auth/signup-screen/Signup';
import ForgotPassword from '../screens/auth/forgot-password-screen/ForgotPassword';

// Main Application
import BottomNavigator from '../navigation/bottom-navigator/BottomNavigator';

// Profile & Sub-screens
import MyProfile from '../screens/profile-screen/sub-screens/MyProfile';
import EmailVerification from '../screens/profile-screen/sub-screens/EmailVerification';
import About from '../screens/profile-screen/sub-screens/About';
import Support from '../screens/profile-screen/sub-screens/Support';
import Favorites from '../screens/profile-screen/sub-screens/Favorites';
import MyOrders from '../screens/profile-screen/sub-screens/MyOrders';

// Product Category
import ProductCategory from '../screens/products/product-category/ProductCategory';
import ProductDetails from '../screens/products/product-detail/ProductDetails';
import ProductReview from '../screens/products/product-review/ProductReview'

// Cart 
import Cart from '../screens/cart-screen/Cart'

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [statusBarColor, setStatusBarColor] = useState(theme.colors.primary);

  return (
    <>
      <StatusBar
        backgroundColor={statusBarColor}
        barStyle="dark-content"
        translucent={false}
      />

      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
          gestureEnabled: true,
        }}
      >
        {/* --- ENTRY POINT --- */}
        <Stack.Screen name="Splash">
          {props => <Splash {...props} setStatusBarColor={setStatusBarColor} />}
        </Stack.Screen>

        <Stack.Screen name="OnBoarding">
          {props => (
            <OnBoarding {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        {/* --- AUTHENTICATION FLOW --- */}
        <Stack.Screen name="Signin">
          {props => <Signin {...props} setStatusBarColor={setStatusBarColor} />}
        </Stack.Screen>

        <Stack.Screen name="Signup">
          {props => <Signup {...props} setStatusBarColor={setStatusBarColor} />}
        </Stack.Screen>

        <Stack.Screen name="Forgot_Password">
          {props => <ForgotPassword {...props} setStatusBarColor={setStatusBarColor} />}
        </Stack.Screen>

        {/* --- MAIN APPLICATION ENTRY --- */}
        <Stack.Screen name="Main">
          {props => (
            <BottomNavigator {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        {/* --- PROFILE & SETTINGS --- */}
        <Stack.Screen name="My_Profile">
          {props => (
            <MyProfile {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        <Stack.Screen name="Email_Verification">
          {props => (
            <EmailVerification
              {...props}
              setStatusBarColor={setStatusBarColor}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="About_Us">
          {props => <About {...props} setStatusBarColor={setStatusBarColor} />}
        </Stack.Screen>

        <Stack.Screen name="Support_Center">
          {props => (
            <Support {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        <Stack.Screen name="Favorites">
          {props => (
            <Favorites {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        <Stack.Screen name="My_Orders">
          {props => (
            <MyOrders {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        {/* --- PRODUCT CATEGORIES --- */}
        <Stack.Screen name="Product_Category">
          {props => (
            <ProductCategory {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

         <Stack.Screen name="Product_Details">
          {props => (
            <ProductDetails {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

         <Stack.Screen name="Product_Reviews">
          {props => (
            <ProductReview {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        {/* --- CART --- */}
        <Stack.Screen name="Cart">
          {props => (
            <Cart {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

      </Stack.Navigator>
    </>
  );
};

export default AppNavigator;
