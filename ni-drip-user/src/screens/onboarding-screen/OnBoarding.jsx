import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Dimensions,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../styles/Themes';
import { globalStyles } from '../../styles/GlobalStyles';
import Button from '../../utilities/custom-components/button/Button.utility';

const { width, height } = Dimensions.get('screen');

const ONBOARDING_DATA = [
  {
    id: '1',
    title: 'Choose The Products',
    description:
      'Browse thousands of gadgets, electronics, and accessories. Compare features, explore categories, and pick exactly what you need.',
    animation: require('../../assets/animations/choose-products.json'),
    gradientColors: [
      theme.colors.primary + 'DD',
      theme.colors.secondary + 'BB',
      theme.colors.gray,
    ],
  },
  {
    id: '2',
    title: 'Add favorites Product To Cart',
    description:
      'Add your favorite items to the cart in one tap. Review quantities, manage selections, and get ready to checkout seamlessly.',
    animation: require('../../assets/animations/add-to-cart.json'),
    gradientColors: [
      theme.colors.secondary + 'DD',
      theme.colors.primary + 'BB',
      '#ffffffAA',
    ],
  },
  {
    id: '3',
    title: 'Choose Your Payment Option',
    description:
      'Select from multiple secure payment methods including cards, wallets, and cash on delivery for a smooth checkout experience.',
    animation: require('../../assets/animations/secure-payment.json'),
    gradientColors: [theme.colors.primary + 'DD', '#59c167DD', '#ffffffAA'],
  },
  {
    id: '4',
    title: 'Fastest Shipping',
    description:
      'Get your orders delivered quickly and reliably, safe packaging, and doorstep delivery.',
    animation: require('../../assets/animations/fastest-delivery.json'),
    gradientColors: [
      theme.colors.secondary + 'DD',
      theme.colors.primary + 'DD',
      '#ffffffAA',
    ],
  },
];

const OnBoarding = () => {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      flatListRef.current?.scrollToIndex({
        animated: true,
        index: currentIndex + 1,
      });
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    navigation.replace('Signin');
  };

  const renderItem = ({ item, index }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const lottieTranslateY = scrollXpolate({
      inputRange,
      outputRange: [height * 0.12, 0, -height * 0.12],
      extrapolate: 'clamp',
    });
    const lottieScale = scrollXpolate({
      inputRange,
      outputRange: [0.85, 1.05, 0.85],
      extrapolate: 'clamp',
    });
    const lottieOpacity = scrollXpolate({
      inputRange,
      outputRange: [0.4, 1, 0.4],
      extrapolate: 'clamp',
    });

    const titleTranslateY = scrollXpolate({
      inputRange,
      outputRange: [60, 0, -60],
      extrapolate: 'clamp',
    });
    const titleOpacity = scrollXpolate({
      inputRange,
      outputRange: [0, 1, 0],
      extrapolate: 'clamp',
    });
    const descTranslateY = scrollXpolate({
      inputRange,
      outputRange: [100, 0, -100],
      extrapolate: 'clamp',
    });
    const descOpacity = scrollXpolate({
      inputRange,
      outputRange: [0, 1, 0],
      extrapolate: 'clamp',
    });

    const btnOpacity = scrollXpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: 'clamp',
    });
    const btnScale = scrollXpolate({
      inputRange,
      outputRange: [0.92, 1.05, 0.92],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.slide}>
        <Animated.View
          style={{
            opacity: lottieOpacity,
            transform: [
              { translateY: lottieTranslateY },
              { scale: lottieScale },
            ],
          }}
        >
          <View style={styles.animationContainer}>
            <LottieView
              source={item.animation}
              autoPlay
              loop
              style={styles.lottie}
            />
          </View>
        </Animated.View>

        <Animated.View
          style={{
            opacity: titleOpacity,
            transform: [{ translateY: titleTranslateY }],
          }}
        >
          <Text style={styles.title}>{item.title}</Text>
        </Animated.View>

        <Animated.View
          style={{
            opacity: descOpacity,
            transform: [{ translateY: descTranslateY }],
          }}
        >
          <Text style={styles.description}>{item.description}</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.btnContainer,
            { opacity: btnOpacity, transform: [{ scale: btnScale }] },
          ]}
        >
          {index === ONBOARDING_DATA.length - 1 ? (
            <Button
              title="GET STARTED"
              width={width * 0.9}
              onPress={handleComplete}
              backgroundColor={theme.colors.primary}
              textColor={theme.colors.white}
            />
          ) : (
            <View style={styles.buttonsRow}>
              <Button
                title="SKIP"
                width={width * 0.43}
                onPress={handleComplete}
                backgroundColor={theme.colors.gray}
                textColor={theme.colors.dark}
              />
              <Button
                title="NEXT"
                width={width * 0.43}
                onPress={handleNext}
                backgroundColor={theme.colors.primary}
                textColor={theme.colors.white}
              />
            </View>
          )}
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={globalStyles.container}>
      {ONBOARDING_DATA.map((item, index) => {
        const inputRange = [
          (index - 1) * width,
          index * width,
          (index + 1) * width,
        ];
        const opacity = scrollXpolate({
          inputRange,
          outputRange: [0, 1, 0],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={item.id}
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, { opacity }]}
          >
            <LinearGradient
              colors={item.gradientColors}
              start={{ x: 0.1, y: 0 }}
              end={{ x: 0.9, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        );
      })}

      <LinearGradient
        colors={['rgba(255,255,255,0.15)', 'rgba(0,0,0,0.08)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={styles.backgroundShapes}>
        <View style={styles.circleLargeTopRight} />
      </View>

      <FlatList
        ref={flatListRef}
        data={ONBOARDING_DATA}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        keyExtractor={item => item.id}
      />

      <View style={styles.paginationWrapper}>
        <View style={styles.paginationContainer}>
          {ONBOARDING_DATA.map((_, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];
            const scale = scrollXpolate({
              inputRange,
              outputRange: [1, 1.5, 1],
              extrapolate: 'clamp',
            });
            const bgColor = scrollXpolate({
              inputRange,
              outputRange: [
                theme.colors.gray,
                theme.colors.primary,
                theme.colors.gray,
              ],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  { transform: [{ scale }], backgroundColor: bgColor },
                ]}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default OnBoarding;

const styles = StyleSheet.create({
  slide: {
    width: width * 1,
    height: height * 1,
    alignItems: 'center',
    paddingHorizontal: theme.spacing(4),
  },

  backgroundShapes: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -2,
  },

  animationContainer: {
    height: height * 0.45,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: height * 0.02,
  },

  lottie: {
    width: width * 0.92,
    height: width * 0.92,
  },

  title: {
    fontFamily: theme.typography.semiBold,
    fontSize: theme.typography.fontSize.xxl,
    color: theme.colors.dark,
    textAlign: 'center',
    lineHeight: height * 0.05,
    marginBottom: theme.spacing(3),
    ...theme.elevation.depth2,
  },

  description: {
    fontFamily: theme.typography.regular,
    fontSize: theme.typography.fontSize.sm,
    color: '#444444',
    textAlign: 'center',
    lineHeight: height * 0.03,
    maxWidth: width * 0.85,
  },

  btnContainer: {
    position: 'absolute',
    bottom: height * 0.1,
    width: '100%',
    alignItems: 'center',
  },

  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width * 0.9,
  },

  paginationWrapper: {
    position: 'absolute',
    bottom: height * 0.15,
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dot: {
    width: width * 0.02,
    height: height * 0.01,
    borderRadius: theme.borderRadius.large,
    marginHorizontal: width * 0.02,
  },

  circleLargeTopRight: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: theme.colors.primary + '33',
    top: -100,
    right: -80,
  },
});
