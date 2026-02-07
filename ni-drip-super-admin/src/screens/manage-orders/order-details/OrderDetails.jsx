/**
 * @file OrderDetails.jsx
 * @module Screens/Orders/Details
 * @description
 * An immersive and professional detail view for a specific order, emphasizing clarity, elegance, and comprehensive information display.
 * **Visual Architecture:**
 * - **Header Banner:** Features a sophisticated back navigation with order ID prominently displayed, using subtle gradients for depth.
 * - **Order Summary Grid:** Employs a refined two-column layout with sticky visuals for product imagery (if applicable) and a flowing content column for details.
 * - **Bento-style Metrics:** Curates key order insights (Total, Status, Payment) into an aesthetically pleasing, color-harmonized grid for intuitive scanning.
 * - **Itemized Breakdown:** Presents order items in a clean, expandable card format with thumbnails, quantities, and subtotals for enhanced readability.
 * - **Timeline Visualization:** Integrates a elegant status timeline to track order progression visually.
 * **Technical Logic:**
 * - **State Hydration:** Leverages `location.state` for efficient data passing, minimizing redundant API fetches.
 * - **Simulated Latency:** Incorporates an 800ms delay via `setTimeout` to synchronize with global loading animations for a polished UX.
 * - **Dynamic Rendering:** Handles multiple items gracefully, with responsive adjustments for varying screen sizes.
 * @requires react-router-dom
 */

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../../../utilities/loader/Loader.utility";
import "./OrderDetails.css";

const OrderDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("");

  console.log("ORDER", order);

  useEffect(() => {
    const timer = setTimeout(() => {
      const data = location.state?.order || null;
      setOrder(data);
      if (
        data?.items?.length > 0 &&
        data.items[0]?.product?.productImages?.length > 0
      ) {
        setActiveImage(data.items[0].product.productImages[0]);
      }
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [location.state]);

  if (loading)
    return (
      <div className="od-loader-wrapper">
        <Loader />
      </div>
    );

  if (!order)
    return (
      <div id="order-details-screen" className="od-not-found">
        <h3>Order Not Found</h3>
        <button onClick={() => navigate(-1)}>Return to Orders</button>
      </div>
    );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-GB", {
      day: "numeric",
      year: "numeric",
      month: "long",
    });
  };

  const formatPhone = (phone) => {
    if (!phone) return "Not Provided";
    return `${phone.countryCode} ${phone.phoneNumber}`;
  };

  return (
    <section id="order-details-screen">
      <div className="od-header-banner">
        <button className="back-nav" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left"></i> Back to Orders
        </button>
        <div className="header-content">
          <h1 className="order-main-title">
            Order #{order._id.slice(-6).toUpperCase()}
          </h1>
          <span className={`od-status-pill ${order.status.toLowerCase()}`}>
            {order.status}
          </span>
        </div>
      </div>

      <div className="od-main-grid">
        <div className="od-visuals">
          {order.items?.length > 0 && (
            <>
              <div className="od-main-card">
                <img
                  src={activeImage}
                  alt="Main Item"
                  className="od-hero-img"
                />
              </div>
              <div className="od-thumbnails">
                {order.items[0]?.product?.productImages?.map((img, idx) => (
                  <div
                    key={idx}
                    className={`od-thumb ${activeImage === img ? "active" : ""}`}
                    onClick={() => setActiveImage(img)}
                  >
                    <img src={img} alt="thumbnail" />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="od-content">
          <div className="od-section">
            <h2 className="section-title">Order Overview</h2>
            <div className="metrics-grid">
              <div className="metric-item color1">
                <label>Total Amount</label>
                <span className="price-text">${order.totalAmount}</span>
              </div>
              <div className="metric-item color2">
                <label>Payment Status</label>
                <span>{order.paymentStatus}</span>
              </div>
              <div className="metric-item color3">
                <label>Payment Method</label>
                <span>{order.paymentMethod.replace(/_/g, " ")}</span>
              </div>
              <div className="metric-item color4">
                <label>Shipping Cost</label>
                <span>${order.shippingCost}</span>
              </div>
            </div>
          </div>

          <div className="od-section">
            <h2 className="section-title">Customer Information</h2>
            <div className="info-box">
              <div className="info-row">
                <small>Name</small>
                <p>{order.user.userName}</p>
              </div>
              <div className="info-row">
                <small>Email</small>
                <p>{order.user.email}</p>
              </div>
              <div className="info-row">
                <small>Phone</small>
                <p>{formatPhone(order.user.phone)}</p>
              </div>
              <div className="info-row">
                <small>Shipping Address</small>
                <p>{order.shippingAddress}</p>
              </div>
            </div>
          </div>

          <div className="od-section">
            <h2 className="section-title">Order Items</h2>
            <div className="items-container">
              {order.items?.map((item, idx) => (
                <div className="item-card" key={idx}>
                  <img
                    src={item.product.productImages[0]}
                    alt={item.product.title}
                    className="item-thumb"
                  />
                  <div className="item-details">
                    <h3>{item.product.title}</h3>
                    <p>Quantity: {item.quantity}</p>
                    <p>Price: ${item.priceAtPurchase}</p>
                    <p>Subtotal: ${item.quantity * item.priceAtPurchase}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="od-section">
            <h2 className="section-title">Order Timeline</h2>
            <div className="timeline-box">
              <div className="timeline-item">
                <small>Place At</small>
                <p>{formatDate(order.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrderDetails;
