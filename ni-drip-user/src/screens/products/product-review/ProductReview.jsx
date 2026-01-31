/**
 * @file ProductReview.jsx
 * @module Screens/ProductReview
 * @description
 * Ultra-premium product reviews screen with Add and Tap-and-Hold Delete
 * functionality, featuring instant local state updates and Toast feedback.
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../../styles/Themes';
import Header from '../../../utilities/custom-components/header/header/Header';
import InputField from '../../../utilities/custom-components/input-field/InputField.utility';
import { addReview, deleteReview } from '../../../redux/slices/review.slice';
import { addRating } from '../../../redux/slices/rating.slice';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

const ProductReview = ({ route, navigation }) => {
  const dispatch = useDispatch();

  const [product, setProduct] = useState(route.params.product);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userReview, setUserReview] = useState('');
  const [userRating, setUserRating] = useState(0);

  console.log('REVIEw', product); 

  const renderStars = (rating, interactive = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          disabled={!interactive}
          onPress={() => interactive && setUserRating(i)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={
              i <= (interactive ? userRating : rating) ? 'star' : 'star-outline'
            }
            size={interactive ? 32 : 20}
            color="#FFB800"
            style={interactive && { marginHorizontal: width * 0.02 }}
          />
        </TouchableOpacity>,
      );
    }
    return stars;
  };

  const calculateAverage = ratingsArr => {
    if (!Array.isArray(ratingsArr) || ratingsArr.length === 0) return 0;
    const total = ratingsArr.reduce((s, r) => s + Number(r.stars || 0), 0);
    return Number((total / ratingsArr.length).toFixed(1));
  };

  const handleLongPress = reviewId => {
    console.log('Attempting to delete Review ID:', reviewId);
    console.log('ID Type:', typeof reviewId);

    if (!reviewId || String(reviewId).startsWith('local')) {
      console.warn('Delete blocked: ID is local or undefined.');
      Toast.show({
        type: 'info',
        text1: 'Processing',
        text2: 'Please wait a moment for the review to sync.',
      });
      return;
    }

    Alert.alert(
      'Delete Review',
      'Do you want to permanently delete this review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            console.log('Confirmed delete for ID:', reviewId);
            try {
              const result = await dispatch(deleteReview(reviewId)).unwrap();
              Toast.show({
                type: 'success',
                text1: 'Success',
                text2: result?.message || 'Review deleted successfully',
              });
              console.log('Delete Success:', result);

              // Update local state
              setProduct(prev => {
                const updatedReviews = prev.reviews.filter(
                  r => r._id !== reviewId,
                );
                const updatedRatings = prev.ratings.filter(r => {
                  const ratingUserId =
                    typeof r.user === 'object' ? r.user._id : r.user;
                  const deletedReview = prev.reviews.find(
                    rev => rev._id === reviewId,
                  );
                  const deletedUserId =
                    deletedReview?.user?._id || deletedReview?.user;
                  return ratingUserId?.toString() !== deletedUserId?.toString();
                });

                const newAverageRating = calculateAverage(updatedRatings);

                return {
                  ...prev,
                  reviews: updatedReviews,
                  ratings: updatedRatings,
                  totalReviews: Math.max(0, (prev.totalReviews || 1) - 1),
                  averageRating: newAverageRating,
                };
              });

              // Update parent screen (ProductDetails) before navigating back
              navigation.navigate('Product_Details', {
                product: {
                  ...product,
                  reviews: product.reviews.filter(r => r._id !== reviewId),
                  totalReviews: Math.max(0, (product.totalReviews || 1) - 1),
                  ratings: product.ratings.filter(r => {
                    const ratingUserId =
                      typeof r.user === 'object' ? r.user._id : r.user;
                    const deletedReview = product.reviews.find(
                      rev => rev._id === reviewId,
                    );
                    const deletedUserId =
                      deletedReview?.user?._id || deletedReview?.user;
                    return (
                      ratingUserId?.toString() !== deletedUserId?.toString()
                    );
                  }),
                  averageRating: calculateAverage(
                    product.ratings.filter(r => {
                      const ratingUserId =
                        typeof r.user === 'object' ? r.user._id : r.user;
                      const deletedReview = product.reviews.find(
                        rev => rev._id === reviewId,
                      );
                      const deletedUserId =
                        deletedReview?.user?._id || deletedReview?.user;
                      return (
                        ratingUserId?.toString() !== deletedUserId?.toString()
                      );
                    }),
                  ),
                },
              });
            } catch (error) {
              console.error('Delete Action Error:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error?.message || 'Failed to delete review',
              });
            }
          },
        },
      ],
    );
  };

  const handleSubmitReview = async () => {
    if (!userReview.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Incomplete',
        text2: 'Please write your review',
      });
      return;
    }

    if (userRating === 0) {
      Toast.show({
        type: 'info',
        text1: 'Rating Required',
        text2: 'Please select a star rating',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit rating
      await dispatch(
        addRating({ productId: product._id, stars: userRating }),
      ).unwrap();

      // Submit review
      const reviewResponse = await dispatch(
        addReview({
          productId: product._id,
          reviewText: userReview.trim(),
          stars: userRating,
        }),
      ).unwrap();

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: reviewResponse?.message || 'Review submitted successfully',
      });

      const serverReview = reviewResponse?.newReview;

      // Create new review object
      const newReview = {
        _id: serverReview?._id || `local-${Date.now()}`,
        reviewText: serverReview?.reviewText || userReview.trim(),
        user: serverReview?.user || {
          _id: 'me',
          userName: 'You',
          profilePicture: null,
        },
        createdAt: serverReview?.createdAt || new Date().toISOString(),
      };

      // Create new rating object
      const newRating = {
        user: newReview.user,
        stars: userRating,
      };

      // Update local state
      setProduct(prev => {
        const prevReviews = Array.isArray(prev.reviews) ? prev.reviews : [];
        const prevRatings = Array.isArray(prev.ratings) ? prev.ratings : [];

        // Remove existing rating from same user
        const filteredRatings = prevRatings.filter(r => {
          const uid = typeof r.user === 'object' ? r.user._id : r.user;
          const newUid =
            typeof newReview.user === 'object'
              ? newReview.user._id
              : newReview.user;
          return uid?.toString() !== newUid?.toString();
        });

        const updatedRatings = [newRating, ...filteredRatings];
        const newAverageRating = calculateAverage(updatedRatings);

        return {
          ...prev,
          reviews: [newReview, ...prevReviews],
          totalReviews: (prev.totalReviews || 0) + 1,
          ratings: updatedRatings,
          averageRating: newAverageRating,
        };
      });

      // Clear form
      setUserReview('');
      setUserRating(0);

      // Navigate back to ProductDetails with updated product
      setTimeout(() => {
        navigation.navigate('Product_Details', {
          product: {
            ...product,
            reviews: [newReview, ...(product.reviews || [])],
            totalReviews: (product.totalReviews || 0) + 1,
            ratings: [newRating, ...(product.ratings || [])],
            averageRating: calculateAverage([
              newRating,
              ...(product.ratings || []),
            ]),
          },
          refreshTime: Date.now(), // Force re-render
        });
      }, 1000);
    } catch (error) {
      console.error('Submit Review Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.message || 'Failed to submit review. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNavigateBack = () => {
    navigation.navigate({
      name: 'Product_Details',
      params: {
        product: product,
        refreshTime: Date.now(),
      },
      merge: true,
    });
  };

  return (
    <View style={styles.container}>
      <Header
        logo={require('../../../assets/logo/logo.png')}
        title={`Reviews (${product.totalReviews || 0})`}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {product.reviews?.length > 0 ? (
          product.reviews.map((rev, index) => {
            const ratingObj = product.ratings?.find(r => {
              const rvUserId = rev?.user?._id || rev?.user;
              const rUserId = r?.user?._id || r?.user;
              return (
                rvUserId &&
                rUserId &&
                rvUserId.toString() === rUserId.toString()
              );
            }) || { stars: 0 };

            return (
              <TouchableOpacity
                key={rev._id || index}
                activeOpacity={0.9}
                onLongPress={() => handleLongPress(rev._id)}
              >
                <Animatable.View
                  animation="fadeInUp"
                  delay={index * 100}
                  duration={600}
                  easing="ease-out"
                  style={styles.reviewCard}
                >
                  <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {rev.user?.userName?.charAt(0)?.toUpperCase() || 'U'}
                      </Text>
                    </View>
                    <View style={styles.userMeta}>
                      <Text style={styles.userName}>
                        {rev.user?.userName || 'Anonymous'}
                      </Text>
                      <View style={styles.starRow}>
                        {renderStars(ratingObj.stars)}
                      </View>
                    </View>
                  </View>
                  <Text style={styles.reviewText}>{rev.reviewText}</Text>
                </Animatable.View>
              </TouchableOpacity>
            );
          })
        ) : (
          <Animatable.View
            animation="fadeIn"
            duration={800}
            style={styles.emptyState}
          >
            <MaterialCommunityIcons
              name="comment-text-multiple-outline"
              size={width * 0.25}
              color="#CBD5E1"
            />
            <Text style={styles.emptyTitle}>No Reviews Yet</Text>
            <Text style={styles.emptySubtitle}>
              Be the first to share your experience!
            </Text>
          </Animatable.View>
        )}
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        style={styles.inputFooter}
      >
        <View style={styles.ratingPicker}>
          <Text style={styles.rateLabel}>Your Rating:</Text>
          {renderStars(0, true)}
        </View>

        <View style={styles.inputContainer}>
          <InputField
            placeholder="Share your honest review..."
            value={userReview}
            onChangeText={setUserReview}
            multiline
            borderRadius={theme.borderRadius.large}
            backgroundColor="#F8FAFC"
            borderColor="#E2E8F0"
            style={styles.inputField}
          />

          <TouchableOpacity
            style={[
              styles.sendBtn,
              { opacity: userReview.trim() && userRating > 0 ? 1 : 0.4 },
            ]}
            onPress={handleSubmitReview}
            disabled={isSubmitting || !userReview.trim() || userRating === 0}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <MaterialCommunityIcons
                name="send-circle"
                size={width * 0.12}
                color={theme.colors.primary}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ProductReview;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  scrollContent: {
    padding: width * 0.05,
    paddingBottom: height * 0.28,
  },

  reviewCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.large,
    padding: width * 0.04,
    marginBottom: height * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },

  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.015,
  },

  avatar: {
    width: width * 0.11,
    height: width * 0.11,
    borderRadius: theme.borderRadius.circle,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: width * 0.03,
  },

  avatarText: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.bold,
    color: theme.colors.primary,
  },

  userMeta: {
    flex: 1,
  },

  userName: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.bold,
    color: '#0F172A',
  },

  starRow: {
    flexDirection: 'row',
  },

  reviewText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.medium,
    color: '#475569',
    lineHeight: 22,
  },

  inputFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    padding: width * 0.04,
    paddingBottom: Platform.OS === 'ios' ? height * 0.05 : height * 0.02,
    width: '100%',
  },

  ratingPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.015,
  },

  rateLabel: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.bold,
    color: '#0F172A',
    marginRight: width * 0.02,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  inputField: {
    width: width * 0.78,
  },

  sendBtn: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyState: {
    alignItems: 'center',
    marginTop: height * 0.15,
  },

  emptyTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.bold,
    color: '#1E293B',
    marginTop: height * 0.02,
  },

  emptySubtitle: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.medium,
    color: '#64748B',
    marginTop: height * 0.01,
    textAlign: 'center',
  },
});
