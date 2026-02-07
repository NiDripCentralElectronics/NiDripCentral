/**
 * @fileoverview My Orders Screen
 * @module screens/orders/MyOrdersScreen
 * @description Displays user's order history with status filtering, animated cards
 *              and pull-to-refresh support
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
import Loader from '../../../utilities/custom-components/loader/Loader.utility';
import Button from '../../../utilities/custom-components/button/Button.utility';
import { getUserOrders } from '../../../redux/slices/order.slice';

const { width, height } = Dimensions.get('window');

const MyOrdersScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { orders, loading, error, message, success } = useSelector(
    state => state.order,
  );

  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    StatusBar.setBackgroundColor(theme.colors.primary);
    dispatch(getUserOrders());
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

  useEffect(() => {
    if (success && message) {
      Toast.show({
        type: 'success',
        text1: 'Order Update',
        text2: message,
      });
      // dispatch(resetOrdersState()); // ← add if you have such action
    }
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.message || 'Something went wrong',
      });
      // dispatch(resetOrdersState());
    }
  }, [success, error, message]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(getUserOrders());
    setRefreshing(false);
  };

  const filteredOrders =
    orders?.filter(order => {
      const status = (order?.status || '').toUpperCase();
      if (activeFilter === 'ALL') return true;
      return status === activeFilter;
    }) || [];

  const getStatusInfo = status => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'PENDING':
        return {
          label: 'Pending',
          color: '#0087f5',
          bg: '#e1eaff',
          icon: 'clock-outline',
        };
      case 'PROCESSING':
        return {
          label: 'Processing',
          color: '#F57C00',
          bg: '#FFF8E1',
          icon: 'clock-outline',
        };
      case 'SHIPPED':
        return {
          label: 'Shipped',
          color: '#1E88E5',
          bg: '#E3F2FD',
          icon: 'truck-fast-outline',
        };
      case 'DELIVERED':
        return {
          label: 'Delivered',
          color: theme.colors.success,
          bg: '#E8F5E9',
          icon: 'check-circle-outline',
        };
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          color: theme.colors.error,
          bg: '#FFEBEE',
          icon: 'close-circle-outline',
        };
      default:
        return {
          label: s || 'Unknown',
          color: '#757575',
          bg: '#F5F5F5',
          icon: 'information-outline',
        };
    }
  };

  const renderFilterTab = (label, value) => (
    <TouchableOpacity
      style={[
        styles.filterTab,
        activeFilter === value && styles.filterTabActive,
      ]}
      onPress={() => setActiveFilter(value)}
    >
      <Text
        style={[
          styles.filterTabText,
          activeFilter === value && styles.filterTabTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderOrderItem = ({ item }) => {
    const statusInfo = getStatusInfo(item.status);
    const dateStr = new Date(item.createdAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const firstProduct = item.items?.[0]?.product || {};
    const image =
      firstProduct?.productImages?.[0] ||
      firstProduct?.productImage ||
      firstProduct?.images?.[0]?.url ||
      'https://via.placeholder.com/140?text=No+Image';

    const name = firstProduct?.title || firstProduct?.name || 'Order Item';
    const count = item.items?.length || 1;

    return (
      <View style={styles.cardWrapper}>
        <TouchableOpacity
          style={styles.orderCard}
          activeOpacity={0.88}
          onPress={() =>
            navigation.navigate('OrderDetails', { orderId: item._id })
          }
        >
          {/* Header row */}
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.orderNumber}>
                #{String(item._id).slice(-8)}
              </Text>
              <Text style={styles.orderDate}>{dateStr}</Text>
            </View>

            <View
              style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}
            >
              <MaterialCommunityIcons
                name={statusInfo.icon}
                size={14}
                color={statusInfo.color}
              />
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
            </View>
          </View>

          {/* Product preview */}
          <View style={styles.productPreview}>
            <View style={styles.imageContainer}>
              <Animated.Image
                source={{ uri: image }}
                style={styles.productImage}
                resizeMode="cover"
              />
              {count > 1 && (
                <View style={styles.moreBadge}>
                  <Text style={styles.moreBadgeText}>+{count - 1}</Text>
                </View>
              )}
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.productName} numberOfLines={2}>
                {name}
              </Text>
              <Text style={styles.itemsCount}>
                {count} item{count !== 1 ? 's' : ''}
              </Text>
              <Text style={styles.totalAmount}>
                ${Number(item.totalAmount || 0).toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Action row */}
          <View style={styles.actionRow}>
            {item.status?.toUpperCase() === 'PENDING' && (
              <TouchableOpacity
                style={styles.cancelButton}
                // onPress={() => dispatch(cancelOrder({ orderId: item._id }))}
              >
                <Text style={styles.cancelButtonText}>Cancel Order</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.trackButton}>
              <Text style={styles.trackButtonText}>Track Order</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={18}
                color={theme.colors.white}
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons
          name="package-variant-closed"
          size={width * 0.2}
          color={theme.colors.primary}
        />
      </View>
      <Text style={styles.emptyTitle}>No Orders Yet</Text>
      <Text style={styles.emptySubtitle}>
        When you place an order, it will appear here.
      </Text>

      <View style={styles.btnContainer}>
        <Button
          title="Start Shopping"
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
        title="My Orders"
        logo={require('../../../assets/logo/logo.png')}
      />

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { label: 'All', value: 'ALL' },
            { label: 'Pending', value: 'PENDING' },
            { label: 'Processing', value: 'PROCESSING' },
            { label: 'Shipped', value: 'SHIPPED' },
            { label: 'Delivered', value: 'DELIVERED' },
            { label: 'Cancelled', value: 'CANCELLED' },
          ]}
          keyExtractor={item => item.value}
          renderItem={({ item }) => renderFilterTab(item.label, item.value)}
          contentContainerStyle={styles.filterListContent}
        />
      </View>

      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <Loader />
        </View>
      ) : (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <FlatList
            data={filteredOrders}
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
            renderItem={renderOrderItem}
          />
        </Animated.View>
      )}
    </View>
  );
};

export default MyOrdersScreen;

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterContainer: {
    height: 54,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  filterListContent: {
    paddingHorizontal: width * 0.04,
    paddingVertical: 10,
  },

  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius.circle,
    backgroundColor: '#fff',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },

  filterTabActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },

  filterTabText: {
    fontFamily: theme.typography.medium,
    fontSize: 14,
    color: '#666',
  },

  filterTabTextActive: {
    color: theme.colors.white,
    fontFamily: theme.typography.semiBold,
  },

  listContainer: {
    padding: width * 0.04,
    paddingBottom: height * 0.05,
    flexGrow: 1,
  },

  cardWrapper: {
    marginBottom: height * 0.018,
  },

  orderCard: {
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.large,
    overflow: 'hidden',
    ...theme.elevation.depth2,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: width * 0.04,
    paddingBottom: 0,
  },

  orderNumber: {
    fontFamily: theme.typography.bold,
    fontSize: 16,
    color: theme.colors.dark,
  },

  orderDate: {
    fontFamily: theme.typography.regular,
    fontSize: 13,
    color: theme.colors.gray,
    marginTop: 3,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.medium,
    gap: 6,
  },

  statusText: {
    fontFamily: theme.typography.semiBold,
    fontSize: 12,
    textTransform: 'uppercase',
  },

  productPreview: {
    flexDirection: 'row',
    padding: width * 0.04,
    paddingTop: 12,
    paddingBottom: 16,
  },

  imageContainer: {
    position: 'relative',
  },

  productImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: '#f8f9fa',
  },

  moreBadge: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    backgroundColor: theme.colors.dark,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },

  moreBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: theme.typography.bold,
  },

  infoContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },

  productName: {
    fontFamily: theme.typography.semiBold,
    fontSize: 15,
    color: theme.colors.dark,
    lineHeight: 20,
    marginBottom: 4,
  },

  itemsCount: {
    fontFamily: theme.typography.regular,
    fontSize: 13,
    color: theme.colors.gray,
    marginBottom: 6,
  },

  totalAmount: {
    fontFamily: theme.typography.bold,
    fontSize: 16,
    color: theme.colors.primary,
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: width * 0.04,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },

  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  cancelButtonText: {
    fontFamily: theme.typography.medium,
    fontSize: 13,
    color: theme.colors.dark,
  },

  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.dark,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: theme.borderRadius.medium,
    gap: 6,
  },

  trackButtonText: {
    fontFamily: theme.typography.medium,
    fontSize: 13,
    color: theme.colors.white,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: height * 0.12,
  },

  iconCircle: {
    width: width * 0.35,
    height: width * 0.35,
    borderRadius: (width * 0.35) / 2,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: height * 0.025,
  },

  emptyTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.bold,
    color: theme.colors.dark,
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray,
    textAlign: 'center',
    paddingHorizontal: width * 0.14,
    fontFamily: theme.typography.regular,
    lineHeight: 22,
  },

  btnContainer: {
    marginTop: height * 0.035,
  },
});
