/**
 * @file PopOver.jsx
 * @module Components/PopOver
 * @description
 * A floating contextual menu (popover) that dynamically positions itself relative to an anchor element.
 * Automatically adjusts placement based on screen boundaries and available space.
 * Supports custom items with icons, labels, actions, and visual variants (danger, arrow).
 * Features smooth entrance animation and backdrop dismissal.
 */

/**
 * @typedef {Object} PopOverItem
 * @property {string} label - The text displayed for the menu item
 * @property {() => void} [action] - Function executed when the item is pressed
 * @property {string} [icon] - Name of the MaterialCommunityIcons icon to show on the left
 * @property {'default' | 'danger' | 'arrow'} [type] - Visual style: 'danger' for red highlight, 'arrow' for chevron
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';

import { theme } from '../../../styles/Themes';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('screen');

const OFFSET = 8;

const PopOver = ({
  isOpen,
  onClose,
  items = [],
  anchorRef,
  position = 'bottom',
}) => {
  const menuRef = useRef(null);
  const anim = useRef(new Animated.Value(0)).current;

  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    origin: 'top',
  });

  useEffect(() => {
    if (!isOpen || !anchorRef?.current) return;

    anchorRef.current.measureInWindow((x, y, w, h) => {
      const menuWidth = 200;
      const menuHeight = Math.max(items.length * 44 + 16, 80);

      let left = x + w / 2 - menuWidth / 2;
      let top = 0;
      let origin = 'top';

      left = Math.max(16, Math.min(left, width - menuWidth - 16));

      const spaceBelow = height - (y + h);
      const spaceAbove = y;

      if (position === 'bottom') {
        if (spaceBelow >= menuHeight + OFFSET) {
          top = y + h + OFFSET;
          origin = 'top';
        } else if (spaceAbove >= menuHeight + OFFSET) {
          top = y - menuHeight - OFFSET;
          origin = 'bottom';
        } else {
          top = Math.min(y + h + OFFSET, height - menuHeight - OFFSET);
          origin = top > y ? 'top' : 'bottom';
        }
      }

      if (position === 'top') {
        top = y - menuHeight - OFFSET;
        origin = 'bottom';
      }

      if (position === 'left') {
        left = x - menuWidth - OFFSET;
        top = y;
        origin = 'right';
      }

      if (position === 'right') {
        left = x + w + OFFSET;
        top = y;
        origin = 'left';
      }

      setCoords({ top, left, origin });
    });
  }, [isOpen, items, position, anchorRef]);

  useEffect(() => {
    if (!isOpen) return;

    Animated.timing(anim, {
      toValue: 1,
      duration: 120,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  if (!isOpen) return null;

  const translateY = animpolate({
    inputRange: [0, 1],
    outputRange: [6, 0],
  });

  return (
    <Modal transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View
          ref={menuRef}
          style={[
            styles.container,
            {
              top: coords.top,
              left: coords.left,
              opacity: anim,
              transform: [{ translateY }],
            },
          ]}
        >
          {items.map((item, index) => {
            const isDanger = item.type === 'danger';

            return (
              <Pressable
                key={index}
                onPress={() => {
                  item.action?.();
                  onClose();
                }}
                style={({ pressed }) => [
                  styles.item,
                  isDanger && styles.dangerItem,
                  pressed &&
                    (isDanger ? styles.dangerPressed : styles.itemPressed),
                ]}
              >
                <View style={styles.iconWrapper}>
                  {item.icon && (
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={16}
                      color={theme.colors.gray}
                    />
                  )}
                </View>

                <Text style={styles.label}>{item.label}</Text>

                {item.type === 'arrow' && (
                  <MaterialCommunityIcons
                    name="chevron-forward"
                    size={14}
                    color={theme.colors.gray}
                  />
                )}
              </Pressable>
            );
          })}
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export default PopOver;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },

  container: {
    position: 'absolute',
    minWidth: 160,
    padding: theme.spacing(1),
    backgroundColor: theme.colors.dark,
    borderRadius: theme.borderRadius.large,
    ...theme.elevation.depth3,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing(1.2),
    paddingHorizontal: theme.spacing(1.5),
    borderRadius: theme.borderRadius.medium,
  },

  itemPressed: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },

  dangerItem: {
    marginTop: theme.spacing(0.5),
  },

  dangerPressed: {
    backgroundColor: 'rgba(240,2,33,0.5)',
  },

  iconWrapper: {
    width: 24,
    alignItems: 'center',
    marginRight: theme.spacing(1.5),
  },

  label: {
    flex: 1,
    color: theme.colors.white,
    fontFamily: theme.typography.medium,
    fontSize: theme.typography.fontSize.sm,
  },
});
