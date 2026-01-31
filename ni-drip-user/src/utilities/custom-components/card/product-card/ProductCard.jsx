/**
 * @component ProductCard
 * @description An ultra-enhanced ecommerce product tile featuring Redux-integrated favorite logic and micro-interactions.
 * * Responsibilities:
 * - Displays product details including price, title, and rating.
 * - Manages "Favorite/Wishlist" state via Redux (addToFavorites/removeFromFavorites).
 * - Implements complex spring animations for press feedback and heart icon interactions.
 * - Handles image fallback logic using a local asset placeholder.
 * * @param {Object} props
 * @param {Object} props.product - The product data object.
 * @param {string} props.product._id - Unique identifier for the product.
 * @param {string} props.product.title - Name of the product.
 * @param {number} props.product.price - Numeric price value.
 * @param {Array<string>} [props.product.productImages] - Array of image URLs.
 * @param {string} [props.product.category] - Product category name for the brand label.
 * @param {number|string} [props.product.rating] - Product rating score.
 * @param {Function} props.onPress - Navigation callback triggered on card selection.
 * * @returns {React.JSX.Element}
 */

import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Pressable,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
} from '../../../../redux/slices/favorite.slice';
import { theme } from '../../../../styles/Themes';

const { width, height } = Dimensions.get('window');

const ProductCard = ({ product, onPress }) => {
  const dispatch = useDispatch();
  const { favorites = [], loading } = useSelector(state => state.favorites);
  const isFavorite = favorites.some(fav => fav.productId?._id === product._id);

  console.log('Favorite', favorites);

  const heartRef = useRef(null);
  const scaleValue = useRef(new Animated.Value(1)).current;
  const prevFavoriteRef = useRef(false);

  useEffect(() => {
    if (favorites.length === 0 && !loading) {
      dispatch(getFavorites());
    }
  }, [dispatch, favorites.length, loading]);

  useEffect(() => {
    if (isFavorite && !prevFavoriteRef.current) {
      heartRef.current?.bounceIn(800);
    }
    prevFavoriteRef.current = isFavorite;
  }, [isFavorite]);

  const handleFavoriteToggle = e => {
    e.stopPropagation();
    if (isFavorite) {
      dispatch(removeFromFavorites(product._id));
    } else {
      dispatch(addToFavorites(product._id));
    }
  };

  const onPressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[styles.container, { transform: [{ scale: scaleValue }] }]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        style={styles.card}
      >
        <View style={styles.imageContainer}>
          <Image
            source={
              product.productImages?.[0]
                ? { uri: product.productImages[0] }
                : require('../../../../assets/placeHolder/product-placeholder.jpg')
            }
            style={styles.image}
            resizeMode="cover"
          />

          <TouchableOpacity
            style={styles.favoriteBtn}
            onPress={handleFavoriteToggle}
            activeOpacity={0.7}
            disabled={loading}
          >
            <Animatable.View ref={heartRef}>
              <MaterialCommunityIcons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorite ? '#EF4444' : theme.colors.dark}
              />
            </Animatable.View>
          </TouchableOpacity>
        </View>

        <View style={styles.info}>
          <Text style={styles.brandText}>{product?.category}</Text>
          <Text style={styles.title} numberOfLines={1}>
            {product.title}
          </Text>

          <View style={styles.bottomRow}>
            <View>
              <Text style={styles.price}>
                ${product.price?.toLocaleString() || '0'}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default ProductCard;

const styles = StyleSheet.create({
  container: {
    width: width * 0.45,
    marginHorizontal: width * 0.02,
    marginVertical: 10,
  },

  card: {
    backgroundColor: theme.colors.white,
    borderRadius: 20,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    overflow: 'visible',
  },

  imageContainer: {
    width: '100%',
    height: width * 0.45,
    backgroundColor: '#F1F5F9',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: 'hidden',
    position: 'relative',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  favoriteBtn: {
    position: 'absolute',
    top: height * 0.02,
    right: width * 0.02,
    width: width * 0.08,
    height: height * 0.04,
    borderRadius: theme.borderRadius.circle,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  info: {
    padding: height * 0.01,
  },

  brandText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.bold,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: height * 0.01,
  },

  title: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.bold,
    color: '#1E293B',
    marginBottom: height * 0.01,
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },

  price: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.bold,
    color: theme.colors.primary,
  },
});
