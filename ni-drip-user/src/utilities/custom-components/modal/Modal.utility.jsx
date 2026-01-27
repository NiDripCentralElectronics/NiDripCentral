/**
 * @file Modal.jsx
 * @module Components/Modal
 * @description
 * Reusable animated modal dialog component with dark theme aesthetics.
 * Features:
 * - Smooth fade + scale + slight bounce entrance/exit animation
 * - Centered modal with semi-transparent backdrop
 * - Optional title, icon, custom content, and configurable buttons
 * - Support for loading states, disabled buttons, and danger/secondary variants
 * - Backdrop dismissal and optional close (×) button
 * - Responsive sizing based on screen width
 * - Designed especially for confirmation dialogs (e.g. delete product/confirmation flows)
 */

import React, { useEffect, useRef } from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { theme } from '../../../styles/Themes';
import Loader from '../loader/Loader.utility';

const { width, height } = Dimensions.get('screen');

const Modal = ({
  isOpen,
  onClose,
  title = '',
  children,
  buttons = [],
  icon,
  contentStyle,
  closeOnBackdrop = true,
  showCloseButton = true,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.spring(translateYAnim, {
          toValue: 0,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 20,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <RNModal
      visible={isOpen}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={closeOnBackdrop ? onClose : undefined}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalContent,
                {
                  transform: [
                    { scale: scaleAnim },
                    { translateY: translateYAnim },
                  ],
                },
                contentStyle,
              ]}
            >
              <View style={styles.header}>
                {title ? (
                  <Text style={styles.title}>{title}</Text>
                ) : (
                  <View style={{ flex: 1 }} />
                )}
                {showCloseButton && (
                  <TouchableOpacity
                    onPress={onClose}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                    style={styles.closeButton}
                  >
                    <Text style={styles.closeIcon}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.body}>
                {icon && <View style={styles.iconContainer}>{icon}</View>}

                {typeof children === 'string' ? (
                  <Text style={styles.bodyText}>{children}</Text>
                ) : (
                  children
                )}
              </View>

              {buttons.length > 0 && (
                <View style={styles.footer}>
                  {buttons.map((btn, index) => {
                    const variant = btn.variant || 'primary';
                    const isDanger = variant === 'danger';
                    const isSecondary =
                      variant === 'secondary' || variant === 'cancel';

                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={btn.onClick}
                        disabled={btn.loading || btn.disabled}
                        activeOpacity={0.7}
                        style={[
                          styles.button,
                          isSecondary && styles.buttonSecondary,
                          isDanger && styles.buttonDanger,
                          btn.loading && styles.buttonLoading,
                          btn.disabled && styles.buttonDisabled,
                        ]}
                      >
                        {btn.loading ? (
                          <Loader
                            size="small"
                            color={
                              isDanger ? theme.colors.error : theme.colors.white
                            }
                          />
                        ) : (
                          <Text
                            style={[
                              styles.buttonText,
                              isSecondary && styles.buttonTextSecondary,
                              isDanger && styles.buttonTextDanger,
                            ]}
                          >
                            {btn.label}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

export default Modal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    width: width * 0.9,
    maxWidth: width * 0.9,
    borderRadius: theme.borderRadius.large,
    padding: width * 0.05,
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#1E1E1E',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: height * 0.04,
    },
    shadowOpacity: 0.51,
    shadowRadius: 13.16,
    elevation: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: width * 0.04,
  },

  title: {
    fontFamily: theme.typography.bold,
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.white,
    flex: 1,
  },

  closeButton: {
    padding: width * 0.03,
  },

  closeIcon: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '800',
    color: theme.colors.error,
    opacity: 0.8,
  },

  body: {
    marginTop: width * 0.014,
    marginBottom: width * 0.09,
  },

  bodyText: {
    fontFamily: theme.typography.medium,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.gray,
    lineHeight: width * 0.08,
  },

  iconContainer: {
    alignItems: 'center',
    marginBottom: width * 0.02,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.gap(2),
  },

  button: {
    paddingVertical: width * 0.026,
    paddingHorizontal: width * 0.056,
    borderRadius: theme.borderRadius.medium,
    minWidth: width * 0.09,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonSecondary: {
    backgroundColor: '#333333',
  },

  buttonDanger: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.error,
  },

  buttonLoading: {
    opacity: 0.7,
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonText: {
    fontFamily: theme.typography.semiBold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.white,
  },

  buttonTextSecondary: {
    color: theme.colors.white,
  },

  buttonTextDanger: {
    color: theme.colors.error,
  },
});
