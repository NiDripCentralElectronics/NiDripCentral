/**
 * @file DateTimePicker.jsx
 * @module Components/DateTimePicker
 * @description
 * Cross-platform date & time picker input field with consistent look & feel.
 *
 * Features:
 * - Touchable field showing formatted selected value or placeholder
 * - iOS: native spinner style inside the modal
 * - Android: native modal picker (date → time sequence for datetime mode)
 * - Unified styling matching app theme (borders, colors, typography, elevation)
 * - Supports date / time / datetime modes
 * - Minimum & maximum date constraints
 * - Error message display below field
 * - Safe date handling with fallback to current date
 * - Clean placeholder behavior and accent color integration
 */

import React from 'react';
import { View, Text, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../../../styles/Themes';

const formatDateTime = (date, mode = 'datetime') => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }

  try {
    if (mode === 'date') {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    if (mode === 'time') {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch (err) {
    console.warn('Date formatting failed:', err);
    return date.toISOString().split('T')[0];
  }
};

export const DateTimePicker = ({
  label,
  value,
  placeholder = 'Select date & time',
  show,
  onPress,
  onChange,
  mode = 'datetime',
  minimumDate,
  maximumDate,
  error,
  dateFormat,
}) => {
  const formattedValue = formatDateTime(value, mode);

  const safeValue =
    value instanceof Date && !isNaN(value.getTime()) ? value : new Date();
  const safeMinDate =
    minimumDate instanceof Date && !isNaN(minimumDate.getTime())
      ? minimumDate
      : undefined;
  const safeMaxDate =
    maximumDate instanceof Date && !isNaN(maximumDate.getTime())
      ? maximumDate
      : undefined;

  const handleChange = (event, selectedDate) => {
    if (Platform.OS === 'android' && event.type === 'dismissed') {
      onChange?.(event, undefined);
      return;
    }

    onChange?.(event, selectedDate);
  };

  const androidMode = mode === 'datetime' ? 'date' : mode;

  return (
    <View style={styles.wrapper}>
      <TouchableWithoutFeedback onPress={onPress}>
        <View style={[styles.container, error && styles.containerError]}>
          <Text style={styles.label}>{label}</Text>

          <Text
            style={[
              styles.valueText,
              !formattedValue && styles.placeholderText,
            ]}
          >
            {formattedValue || placeholder}
          </Text>
        </View>
      </TouchableWithoutFeedback>

      {show && (
        <DateTimePicker
          value={safeValue}
          mode={
            Platform.OS === 'android' && mode === 'datetime'
              ? androidMode
              : mode
          }
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          minimumDate={safeMinDate}
          maximumDate={safeMaxDate}
          accentColor={theme.colors.primary}
          neutralButtonLabel={Platform.OS === 'android' ? 'Cancel' : undefined}
          positiveButton={{ label: 'OK', textColor: theme.colors.primary }}
          negativeButton={{ label: 'Cancel', textColor: theme.colors.gray }}
          themeVariant="light"
        />
      )}

      {error && <Text style={styles.errorMessage}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: theme.spacing(2),
  },

  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderWidth: 1.5,
    borderColor: theme.colors.gray,
    borderRadius: theme.borderRadius.medium,
    paddingHorizontal: theme.spacing(2.5),
    paddingVertical: theme.spacing(2),
    minHeight: 56,
    ...theme.elevation.depth1,
  },

  containerError: {
    borderColor: theme.colors.error,
    borderWidth: 2,
  },

  label: {
    fontFamily: theme.typography.medium,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.dark,
    flex: 1,
  },

  valueText: {
    fontFamily: theme.typography.semiBold,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary,
    textAlign: 'right',
    flexShrink: 1,
  },

  placeholderText: {
    color: theme.colors.gray,
    fontFamily: theme.typography.regular,
  },

  errorMessage: {
    marginTop: theme.spacing(0.75),
    marginLeft: theme.spacing(2.5),
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.medium,
  },
});
