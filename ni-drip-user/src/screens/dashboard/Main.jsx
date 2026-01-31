/**
 * @file Home.jsx
 * @module Screens/Home
 * @description
 * Primary landing screen for the NiDrip Central application.
 * Responsibilities:
 * - Displays a curated list of electronic and appliance categories (Laptops, Smartphones, etc.).
 * - Handles real-time location detection and permission management to provide localized services.
 * - Integrates with Redux for fetching and filtering global product data.
 * - Provides search functionality to filter available categories dynamically.
 * Features:
 * - Automated Geolocation: Requests and updates user coordinates on component mount.
 * - Dynamic Category Extraction: Parses product metadata to count and display relevant categories.
 * - Responsive UI: Utilizes a dual-column FlatList for an elegant, modern shopping experience.
 * - Theme Integration: Uses global theme colors and typography for brand consistency.
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  StatusBar,
  FlatList,
  Text,
  Pressable,
  PermissionsAndroid,
  Platform,
  RefreshControl,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Geolocation from 'react-native-geolocation-service';
import { theme } from '../../styles/Themes';
import Header from '../../utilities/custom-components/header/header/Header';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import InputField from '../../utilities/custom-components/input-field/InputField.utility';
import CategoryCard from '../../utilities/custom-components/card/category-card/CategoryCard';
import { useDispatch, useSelector } from 'react-redux';
import { getAllProducts } from '../../redux/slices/product.slice';
import { getUser, updateLocation } from '../../redux/slices/user.slice';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const ALLOWED_CATEGORIES = [
  'laptops',
  'smartphones',
  'refrigerators',
  'washingmachines',
  'xbox',
  'consoles',
  'playstations',
  'televisions',
];

const extractCategories = product => {
  const result = [];
  if (!product?.category) return result;
  product.category.forEach(c => {
    try {
      const parsed = JSON.parse(c);
      if (Array.isArray(parsed)) {
        parsed.forEach(p => p && result.push(p));
      }
    } catch {}
  });
  return result;
};

const Home = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  const user = useSelector(state => state.auth.user);
  const profile = useSelector(state => state.user.user);
  const AllProducts = useSelector(state => state.product.products || []);
  const loading = useSelector(state => state.product.loading || false);

  useEffect(() => {
    if (user?.id) {
      dispatch(getAllProducts());
      dispatch(getUser(user.id));
      requestLocationPermission();
    }
  }, [dispatch, user]);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor('transparent');
  }, []);

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        const auth = await Geolocation.requestAuthorization('whenInUse');
        if (auth === 'granted') getCurrentLocation();
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'We need your location to show nearby products',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        }
      }
    } catch (err) {}
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        dispatch(
          updateLocation({
            userId: user?.id || user?._id,
            latitude,
            longitude,
          }),
        );
      },
      error => {},
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };

  const categoriesData = useMemo(() => {
    const map = {};
    AllProducts.forEach(p => {
      const cats = extractCategories(p);
      cats.forEach(cat => {
        if (!ALLOWED_CATEGORIES.includes(cat)) return;
        if (!map[cat]) {
          map[cat] = {
            title: cat,
            itemCount: 0,
            imageUrl: p.productImages?.[0] || null,
          };
        }
        map[cat].itemCount += 1;
        if (!map[cat].imageUrl && p.productImages?.[0]) {
          map[cat].imageUrl = p.productImages[0];
        }
      });
    });
    return ALLOWED_CATEGORIES.map(c => map[c]).filter(Boolean);
  }, [AllProducts]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categoriesData;
    const q = searchQuery.toLowerCase();
    return categoriesData.filter(c => c.title.toLowerCase().includes(q));
  }, [searchQuery, categoriesData]);

  const EmptyState = () => (
    <Animatable.View
      animation="fadeIn"
      duration={800}
      style={styles.emptyContainer}
    >
      <Animatable.View
        animation="pulse"
        iterationCount="infinite"
        duration={2200}
        easing="ease-out"
      >
        <MaterialCommunityIcons
          name="store-search-outline"
          size={120}
          color="#CBD5E1"
        />
      </Animatable.View>
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No matching categories' : 'No categories available'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? 'Try a different search term'
          : 'New categories are added regularly – check back soon!'}
      </Text>
      <Animatable.View animation="fadeInUp" delay={400} duration={600}>
        <Text style={styles.emptyHint}>
          Explore the latest electronics & appliances
        </Text>
      </Animatable.View>
    </Animatable.View>
  );

  const renderCategory = ({ item, index }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 80}
      duration={700}
      easing="ease-out-cubic"
    >
      <CategoryCard
        title={item.title}
        imageUrl={item.imageUrl}
        itemCount={item.itemCount}
        onPress={() => {
          navigation.navigate('Product_Category', {
            category: item.title,
          });
        }}
      />
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      <Header
        logo={require('../../assets/logo/logo.png')}
        title="Home"
        rightIcon={
          <MaterialCommunityIcons
            name="cart-outline"
            size={width * 0.06}
            color={theme.colors.white}
          />
        }
        onPressRight={() => navigation.navigate('Cart')}
      />

      <View style={styles.locationSection}>
        <Animatable.View
          animation="fadeInLeft"
          duration={800}
          style={styles.locationBadge}
        >
          <MaterialCommunityIcons
            name="map-marker-radius"
            size={20}
            color={theme.colors.primary}
          />
          <Text style={styles.locationText} numberOfLines={1}>
            {profile?.address || 'Detecting your location...'}
          </Text>
        </Animatable.View>
      </View>

      <View style={styles.searchSection}>
        <InputField
          placeholder="Search categories..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={
            <MaterialCommunityIcons
              name="magnify"
              size={width * 0.065}
              color={theme.colors.darkGray}
            />
          }
        />
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Explore Categories</Text>
          <Pressable style={styles.viewAllBtn} activeOpacity={0.7}>
            <Text style={styles.viewAllText}>View all</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={theme.colors.primary}
            />
          </Pressable>
        </View>

        <FlatList
          data={filteredCategories}
          keyExtractor={item => item.title}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => dispatch(getAllProducts())}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          renderItem={renderCategory}
          ListEmptyComponent={<EmptyState />}
        />
      </View>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  locationSection: {
    marginTop: height * 0.02,
    alignSelf: 'center',
  },

  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    paddingVertical: height * 0.012,
    paddingHorizontal: width * 0.04,
    borderRadius: 30,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  locationText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamilyMedium,
    color: '#475569',
    marginLeft: width * 0.02,
    maxWidth: width * 0.7,
  },

  searchSection: {
    paddingHorizontal: width * 0.02,
    marginTop: height * 0.025,
  },

  content: {
    flex: 1,
    marginTop: height * 0.03,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.05,
    marginBottom: height * 0.025,
  },

  sectionTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.bold,
    color: '#0F172A',
  },

  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  viewAllText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.bold,
    color: theme.colors.primary,
  },

  list: {
    paddingHorizontal: width * 0.02,
    paddingBottom: height * 0.08,
  },

  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: height * 0.025,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.1,
    marginTop: height * 0.1,
  },

  emptyTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.bold,
    color: '#1E293B',
    marginTop: height * 0.04,
    textAlign: 'center',
  },

  emptySubtitle: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.medium,
    color: '#64748B',
    marginTop: height * 0.015,
    textAlign: 'center',
    lineHeight: 26,
  },

  emptyHint: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.semiBold,
    color: theme.colors.primary,
    marginTop: height * 0.04,
    textAlign: 'center',
    paddingHorizontal: width * 0.1,
  },
});
