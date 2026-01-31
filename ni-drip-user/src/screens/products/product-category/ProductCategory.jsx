/**
 * @component ProductCategory
 * @description A specialized screen that filters and displays products based on a selected category.
 * * * Key Features:
 * - Dynamic Filtering: Uses `useMemo` to efficiently filter the global product state
 * based on category arrays (handling JSON-parsed string inputs).
 * - Grid Layout: Renders products in a two-column responsive grid using `FlatList`.
 * - Empty States: Provides visual feedback using `MaterialCommunityIcons` when no
 * products match the selected category.
 * - Integration: Connects directly to the Redux store for real-time product data.
 * * * @param {Object} props
 * @param {Object} props.route - React Navigation route object.
 * @param {Object} props.route.params - Route parameters.
 * @param {string} props.route.params.category - The category slug/name passed from the previous screen.
 * @param {Object} props.navigation - React Navigation prop used to navigate to "ProductDetails".
 * * @returns {React.JSX.Element}
 */

import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  Dimensions,
  RefreshControl,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useSelector } from 'react-redux';
import { theme } from '../../../styles/Themes';
import Header from '../../../utilities/custom-components/header/header/Header';
import ProductCard from '../../../utilities/custom-components/card/product-card/ProductCard';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

const ProductCategory = ({ route, navigation }) => {
  const { category } = route.params;
  const allProducts = useSelector(state => state.product.products || []);
  const loading = useSelector(state => state.product.loading || false);

  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);

  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => {
      const cats = p.category?.map(c => JSON.parse(c)).flat() || [];
      return cats.includes(category);
    });
  }, [allProducts, category]);

  const EmptyState = () => (
    <Animatable.View
      animation="fadeIn"
      duration={800}
      style={styles.emptyContainer}
    >
      <Animatable.View
        animation="pulse"
        iterationCount="infinite"
        duration={2000}
        easing="ease-out"
      >
        <MaterialCommunityIcons
          name="package-variant-closed"
          size={120}
          color="#CBD5E1"
        />
      </Animatable.View>
      <Text style={styles.emptyTitle}>No products in {categoryTitle}</Text>
      <Text style={styles.emptySubtitle}>
        Check back later or explore other categories
      </Text>
      <Animatable.View animation="fadeInUp" delay={400} duration={600}>
        <Text style={styles.emptyHint}>New arrivals are added daily!</Text>
      </Animatable.View>
    </Animatable.View>
  );

  const renderProduct = ({ item, index }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 80}
      duration={600}
      easing="ease-out-cubic"
    >
      <ProductCard
        product={item}
        onPress={() => {
          console.log(item);
          navigation.navigate('Product_Details', { product: item });
        }}
      />
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      <Header
        logo={require('../../../assets/logo/logo.png')}
        title={categoryTitle}
      />

      <FlatList
        data={filteredProducts}
        keyExtractor={item => item._id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => {}}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        renderItem={renderProduct}
        ListEmptyComponent={<EmptyState />}
      />
    </View>
  );
};

export default ProductCategory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  list: {
    paddingHorizontal: width * 0.02,
    paddingTop: height * 0.025,
    paddingBottom: height * 0.08,
  },

  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: height * 0.02,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.1,
    marginTop: -height * 0.1,
  },

  emptyTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.fontFamilyBold,
    color: '#1E293B',
    marginTop: height * 0.03,
    textAlign: 'center',
  },

  emptySubtitle: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamilyMedium,
    color: '#64748B',
    marginTop: height * 0.015,
    textAlign: 'center',
    lineHeight: 24,
  },

  emptyHint: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamilySemiBold,
    color: theme.colors.primary,
    marginTop: height * 0.04,
    textAlign: 'center',
    paddingHorizontal: width * 0.1,
  },
});
