/**
 * @fileoverview Reusable Cart Item Card Component
 * @module components/cards/CartCard
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { theme } from '../../../../styles/Themes';

const { width, height } = Dimensions.get('window');

const CartCard = ({
  title,
  price,
  imageUrl,
  onRemove,
  onIncrease,
  onDecrease,
  quantity,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons
              name="image-outline"
              size={width * 0.08}
              color={theme.colors.gray}
            />
          </View>
        )}
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        <Text style={styles.price}>${price?.toFixed(2)}</Text>

        <View style={styles.quantityContainer}>
          <TouchableOpacity onPress={onDecrease} style={styles.quantityButton}>
            <Ionicons
              name="remove"
              size={width * 0.04}
              color={theme.colors.white}
            />
          </TouchableOpacity>

          <Text style={styles.quantityText}>{quantity}</Text>

          <TouchableOpacity onPress={onIncrease} style={styles.quantityButton}>
            <Ionicons
              name="add"
              size={width * 0.04}
              color={theme.colors.white}
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
        <Ionicons
          name="trash-outline"
          size={width * 0.06}
          color={theme.colors.error}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default CartCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: width * 0.035,
    marginVertical: height * 0.008,
    borderRadius: theme.borderRadius.medium,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  imageContainer: {
    width: width * 0.2,
    height: width * 0.25,
    borderRadius: theme.borderRadius.small,
    backgroundColor: theme.colors.lightGray,
    overflow: 'hidden',
    marginRight: width * 0.035,
  },

  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  placeholderImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  detailsContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },

  title: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.semiBold,
    color: theme.colors.dark,
    lineHeight: theme.typography.fontSize.lg,
  },

  price: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.bold,
    color: theme.colors.primary,
    marginVertical: height * 0.005,
  },

  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  quantityButton: {
    width: width * 0.07,
    height: width * 0.07,
    borderRadius: theme.borderRadius.circle,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  quantityText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.medium,
    color: theme.colors.dark,
    marginHorizontal: width * 0.04,
  },

  removeButton: {
    padding: width * 0.02,
    alignSelf: 'flex-start',
  },
});
