/**
 * A versatile form component supporting text inputs, dropdowns, and textareas.
 * * @component
 * @example
 * <InputField
 * label="Username"
 * value={name}
 * onChange={(e) => setName(e.target.value)}
 * icon={<UserIcon />}
 * />
 * * @param {Object} props - Component properties.
 * * @param {string} [props.label] - Floating label text or dropdown placeholder.
 * @param {string|number} [props.value] - Current value for text/textarea inputs.
 * @param {React.ChangeEventHandler} [props.onChange] - Callback triggered on text input change.
 * @param {React.ReactNode} [props.icon] - Optional icon displayed as a prefix inside the input.
 * * @param {string} [props.type="text"] - HTML input type (e.g., 'email', 'tel', 'password').
 * @param {boolean} [props.secureTextEntry=false] - If true, masks input (shorthand for type="password").
 * @param {boolean} [props.multiline=false] - If true, renders a <textarea> instead of an <input>.
 * @param {number} [props.rows=3] - Number of visible text lines for multiline mode.
 * * @param {Array<{value: string, label: string}>} [props.dropdownOptions] - Array of options to render a <select> menu.
 * @param {string} [props.selectedValue] - The currently selected value for the dropdown.
 * @param {React.ChangeEventHandler} [props.onValueChange] - Callback triggered on dropdown selection change.
 * * @param {boolean} [props.editable=true] - If false, the input becomes read-only.
 * @param {boolean} [props.required=false] - If true, applies HTML5 validation attribute.
 * @param {boolean} [props.fullWidth=false] - If true, sets the input element width to 100%.
 * * @param {string|number} [props.width] - Specific width for the outer wrapper container.
 * @param {string} [props.bgColor] - Custom background color for the input field.
 * @param {string} [props.textColor] - Custom color for the input text.
 * @param {React.CSSProperties} [props.style] - Inline style overrides for the outer wrapper.
 * @param {React.CSSProperties} [props.inputStyle] - Inline style overrides specifically for the input/select/textarea.
 * * @returns {React.JSX.Element} The rendered input field container.
 */

import "../../styles/global.styles.css";
import "./InputField.utility.css";

const InputField = ({
  icon,
  value,
  onChange,
  placeholder,
  style,
  inputStyle,
  secureTextEntry,
  editable = true,
  dropdownOptions,
  selectedValue,
  onValueChange,
  bgColor,
  textColor,
  width,
  label,
  type,
  fullWidth = false,
  required = false,
  multiline = false,
  rows = 3,
}) => {
  return (
    <section id="input-field">
      <div
        className="custom-input-wrapper"
        style={{ ...style, width: width || "100%" }}
      >
        {dropdownOptions ? (
          <div className="input-container no-float">
            {icon && <span className="input-icon">{icon}</span>}
            <select
              className="custom-input"
              value={selectedValue}
              onChange={onValueChange}
              required={required}
              style={{
                backgroundColor: bgColor || "var(--white)",
                color: textColor || "var(--dark)",
                width: fullWidth ? "100%" : "auto",
                paddingLeft: icon ? "40px" : undefined,
                ...inputStyle,
              }}
            >
              <option value="" disabled>
                {label || placeholder}
              </option>
              {dropdownOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ) : multiline ? (
          <div className="input-container no-float">
            {icon && <span className="input-icon">{icon}</span>}
            <textarea
              value={value}
              onChange={onChange}
              placeholder={label || placeholder}
              required={required}
              rows={rows}
              className="custom-input"
              readOnly={!editable}
              style={{
                backgroundColor: bgColor || "var(--white)",
                color: textColor || "var(--dark)",
                paddingLeft: icon ? "40px" : undefined,
                ...inputStyle,
              }}
            />
          </div>
        ) : (
          <div className={`input-container ${value ? "has-value" : ""}`}>
            {icon && <span className="input-icon">{icon}</span>}
            <input
              id={label}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              type={type || (secureTextEntry ? "password" : "text")}
              className="custom-input"
              required={required}
              readOnly={!editable}
              style={{
                backgroundColor: bgColor || "var(--white)",
                color: textColor || "var(--dark)",
                paddingLeft: icon ? "40px" : undefined,
                ...inputStyle,
              }}
            />
            <label htmlFor={label} className="floating-label">
              {label}
            </label>
          </div>
        )}
      </div>
    </section>
  );
};

export default InputField;
