/**
 * @file Splash.jsx
 * @module components/Splash
 * @description
 * NI DRIP CENTRAL: Ultra-Premium Cinematic Splash Screen (2026 Edition).
 * * This component provides a high-fidelity visual experience during application launch:
 * - **Background Layering**: Implements a deep multi-tone gradient with dynamic, pulsing atmospheric glowing orbs for visual depth.
 * - **Logo Choreography**: Features a physics-based "Epic Entrance" (scale, rotation, and translation) followed by a persistent floating idle animation.
 * - **Staggered Typography**: Utilizes a synchronized reveal sequence including a center-out gradient line reveal, followed by the tagline and brand title.
 * - **Theme Integration**: Custom electronics-inspired palette using primary and secondary brand colors.
 * * @component
 * @returns {JSX.Element} The rendered animated splash screen view.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar, Dimensions, Text } from 'react-native';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../../styles/Themes';

const { width: SCREEN_WIDTH } = Dimensions.get('screen');

const Splash = () => {
  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor('transparent');
  }, []);

  Animatable.initializeRegistryWithDefinitions({
    epicEntrance: {
      0: {
        opacity: 0,
        scale: 0.3,
        translateY: 100,
        rotate: '-12deg',
      },
      0.6: {
        opacity: 0.8,
        scale: 1.15,
        translateY: -20,
        rotate: '4deg',
      },
      1: {
        opacity: 1,
        scale: 1,
        translateY: 0,
        rotate: '0deg',
      },
    },
    glowPulse: {
      0: { opacity: 0.3, scale: 1 },
      0.5: { opacity: 0.8, scale: 1.2 },
      1: { opacity: 0.3, scale: 1 },
    },
    lineReveal: {
      from: { scaleX: 0, opacity: 0 },
      to: { scaleX: 1, opacity: 1 },
    },
  });

  return (
    <View style={styles.container}>
      {/* Deep gradient background with subtle shift */}
      <Animatable.View
        animation="fadeIn"
        duration={3000}
        style={StyleSheet.absoluteFill}
      >
        <LinearGradient
          colors={[theme.colors.primary, '#1a0d3d', theme.colors.secondary]}
          start={{ x: 0.4, y: 0 }}
          end={{ x: 0.6, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animatable.View>

      {/* Multiple layered glowing orbs for depth */}
      <Animatable.View
        animation="glowPulse"
        iterationCount="infinite"
        duration={7000}
        style={[styles.glow1]}
      />
      <Animatable.View
        animation="glowPulse"
        iterationCount="infinite"
        duration={9000}
        delay={2000}
        style={[styles.glow2]}
      />

      <View style={styles.content}>
        {/* Main Logo - Epic Entrance */}
        <Animatable.View
          animation="epicEntrance"
          duration={2400}
          easing="ease-out-quint"
          style={styles.logoContainer}
        >
          <Animatable.Image
            animation="fadeIn"
            delay={800}
            duration={2000}
            source={require('../../assets/logo/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Subtle floating after entrance */}
          <Animatable.View
            animation={{
              0: { translateY: 0 },
              0.5: { translateY: -12 },
              1: { translateY: 0 },
            }}
            iterationCount="infinite"
            duration={8000}
            easing="ease-in-out"
            style={StyleSheet.absoluteFill}
          />
        </Animatable.View>

        {/* Text Section - Staggered Luxury Reveal */}
        <View style={styles.textWrapper}>
          {/* Gradient Line Reveal */}
          <Animatable.View
            animation="lineReveal"
            duration={1200}
            delay={2200}
            easing="ease-out-back"
            style={styles.separatorContainer}
          >
            <LinearGradient
              colors={[
                'transparent',
                theme.colors.primary,
                theme.colors.secondary,
                theme.colors.primary,
                'transparent',
              ]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.separator}
            />
          </Animatable.View>

          {/* Tagline - Slow dramatic fade up */}
          <Animatable.Text
            animation="fadeInUp"
            duration={1400}
            delay={2800}
            easing="ease-out-quint"
            style={styles.tagline}
          >
            ELECTRONICS & APPLIANCES
          </Animatable.Text>

          {/* Brand Name - Final powerful reveal */}
          <Animatable.Text
            animation="fadeIn"
            duration={1600}
            delay={3600}
            useNativeDriver
            style={styles.brandName}
          >
            NI DRIP CENTRAL
          </Animatable.Text>
        </View>
      </View>
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: { flex: 1 },

  glow1: {
    position: 'absolute',
    top: SCREEN_WIDTH * 0.1,
    left: -SCREEN_WIDTH * 0.3,
    width: SCREEN_WIDTH * 1.4,
    height: SCREEN_WIDTH * 1.4,
    borderRadius: SCREEN_WIDTH * 0.7,
    backgroundColor: '#ffffff18',
  },

  glow2: {
    position: 'absolute',
    bottom: -SCREEN_WIDTH * 0.4,
    right: -SCREEN_WIDTH * 0.2,
    width: SCREEN_WIDTH * 1.2,
    height: SCREEN_WIDTH * 1.2,
    borderRadius: SCREEN_WIDTH * 0.6,
    backgroundColor: theme.colors.primary + '30',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoContainer: {
    marginBottom: theme.spacing(5),
  },

  logo: {
    width: SCREEN_WIDTH * 0.65,
    height: SCREEN_WIDTH * 0.45,
  },

  textWrapper: { alignItems: 'center' },

  separatorContainer: {
    overflow: 'hidden',
    borderRadius: theme.borderRadius.large,
    marginVertical: theme.spacing(3),
  },

  separator: {
    height: SCREEN_WIDTH * 0.01,
    width: SCREEN_WIDTH * 0.5,
  },

  tagline: {
    fontFamily: theme.typography.inter.medium,
    fontSize: theme.typography.fontSize.lg,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: SCREEN_WIDTH * 0.02,
    textAlign: 'center',
  },

  brandName: {
    marginTop: theme.spacing(4),
    fontFamily: theme.typography.inter.bold,
    fontSize: theme.typography.fontSize['2xl'],
    color: theme.colors.white,
    letterSpacing: SCREEN_WIDTH * 0.01,
    textShadowColor: theme.colors.primary + '60',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
});
