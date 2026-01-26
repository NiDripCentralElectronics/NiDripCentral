/**
 * Reusable Input Field component
 * Supports both normal TextInput and Dropdown (DropDownPicker)
 *
 * @param {Object} props
 * @param {string} [props.value]               - Value for TextInput
 * @param {(text: string) => void} [props.onChangeText] - Text change handler
 * @param {string} [props.placeholder]         - Placeholder text
 * @param {ViewStyle} [props.style]            - Container style
 * @param {ViewStyle|TextStyle} [props.inputStyle] - Input/Dropdown style override
 * @param {boolean} [props.secureTextEntry=false]
 * @param {boolean} [props.editable=true]
 * @param {('default'|'number-pad'|'decimal-pad'|'numeric'|'email-address'|'phone-pad')} [props.keyboardType]
 * @param {boolean} [props.multiline=false]
 * @param {React.ReactNode} [props.leftIcon]   - Icon/component on left side
 * @param {React.ReactNode} [props.rightIcon]  - Icon/component on right side (usually eye / clear)
 * @param {() => void} [props.onRightIconPress]
 *
 * === Dropdown specific props ===
 * @param {Array<{label: string, value: any}>} [props.dropdownOptions] - items for dropdown
 * @param {any} [props.selectedValue]          - currently selected value
 * @param {(value: any) => void} [props.onValueChange] - dropdown change handler
 */
import React, { useState } from 'react';
import {
  TextInput,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { theme } from '../../../styles/Themes';
import { globalStyles } from '../../../styles/GlobalStyles';

const { width } = Dimensions.get('screen');

const InputField = ({
  value,
  onChangeText,
  placeholder = '',
  style,
  inputStyle,
  secureTextEntry = false,
  editable = true,
  keyboardType = 'default',
  multiline = false,

  // Icons
  leftIcon,
  rightIcon,
  onRightIconPress,

  // ── Dropdown Props ──
  dropdownOptions,
  selectedValue,
  onValueChange,
}) => {
  const [open, setOpen] = useState(false);

  const isDropdown = !!dropdownOptions;

  // Common container style
  const containerStyle = [globalStyles.inputContainer, style];

  if (isDropdown) {
    return (
      <View style={containerStyle}>
        <DropDownPicker
          open={open}
          value={selectedValue}
          items={dropdownOptions}
          setOpen={setOpen}
          setValue={onValueChange}
          placeholder={placeholder}
          listMode="MODAL"
          modalProps={{ animationType: 'fade' }}
          zIndex={1000}
          // ── Styles ──
          style={[styles.dropdownMain, inputStyle]}
          dropDownContainerStyle={[styles.dropdownList, inputStyle]}
          textStyle={styles.dropdownText}
          placeholderStyle={styles.dropdownPlaceholder}
          listItemLabelStyle={styles.dropdownItemText}
          selectedItemLabelStyle={{ color: theme.colors.primary }}
        />
      </View>
    );
  }

  // Normal TextInput version
  return (
    <View style={containerStyle}>
      <View
        style={[styles.inputWrapper, { borderColor: theme.colors.primary }]}
      >
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.gray}
          secureTextEntry={secureTextEntry}
          editable={editable}
          keyboardType={keyboardType}
          multiline={multiline}
          style={[
            globalStyles.input,
            styles.textInput,
            multiline && styles.multiline,
            leftIcon && styles.withLeftIcon,
            rightIcon && styles.withRightIcon,
            inputStyle,
          ]}
        />

        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={onRightIconPress}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default InputField;

// ────────────────────────────────────────────────
// Styles
// ────────────────────────────────────────────────
const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: theme.borderRadius.large,
    backgroundColor: theme.colors.white,
    overflow: 'hidden',
  },

  textInput: {
    flex: 1,
    paddingHorizontal: width * 0.04,
    fontFamily: theme.typography.inter.medium,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.dark,
  },

  multiline: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingVertical: 14,
  },

  withLeftIcon: {
    paddingLeft: width * 0.12,
  },

  withRightIcon: {
    paddingRight: width * 0.12,
  },

  leftIconContainer: {
    position: 'absolute',
    left: width * 0.035,
    zIndex: 1,
  },

  rightIconContainer: {
    position: 'absolute',
    right: width * 0.02,
    padding: 10,
  },

  // ── Dropdown Styles ──
  dropdownMain: {
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.large,
    backgroundColor: theme.colors.white,
    minHeight: 54,
  },

  dropdownList: {
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.large,
    backgroundColor: theme.colors.white,
  },

  dropdownText: {
    fontFamily: theme.typography.inter.regular,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.dark,
  },

  dropdownPlaceholder: {
    color: theme.colors.gray,
    fontFamily: theme.typography.inter.regular,
  },

  dropdownItemText: {
    fontFamily: theme.typography.inter.regular,
    color: theme.colors.dark,
  },
});
