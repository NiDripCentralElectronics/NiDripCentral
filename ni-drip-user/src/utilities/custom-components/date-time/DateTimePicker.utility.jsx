/**
 * Cross-platform Date & Time picker field (iOS spinner + Android modal)
 * Displays a formatted value in a touchable field, shows picker when tapped
 *
 * @param {Object} props
 * @param {string} props.label                  - Field label (e.g. "Event Date & Time")
 * @param {Date} [props.value]                  - Currently selected date/time
 * @param {string} [props.placeholder="Select date & time"]
 * @param {boolean} props.show                  - Controls visibility of the picker (usually managed by parent with useState)
 * @param {() => void} props.onPress            - Called when user taps the field → should set show(true)
 * @param {(event: any, date?: Date) => void} props.onChange - Called when user confirms/cancels picker
 * @param {'date' | 'time' | 'datetime'} [props.mode='datetime']
 * @param {Date} [props.minimumDate]            - Earliest selectable date
 * @param {Date} [props.maximumDate]            - Latest selectable date (added)
 * @param {string} [props.error]                - Error message to show below field
 * @param {string} [props.dateFormat]           - Optional custom format string (uses date-fns format if provided)
 * @param {() => void} [props.onClear]          - Optional callback for clear button (Android/iOS)
 */
import React from 'react';
import {
  View,
  Text,
  TouchableWithoutFeedback,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../../../styles/Themes';

// Optional: better formatting (you can keep toLocaleString or switch to date-fns)
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
    // datetime
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
    return date.toISOString().split('T')[0]; // fallback
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

  // Safe guards for dates
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
    // On Android, clicking Cancel gives event.type = 'dismissed'
    if (Platform.OS === 'android' && event.type === 'dismissed') {
      onChange?.(event, undefined);
      return;
    }

    // On iOS, user can keep changing → we usually call onChange only on confirm
    // But common pattern is to call on every change and let parent decide
    onChange?.(event, selectedDate);
  };

  // Android datetime → show date first, then time after date is picked
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
          themeVariant="light" // or "dark" / "auto" — iOS 14+
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
    fontFamily: theme.typography.inter.medium,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.dark,
    flex: 1,
  },

  valueText: {
    fontFamily: theme.typography.inter.semiBold,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary,
    textAlign: 'right',
    flexShrink: 1,
  },

  placeholderText: {
    color: theme.colors.gray,
    fontFamily: theme.typography.inter.regular,
  },

  errorMessage: {
    marginTop: theme.spacing(0.75),
    marginLeft: theme.spacing(2.5),
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.inter.medium,
  },
});
