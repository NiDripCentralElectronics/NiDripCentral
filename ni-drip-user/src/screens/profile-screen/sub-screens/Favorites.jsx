/**
 * @fileoverview Favorites (Wishlist) Screen
 * @module screens/favorites/FavoritesScreen
 * @description Displays user's bookmarked products with the ability to remove items or move them to cart.
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  StatusBar,
  FlatList,
  Text,
  Animated,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { theme } from '../../../styles/Themes';
import { globalStyles } from '../../../styles/GlobalStyles';
import Header from '../../../utilities/custom-components/header/header/Header';
import CartCard from '../../../utilities/custom-components/card/cart-card/CartCard';
import Loader from '../../../utilities/custom-components/loader/Loader.utility';
import {
  getFavorites,
  removeFromFavorites,
  resetFavoritesState,
} from '../../../redux/slices/favorite.slice';
import { addToCart } from '../../../redux/slices/cart.slice';
import Button from '../../../utilities/custom-components/button/Button.utility';

const { width, height } = Dimensions.get('window');

const Favorites = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { favorites, loading, error, message, success } = useSelector(
    state => state.favorites,
  );

  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    StatusBar.setBackgroundColor(theme.colors.primary);
    dispatch(getFavorites());
  }, []);

  useEffect(() => {
    if (success && message) {
      Toast.show({
        type: 'success',
        text1: 'Favorites',
        text2: message,
      });
      dispatch(resetFavoritesState());
    }
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message,
      });
      dispatch(resetFavoritesState());
    }
  }, [success, error, message]);

  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(getFavorites());
    setRefreshing(false);
  };

  const handleRemove = async productId => {
    await dispatch(removeFromFavorites(productId));
  };

  const handleAddToCart = async productId => {
    const result = await dispatch(addToCart({ productId, quantity: 1 }));
    if (addToCart.fulfilled.match(result)) {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Moved to shopping cart! 🛒',
      });
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons
          name="heart-outline"
          size={width * 0.2}
          color={theme.colors.primary}
        />
      </View>
      <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
      <Text style={styles.emptySubtitle}>
        Tap the heart icon on any product to save it for later.
      </Text>

      <View style={styles.btnContainer}>
        <Button
          title="Explore Products"
          onPress={() => navigation.navigate('Main')}
          width={width * 0.64}
          backgroundColor={theme.colors.primary}
          textColor={theme.colors.white}
          borderRadius={theme.borderRadius.medium}
        />
      </View>
    </View>
  );

  return (
    <View style={[globalStyles.container, { backgroundColor: '#F8F9FA' }]}>
      <Header
        title="My Wishlist"
        logo={require('../../../assets/logo/logo.png')}
      />

      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <Loader />
        </View>
      ) : (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <FlatList
            data={favorites}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[theme.colors.primary]}
              />
            }
            ListEmptyComponent={renderEmptyState}
            renderItem={({ item }) => (
              <View style={styles.cardWrapper}>
                <CartCard
                  title={item.productId?.title}
                  price={item.productId?.price}
                  imageUrl={
                    item.productId?.productImages?.[0] ||
                    item.productId?.productImage
                  }
                  quantity={1}
                  onRemove={() => handleRemove(item.productId?._id)}
                  // We override internal quantity UI with a custom "Add to Cart" action for Favorites
                />
                <TouchableOpacity
                  style={styles.addToCartFloatingBtn}
                  onPress={() => handleAddToCart(item.productId?._id)}
                >
                  <MaterialCommunityIcons
                    name="cart-outline"
                    size={width * 0.05}
                    color={theme.colors.white}
                  />
                  <Text style={styles.addToCartText}>Add to Cart</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </Animated.View>
      )}
    </View>
  );
};

export default Favorites;

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
  },

  listContainer: {
    padding: width * 0.04,
    paddingBottom: height * 0.05,
    flexGrow: 1,
  },

  cardWrapper: {
    marginBottom: height * 0.015,
  },

  addToCartFloatingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.dark,
    paddingVertical: height * 0.01,
    borderBottomLeftRadius: theme.borderRadius.medium,
    borderBottomRightRadius: theme.borderRadius.medium,
    marginTop: -(height * 0.01),
    zIndex: -1,
  },

  addToCartText: {
    color: theme.colors.white,
    fontFamily: theme.typography.semiBold,
    fontSize: theme.typography.fontSize.xs,
    marginLeft: width * 0.02,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: height * 0.15,
  },

  iconCircle: {
    width: width * 0.35,
    height: width * 0.35,
    borderRadius: (width * 0.35) / 2,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: height * 0.02,
  },

  emptyTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.bold,
    color: theme.colors.dark,
  },

  emptySubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray,
    textAlign: 'center',
    paddingHorizontal: width * 0.15,
    marginTop: height * 0.01,
    fontFamily: theme.typography.bold,
  },

  btnContainer: {
    marginTop: height * 0.03,
  },
});
