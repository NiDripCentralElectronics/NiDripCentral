/**
 * @fileoverview Shopping Cart Screen
 * @module screens/cart/CartScreen
 * @description Displays cart items, handles quantity updates, removal, and checkout navigation.
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
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { theme } from '../../styles/Themes';
import { globalStyles } from '../../styles/GlobalStyles';
import Header from '../../utilities/custom-components/header/header/Header';
import CartCard from '../../utilities/custom-components/card/cart-card/CartCard';
import Loader from '../../utilities/custom-components/loader/Loader.utility';
import Button from '../../utilities/custom-components/button/Button.utility';
import {
  getAllCartItems,
  addToCart,
  decreaseCartItem,
  removeProductFromCart,
} from '../../redux/slices/cart.slice';

const { width, height } = Dimensions.get('window');

const Cart = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { cartItems, loading } = useSelector(state => state.cart);

  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(height * 0.03)).current;

  useEffect(() => {
    StatusBar.setBackgroundColor(theme.colors.primary);
    dispatch(getAllCartItems());
  }, []);

  useEffect(() => {
    if (!loading && cartItems?.length === 0) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 4,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, cartItems]);

  const handleIncrease = async productId => {
    const result = await dispatch(addToCart({ productId, quantity: 1 }));
    if (addToCart.fulfilled.match(result)) {
      Toast.show({
        type: 'success',
        text1: 'Updated',
        text2: 'Quantity increased',
      });
    }
  };

  const handleDecrease = async productId => {
    const result = await dispatch(decreaseCartItem({ productId }));
    if (decreaseCartItem.fulfilled.match(result)) {
      Toast.show({
        type: 'success',
        text1: 'Updated',
        text2: 'Quantity decreased',
      });
    }
  };

  const handleRemove = async productId => {
    const result = await dispatch(removeProductFromCart({ productId }));
    if (removeProductFromCart.fulfilled.match(result)) {
      Toast.show({
        type: 'error',
        text1: 'Removed',
        text2: 'Item removed from cart',
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(getAllCartItems());
    setRefreshing(false);
  };

  const shippingFee = 50;
  const itemTotal = cartItems.reduce(
    (sum, item) => sum + (item.productId?.price || 0) * item.quantity,
    0,
  );
  const totalAmount = itemTotal + (cartItems.length > 0 ? shippingFee : 0);

  const handleNavigateCheckOut = () => {
    if (cartItems.length === 0) return;
    navigation.navigate('CheckOut', {
      cartItems: cartItems.map(item => ({
        productId: item.productId._id,
        title: item.productId.title,
        quantity: item.quantity,
        price: item.productId.price,
      })),
      totalAmount,
      shippingFee,
    });
  };

  return (
    <View style={[globalStyles.container]}>
      <Header title="My Cart" logo={require('../../assets/logo/logo.png')} />

      {loading && cartItems.length === 0 ? (
        <View style={styles.loaderContainer}>
          <Loader />
        </View>
      ) : cartItems.length > 0 ? (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={item => item.productId._id}
            renderItem={({ item }) => (
              <CartCard
                title={item.productId.title}
                price={item.productId.price}
                imageUrl={
                  item.productId.productImages?.[0] ||
                  item.productId.productImage
                }
                quantity={item.quantity}
                onIncrease={() => handleIncrease(item.productId._id)}
                onDecrease={() => handleDecrease(item.productId._id)}
                onRemove={() => handleRemove(item.productId._id)}
              />
            )}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[theme.colors.primary]}
              />
            }
          />

          <View style={styles.checkoutFooter}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${itemTotal.toFixed(2)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>${shippingFee.toFixed(2)}</Text>
            </View>

            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>${totalAmount.toFixed(2)}</Text>
            </View>

            <Button
              title={`Checkout (${cartItems.length} items)`}
              backgroundColor={theme.colors.primary}
              onPress={handleNavigateCheckOut}
              style={styles.checkoutBtn}
            />
          </View>
        </>
      ) : (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY }],
              alignItems: 'center',
            }}
          >
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons
                name="cart-outline"
                size={width * 0.2}
                color={theme.colors.primary}
              />
            </View>

            <Text style={styles.emptyTitle}>Your cart is empty</Text>

            <Text style={styles.emptySubtitle}>
              Looks like you haven't added anything yet.
            </Text>

            <TouchableOpacity
              style={styles.shopNowBtn}
              onPress={() => navigation.navigate('Main')}
            >
              <Text style={styles.shopNowText}>Shop Now</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      )}
    </View>
  );
};

export default Cart;

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  listContainer: {
    padding: width * 0.04,
    paddingBottom: height * 0.3,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: height * 0.1,
  },

  iconCircle: {
    width: width * 0.35,
    height: width * 0.35,
    borderRadius: (width * 0.35) / 2,
    backgroundColor: '#E8F0FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: height * 0.02,
  },

  emptyTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.semiBold,
    color: theme.colors.dark,
  },

  emptySubtitle: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.semiBold,
    color: theme.colors.dark,
    marginTop: height * 0.01,
    textAlign: 'center',
    paddingHorizontal: width * 0.1,
  },

  shopNowBtn: {
    marginTop: height * 0.03,
    paddingHorizontal: width * 0.08,
    paddingVertical: height * 0.015,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.large,
  },

  shopNowText: {
    color: theme.colors.white,
    fontFamily: theme.typography.bold,
    fontSize: theme.typography.fontSize.md,
  },

  checkoutFooter: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.large,
    borderTopRightRadius: theme.borderRadius.large,
    padding: width * 0.06,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.01,
  },

  summaryLabel: {
    color: theme.colors.dark,
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.semiBold,
  },

  summaryValue: {
    color: theme.colors.dark,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.semiBold,
  },

  totalRow: {
    marginTop: height * 0.015,
    paddingTop: height * 0.015,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    marginBottom: height * 0.025,
  },

  totalLabel: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.bold,
    color: theme.colors.dark,
  },

  totalValue: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.bold,
    color: theme.colors.primary,
  },

  checkoutBtn: {
    borderRadius: theme.borderRadius.medium,
    height: height * 0.07,
  },
});
