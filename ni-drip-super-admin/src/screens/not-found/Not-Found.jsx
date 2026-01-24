/**
 * @file Not-Found.jsx
 * @module Screens/NotFound
 * @description
 * A high-fidelity "404 Not Found" screen designed to gracefully handle routing errors.
 * * **Key Logic:**
 * - **Dynamic Particle Engine:** Generates randomized floating background elements using React state and intervals.
 * - **Navigation Recovery:** Provides multiple escape hatches (Login/Back) to prevent user frustration.
 * - **Lifecycle Management:** Uses cleanup functions to prevent memory leaks from the particle generation interval.
 * * @requires react-router-dom
 * @requires ./Not-Found.css
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Not-Found.css";
import Button from "../../utilities/Button/Button.utility";

const NotFound = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState([]);

  /**
   * Initializes component animations and particle effects
   */
  useEffect(() => {
    setIsVisible(true);
    generateParticles();

    const interval = setInterval(() => {
      generateParticles();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Generates floating particles for background animation
   */
  const generateParticles = () => {
    const newParticles = Array.from({ length: 15 }, (_, index) => ({
      id: Date.now() + index,
      size: Math.random() * 20 + 5,
      left: Math.random() * 100,
      animationDuration: Math.random() * 15 + 10,
      animationDelay: Math.random() * 5,
    }));
    setParticles(newParticles);
  };

  /**
   * Handles navigation back to the login page
   */
  const handleGoToLogin = () => {
    navigate("/");
  };

  /**
   * Handles navigation back to the previous page
   */
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <section id="not-found-container" className={isVisible ? "visible" : ""}>
      <div className="particles-container">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="floating-particle"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.left}%`,
              animationDuration: `${particle.animationDuration}s`,
              animationDelay: `${particle.animationDelay}s`,
            }}
          />
        ))}
      </div>

      <div className="not-found-content">
        <div className="error-code-container">
          <span className="error-digit">4</span>
          <div className="floating-astronaut">👨‍🚀</div>
          <span className="error-digit">4</span>
        </div>

        <h1 className="not-found-title">Page Not Found</h1>

        <p className="not-found-description">
          Oops! It seems you've ventured into unknown space. The page you're
          looking for has either been moved or doesn't exist.
        </p>

        <div className="action-buttons">
          <Button title="Return to Login" onPress={handleGoToLogin} icon="🚀" />
        </div>
      </div>
    </section>
  );
};

export default NotFound;
