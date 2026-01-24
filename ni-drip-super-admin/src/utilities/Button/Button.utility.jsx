/**
 * A customizable button component with support for variants, loading states, and icons.
 * * @component
 * @param {Object} props - The properties for the Button component.
 * @param {string} props.title - The text label displayed on the button.
 * @param {function} props.onPress - Event handler for button click events.
 * @param {boolean} [props.loading=false] - If true, displays a loading spinner and hides the label/icon.
 * @param {boolean} [props.disabled=false] - If true, prevents interaction and applies disabled styling.
 * @param {string} [props.variant="btn-primary"] - The visual style variant (e.g., 'btn-primary', 'btn-secondary', 'btn-danger').
 * @param {React.ReactNode} [props.icon] - An optional icon element to display before the text.
 * @param {string|number} [props.width="auto"] - Custom width for the button (CSS value).
 * @param {string|number} [props.height="auto"] - Custom height for the button (CSS value).
 * @param {Object} [props.style] - Inline style overrides for the button container.
 * @param {Object} [props.textStyle] - Inline style overrides for the button's internal label span.
 * * @example
 * <Button
 * title="Save Changes"
 * onPress={handleSave}
 * variant="btn-primary"
 * icon={<SaveIcon />}
 * />
 * * @example
 * <Button title="Submitting..." loading={true} disabled={true} />
 */

import Loader from "../Loader/Loader.utility.jsx";
import "../../styles/global.styles.css";
import "./Button.utility.css";

const Button = ({
  onPress,
  title,
  loading,
  style,
  textStyle,
  width,
  disabled,
  height,
  variant,
  icon,
}) => {
  return (
    <section id="button">
      <button
        className={`custom-button ${variant || "btn-primary"} ${
          disabled ? "disabled" : ""
        }`}
        onClick={onPress}
        style={{
          ...style,
          width: width || "auto",
          height: height || "auto",
        }}
        disabled={disabled}
      >
        {loading ? (
          <Loader loading={loading} size={20} color="#000" />
        ) : (
          <span
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "0.5rem",
              ...textStyle,
            }}
          >
            {icon && <span className="button-icon">{icon}</span>}
            {title}
          </span>
        )}
      </button>
    </section>
  );
};

export default Button;
