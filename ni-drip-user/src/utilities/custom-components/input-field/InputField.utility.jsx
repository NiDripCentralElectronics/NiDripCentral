/**
 * @file InputField.jsx
 * @module Components/InputField
 * @description
 * Reusable, theme-consistent input field component that supports:
 * - Standard TextInput (single-line or multiline)
 * - Password fields with secure text toggle
 * - Dropdown picker using react-native-dropdown-picker
 *
 * Features:
 * - Unified styling with app theme (borders, colors, typography)
 * - Optional left & right icons (e.g., eye for password visibility, clear button)
 * - Responsive padding & sizing based on screen width
 * - Multiline support with proper text alignment
 * - Dropdown in modal mode with smooth fade animation
 * - Consistent look & feel across both input types
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
  leftIcon,
  rightIcon,
  onRightIconPress,
  dropdownOptions,
  selectedValue,
  onValueChange,
}) => {
  const [open, setOpen] = useState(false);

  const isDropdown = !!dropdownOptions;

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
    fontFamily: theme.typography.medium,
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
    fontFamily: theme.typography.regular,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.dark,
  },

  dropdownPlaceholder: {
    color: theme.colors.gray,
    fontFamily: theme.typography.regular,
  },

  dropdownItemText: {
    fontFamily: theme.typography.regular,
    color: theme.colors.dark,
  },
});
