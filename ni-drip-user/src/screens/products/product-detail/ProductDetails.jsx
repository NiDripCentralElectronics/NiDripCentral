import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import {
  addToFavorites,
  removeFromFavorites,
} from '../../../redux/slices/favorite.slice';
import { addToCart } from '../../../redux/slices/cart.slice';
import { setProducts } from '../../../redux/slices/product.slice';
import { theme } from '../../../styles/Themes';
import Button from '../../../utilities/custom-components/button/Button.utility';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

const ProductDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { product } = route.params;

  console.log('Product', product);

  const dispatch = useDispatch();
  const favorites = useSelector(state => state.favorites.favorites || []);
  const isFavorite = favorites.some(fav => fav.productId?._id === product._id);
  const { loading: cartLoading } = useSelector(state => state.cart);

  const [activeSlide, setActiveSlide] = useState(0);
  const heartRef = useRef(null);

  useEffect(() => {
    if (route.params?.product) {
      setProducts(route.params.product);
    }
  }, [route.params]);

  useEffect(() => {
    if (isFavorite) {
      heartRef.current?.bounceIn(800);
    }
  }, [isFavorite]);

  const handleGoToReviews = () => {
    navigation.navigate('Product_Reviews', {
      product: product,
      onReviewSubmit: updatedProduct => {
        setProducts(updatedProduct);
      },
    });
  };

  const handleScroll = event => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / width);
    if (slide !== activeSlide) setActiveSlide(slide);
  };

  const toggleFavorite = () => {
    if (isFavorite) {
      dispatch(removeFromFavorites(product._id));
    } else {
      dispatch(addToFavorites(product._id));
    }
  };

  const handleAddToCart = async () => {
    try {
      const resultAction = await dispatch(
        addToCart({ productId: product._id, quantity: 1 }),
      );

      if (addToCart.fulfilled.match(resultAction)) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Item added to your cart! 🛒',
        });
      } else {
        const errorMsg =
          resultAction.payload?.message || 'Failed to add to cart';
        Toast.show({
          type: 'error',
          text1: 'Oops!',
          text2: errorMsg,
        });
      }
    } catch (err) {
      console.error('Cart Error:', err);
    }
  };

  const images =
    product.productImages?.length > 0
      ? product.productImages
      : ['https://via.placeholder.com/400'];

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={width * 0.07}
            color={theme.colors.dark}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerBtn}
          onPress={toggleFavorite}
          activeOpacity={0.7}
        >
          <Animatable.View ref={heartRef}>
            <MaterialCommunityIcons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={width * 0.07}
              color={isFavorite ? theme.colors.primary : theme.colors.dark}
            />
          </Animatable.View>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.imageBox}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {images.map((img, index) => (
              <Image
                key={index}
                source={{ uri: img }}
                style={styles.mainImg}
                resizeMode="contain"
              />
            ))}
          </ScrollView>
          <View style={styles.pageIndicator}>
            <Text style={styles.pageText}>
              {activeSlide + 1} / {images.length}
            </Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.priceText}>${product.price?.toFixed(2)}</Text>
          <Text style={styles.productTitle}>{product.title}</Text>

          <View style={styles.ratingRow}>
            <View style={styles.starBox}>
              {[1, 2, 3, 4, 5].map(s => (
                <MaterialCommunityIcons
                  key={s}
                  name={
                    s <= (product.averageRating || 0) ? 'star' : 'star-outline'
                  }
                  size={width * 0.05}
                  color="#FFB800"
                />
              ))}
            </View>
            <Text style={styles.reviewText}>
              {product.totalReviews || 0} Ratings
            </Text>
          </View>
        </View>

        <View style={styles.gap} />

        <View style={styles.infoSection}>
          <Text style={styles.sectionHeading}>Product Description</Text>
          <View style={styles.descWrapper}>
            <Text style={styles.descContent}>{product.description}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.reviewHeaderRow}>
            <Text style={styles.sectionHeading}>
              Ratings & Reviews{' '}
              <Text style={styles.countText}>
                ({product.totalReviews || 0})
              </Text>
            </Text>
            <View style={styles.avgRatingBadge}>
              <Text style={styles.avgRatingText}>
                {product.averageRating || 0}
              </Text>
              <MaterialCommunityIcons
                name="star"
                size={width * 0.045}
                color="#FFB800"
              />
              <TouchableOpacity activeOpacity={0.6} onPress={handleGoToReviews}>
                ,
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={width * 0.06}
                  color={theme.colors.dark}
                />
              </TouchableOpacity>
            </View>
          </View>

          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.slice(0, 4).map((rev, index) => {
              const reviewStars =
                product.ratings?.find(r => {
                  const rvUserId = rev?.user?._id || rev?.user;
                  const rUserId = r?.user?._id || r?.user;
                  return (
                    rvUserId &&
                    rUserId &&
                    rvUserId.toString() === rUserId.toString()
                  );
                })?.stars || 0;

              return (
                <Animatable.View
                  key={rev._id || index}
                  animation="fadeInUp"
                  delay={index * 50}
                  style={styles.reviewCard}
                >
                  <Text style={styles.reviewComment}>{rev.reviewText}</Text>

                  <View style={styles.reviewMeta}>
                    <View style={styles.starBoxSmall}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <MaterialCommunityIcons
                          key={s}
                          name={s <= reviewStars ? 'star' : 'star-outline'}
                          size={width * 0.032}
                          color="#FFB800"
                        />
                      ))}
                    </View>

                    <Text style={styles.reviewerName}>
                      {rev?.user?.userName || 'Anonymous'}
                    </Text>
                  </View>
                </Animatable.View>
              );
            })
          ) : (
            <View style={styles.noReviewBox}>
              <Text style={styles.noReviewText}>
                No Reviews For This Product Yet!
              </Text>
            </View>
          )}
        </View>

        <View style={styles.gap} />

        <View style={styles.infoSection}>
          <Text style={styles.sectionHeading}>Specifications</Text>
          {product.specifications?.map((spec, index) => (
            <View key={spec._id || index} style={styles.specGroup}>
              <Text style={styles.specTitle}>{spec.section}</Text>
              {spec.items?.map(item => (
                <View key={item._id} style={styles.specItemRow}>
                  <Text style={styles.specName}>{item.name}</Text>
                  <Text style={styles.specVal}>{item.value}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        <View style={{ height: height * 0.15 }} />
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.stockStatus}>
          <MaterialCommunityIcons
            name="package-variant-closed"
            size={width * 0.06}
            color={theme.colors.secondary}
          />
          <Text style={styles.stockLabel}>Stock {product.stock}</Text>
        </View>

        <View style={styles.buttonGroup}>
          <Button
            title={cartLoading ? 'Adding...' : 'Add to Cart'}
            onPress={handleAddToCart}
            disabled={cartLoading || product.stock < 1} // Disable if out of stock or loading
            width={100}
            backgroundColor={theme.colors.gray}
            textColor={theme.colors.dark}
            textStyle={styles.btnLabel}
            style={styles.actionBtn}
          />
          <Button
            title="Buy Now"
            onPress={() => {}}
            width={100}
            backgroundColor={theme.colors.primary}
            textColor={theme.colors.white}
            textStyle={styles.btnLabel}
            style={styles.actionBtn}
            elevation="depth2"
          />
        </View>
      </View>
    </View>
  );
};

export default ProductDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  header: {
    position: 'absolute',
    top: height * 0.05,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.04,
  },

  headerBtn: {
    width: width * 0.11,
    height: width * 0.11,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: theme.borderRadius.circle,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.elevation.depth1,
  },

  imageBox: {
    width: width,
    height: height * 0.45,
    backgroundColor: theme.colors.white,
    position: 'relative',
  },

  mainImg: {
    width: width,
    height: height * 0.45,
  },

  pageIndicator: {
    position: 'absolute',
    bottom: height * 0.02,
    right: width * 0.05,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.005,
    borderRadius: theme.borderRadius.large,
  },

  pageText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.medium,
  },

  infoSection: {
    backgroundColor: theme.colors.white,
    padding: width * 0.05,
  },

  priceText: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.primary,
    fontFamily: theme.typography.black,
    marginBottom: height * 0.005,
  },

  productTitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.dark,
    fontFamily: theme.typography.regular,
    lineHeight: theme.typography.lineHeight.md,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: height * 0.015,
  },

  starBox: {
    flexDirection: 'row',
    marginRight: width * 0.03,
  },

  reviewText: {
    fontSize: theme.typography.fontSize.xs,
    color: '#718096',
    fontFamily: theme.typography.medium,
  },

  reviewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.02,
  },

  avgRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  avgRatingText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.bold,
    color: theme.colors.dark,
  },

  reviewCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: theme.borderRadius.medium,
    padding: width * 0.03,
    marginBottom: height * 0.015,
  },

  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.01,
  },

  starBoxSmall: {
    flexDirection: 'row',
    marginRight: width * 0.02,
  },

  reviewerName: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.dark,
    fontFamily: theme.typography.medium,
  },

  reviewComment: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.dark,
    fontFamily: theme.typography.medium,
    lineHeight: 20,
  },

  noReviewBox: {
    paddingVertical: height * 0.02,
    alignItems: 'center',
  },

  noReviewText: {
    fontSize: theme.typography.fontSize.xs,
    color: '#A0AEC0',
    fontFamily: theme.typography.medium,
  },

  gap: {
    height: height * 0.012,
  },

  sectionHeading: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.dark,
    fontFamily: theme.typography.bold,
  },

  descWrapper: {
    backgroundColor: '#FDF2F8',
    padding: width * 0.04,
    borderRadius: theme.borderRadius.medium,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    marginTop: height * 0.01,
  },

  descContent: {
    fontSize: theme.typography.fontSize.xs,
    color: '#4A5568',
    lineHeight: theme.typography.lineHeight.sm,
    fontFamily: theme.typography.regular,
  },

  specGroup: {
    marginTop: height * 0.015,
    marginBottom: height * 0.01,
  },

  specTitle: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary,
    fontFamily: theme.typography.black,
    textTransform: 'uppercase',
    marginBottom: height * 0.01,
    letterSpacing: 1,
  },

  specItemRow: {
    flexDirection: 'row',
    paddingVertical: height * 0.012,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },

  specName: {
    flex: 1,
    fontSize: theme.typography.fontSize.xs,
    color: '#718096',
    fontFamily: theme.typography.medium,
  },

  specVal: {
    flex: 1.5,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.dark,
    fontFamily: theme.typography.semiBold,
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.1,
    backgroundColor: theme.colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.04,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    ...theme.elevation.depth2,
  },

  stockStatus: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  stockLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: '#718096',
    fontFamily: theme.typography.bold,
    textAlign: 'center',
  },

  buttonGroup: {
    flexDirection: 'row',
    gap: width * 0.02,
  },

  actionBtn: {
    height: height * 0.06,
    borderRadius: theme.borderRadius.medium,
  },

  btnLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.semiBold,
  },
});
