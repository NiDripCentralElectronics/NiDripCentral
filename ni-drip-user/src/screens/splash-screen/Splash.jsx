/**
 * @file Splash.jsx
 * @module Components/Splash
 * @description
 * Premium cinematic splash screen for NI DRIP CENTRAL (2026 edition).
 *
 * Delivers an immersive launch experience with:
 * - Multi-layer animated gradient background
 * - Atmospheric glowing orbs with slow pulsing animation
 * - Physics-inspired logo entrance (scale, bounce, rotation)
 * - Persistent gentle floating idle animation on logo
 * - Staggered text reveal sequence: gradient line separator → tagline
 * - Full theme integration using brand primary/secondary colors
 * - Status bar customization for light-content appearance
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar, Dimensions, Text } from 'react-native';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../../styles/Themes';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('screen');

const Splash = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor('transparent');
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 4500));

        const token = await AsyncStorage.getItem('authToken');
        console.log(token);

        if (token) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'OnBoarding' }],
          });
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    checkSession();
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

        <View style={styles.textWrapper}>
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

          <Animatable.Text
            animation="fadeInUp"
            duration={1400}
            delay={2800}
            easing="ease-out-quint"
            style={styles.tagline}
          >
            ELECTRONICS & APPLIANCES
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
    top: width * 0.1,
    left: -width * 0.3,
    width: width * 1.4,
    height: width * 1.4,
    borderRadius: width * 0.7,
    backgroundColor: '#ffffff18',
  },

  glow2: {
    position: 'absolute',
    bottom: -width * 0.4,
    right: -width * 0.2,
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
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
    width: width * 0.65,
    height: width * 0.45,
  },

  textWrapper: { alignItems: 'center' },

  separatorContainer: {
    overflow: 'hidden',
    borderRadius: theme.borderRadius.large,
    marginVertical: theme.spacing(3),
  },

  separator: {
    height: width * 0.01,
    width: width * 0.5,
  },

  tagline: {
    fontFamily: theme.typography.medium,
    fontSize: theme.typography.fontSize.lg,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: width * 0.02,
    textAlign: 'center',
  },
});
