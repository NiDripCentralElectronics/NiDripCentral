/**
 * A lightweight, animated circular spinner used for indicating background tasks.
 * * @component
 * @description
 * Renders a centered loading animation. Best used within buttons,
 * cards, or full-page overlays during data fetching or form submissions.
 * * @example
 * // Displaying the loader conditionally
 * {loading && <Loader />}
 * * @returns {React.JSX.Element} A section containing a centered animated spinner.
 */

import "../../styles/global.styles.css";
import "./Loader.utility.css";

const Loader = () => {
  return (
    <section id="loader">
      <div className="custom-loader-container">
        <div className="custom-loader"></div>
      </div>
    </section>
  );
};

export default Loader;
