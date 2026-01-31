/**
 * @file Orders.jsx
 * @module Screens/Orders/Management
 * @description
 * A comprehensive administrative dashboard for monitoring and managing customer order lifecycles.
 * * **Visual Architecture:**
 * - **KPI Stats Grid:** A top-level summary row using color-coded cards to display real-time counts of PENDING, SHIPPED, and DELIVERED orders.
 * - **Actionable Data Table:** A dense, responsive grid featuring contextual `PopOver` menus for each row to keep the UI clean while providing deep-link actions.
 * - **Workflow Modals:** Controlled confirmation overlays that manage state transitions for both Order and Payment statuses.
 * * **Technical Logic:**
 * - **Redux Integration:** Dispatches `getAllOrders` on mount and utilizes `updateOrderStatus` for persistent state changes.
 * - **State Machine Logic:** Implements `getNextOrderStatus` and `getNextPaymentStatus` to enforce a strictly sequential workflow (e.g., Pending -> Processing -> Shipped).
 * - **Client-Side Search:** Real-time filtering engine that scans Order IDs and Customer Usernames without additional API overhead.
 * - **Dynamic Anchor Positioning:** Uses `useRef` mapping (`actionButtonRefs`) to precisely anchor popover menus to specific table rows.
 * * @requires react-redux
 * @requires react-router-dom
 * @requires toast-notifications
 */

import React, { useState, useEffect, useRef } from "react";
import "./Orders.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} from "../../../redux/slices/order.slice";
import Loader from "../../../utilities/loader/Loader.utility";
import PopOver from "../../../utilities/pop-over/PopOver.utility";
import InputField from "../../../utilities/input-field/InputField.utility";
import Modal from "../../../utilities/modal/Modal.utlity";
import { toast } from "react-hot-toast";

const Orders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const actionButtonRefs = useRef({});
  const [search, setSearch] = useState("");
  const user = useSelector((state) => state.auth.user);
  const orders = useSelector((state) => state.orders.allOrders || []);
  const loading = useSelector((state) => state.orders.loading);
  const [activePopover, setActivePopover] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState(false);

  const [isOrderStatusModalOpen, setIsOrderStatusModalOpen] = useState(false);
  const [isPaymentStatusModalOpen, setIsPaymentStatusModalOpen] =
    useState(false);
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState(false);
  const [updatingPaymentStatus, setUpdatingPaymentStatus] = useState(false);

  useEffect(() => {
    if (user?.id) {
      dispatch(getAllOrders());
    }
  }, [dispatch, user?.id]);

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "PENDING").length,
    processing: orders.filter((o) => o.status === "PROCESSING").length,
    shipped: orders.filter((o) => o.status === "SHIPPED").length,
    delivered: orders.filter((o) => o.status === "DELIVERED").length,
    refunded: orders.filter((o) => o.status === "REFUNDED").length,
  };

  const filteredOrders = orders.filter(
    (order) =>
      order._id?.toLowerCase().includes(search.toLowerCase()) ||
      order?.user?.userName?.toLowerCase().includes(search.toLowerCase()),
  );

  const getNextOrderStatus = (currentStatus) => {
    const flow = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "REFUNDED"];
    const index = flow.indexOf(currentStatus);
    return index >= 0 && index < flow.length - 1 ? flow[index + 1] : null;
  };

  const getNextPaymentStatus = (currentPaymentStatus) => {
    const flow = ["PENDING", "PAID", "REFUNDED"];
    const index = flow.indexOf(currentPaymentStatus);
    return index >= 0 && index < flow.length - 1 ? flow[index + 1] : null;
  };

  const nextOrderStatus = selectedOrder
    ? getNextOrderStatus(selectedOrder.status)
    : null;
  const nextPaymentStatus = selectedOrder
    ? getNextPaymentStatus(selectedOrder.paymentStatus)
    : null;

  const handleOpenOrderStatusModal = (order) => {
    setSelectedOrder(order);
    setIsOrderStatusModalOpen(true);
    setActivePopover(null);
  };

  const handleOpenPaymentModal = (order) => {
    setSelectedOrder(order);
    setIsPaymentStatusModalOpen(true);
    setActivePopover(null);
  };

  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder) return;
    const nextStatus = getNextOrderStatus(selectedOrder.status);
    if (!nextStatus) return;
    setUpdatingOrderStatus(true);
    try {
      const result = await dispatch(
        updateOrderStatus({
          orderId: selectedOrder._id,
          status: nextStatus,
        }),
      );
      if (updateOrderStatus.fulfilled.match(result)) {
        toast.success(
          result.payload?.message || `Status updated to ${nextStatus}`,
        );
        setIsOrderStatusModalOpen(false);
        setSelectedOrder(null);
      } else {
        toast.error(result.payload?.message || "Failed to update order status");
      }
    } catch (error) {
      toast.error("Unexpected error occurred");
    } finally {
      setUpdatingOrderStatus(false);
    }
  };

  const handleUpdatePaymentStatus = async () => {
    if (!selectedOrder) return;
    const nextPayment = getNextPaymentStatus(selectedOrder.paymentStatus);
    if (!nextPayment) return;
    setUpdatingPaymentStatus(true);
    try {
      const result = await dispatch(
        updateOrderStatus({
          orderId: selectedOrder._id,
          paymentStatus: nextPayment,
        }),
      );
      if (updateOrderStatus.fulfilled.match(result)) {
        toast.success(
          result.payload?.message || `Payment status updated to ${nextPayment}`,
        );
        setIsPaymentStatusModalOpen(false);
        setSelectedOrder(null);
      } else {
        toast.error(
          result.payload?.message || "Failed to update payment status",
        );
      }
    } catch (error) {
      toast.error("Unexpected error occurred");
    } finally {
      setUpdatingPaymentStatus(false);
    }
  };

  const getActionItems = (order) => {
    const items = [];

    items.push({
      label: "View Details",
      icon: "fas fa-eye",
      action: () =>
        navigate(
          `/super-admin/orders/manage-orders/order-details/${order._id}`,
          {
            state: { order },
          },
        ),
    });

    if (order.status !== "DELIVERED" && order.status !== "REFUNDED") {
      items.push({
        label: "Change Order Status",
        icon: "fas fa-sync",
        action: () => handleOpenOrderStatusModal(order),
      });
    }
    if (order.paymentStatus !== "PAID" && order.paymentStatus !== "REFUNDED") {
      items.push({
        label: "Update Payment Status",
        icon: "fas fa-credit-card",
        action: () => handleOpenPaymentModal(order),
      });
    }

    items.push({
      label: "Delete Order",
      icon: "fas fa-trash",
      type: "danger",
      action: () => {
        setSelectedOrder(order);
        setIsDeleteModalOpen(true);
        setActivePopover(null);
      },
    });
    return items;
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;

    setDeletingOrder(true);
    try {
      const result = await dispatch(deleteOrder(selectedOrder._id));

      if (deleteOrder.fulfilled.match(result)) {
        toast.success(result.payload?.message);
        setIsDeleteModalOpen(false);
        setSelectedOrder(null);
      } else {
        toast.error(result.payload?.message || "Failed to delete order");
      }
    } catch (error) {
      toast.error("An unexpected error occurred during deletion");
    } finally {
      setDeletingOrder(false);
    }
  };

  const getStatusClass = (status) => {
    switch ((status || "").toLowerCase()) {
      case "pending":
        return "status-pending";
      case "processing":
        return "status-processing";
      case "shipped":
        return "status-shipped";
      case "delivered":
        return "status-delivered";
      case "refunded":
        return "status-refunded";
      default:
        return "";
    }
  };

  return (
    <section id="orders">
      <div className="orders-container">
        <div className="orders-breadcrumb">
          <div className="orders-header-text">
            <h1 className="orders-title">Orders</h1>
            <p className="orders-subtitle">
              Manage and track all customer orders
            </p>
          </div>
          <div className="search-wrapper">
            <InputField
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              width={450}
              icon={<i className="fas fa-search"></i>}
            />
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card stat-total">
            <h3>Total Orders</h3>
            <p className="stat-value">{stats.total.toLocaleString()}</p>
          </div>
          <div className="stat-card stat-pending">
            <h3>Pending</h3>
            <p className="stat-value">{stats.pending || 0}</p>
          </div>
          <div className="stat-card stat-processing">
            <h3>Processing</h3>
            <p className="stat-value">{stats.processing || 0}</p>
          </div>
          <div className="stat-card stat-shipped">
            <h3>Shipped</h3>
            <p className="stat-value">{stats.shipped || 0}</p>
          </div>
          <div className="stat-card stat-delivered">
            <h3>Delivered</h3>
            <p className="stat-value">{stats.delivered || 0}</p>
          </div>
          <div className="stat-card stat-refunded">
            <h3>Refunded</h3>
            <p className="stat-value">{stats.refunded || 0}</p>
          </div>
        </div>

        <div className="table-card">
          <div className="table-responsive">
            {loading ? (
              <div className="loader-container">
                <Loader />
              </div>
            ) : (
              <table className="table custom-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="order-id">
                        #{order._id?.slice(-6).toUpperCase()}
                      </td>
                      <td>{order?.user?.userName || "N/A"}</td>
                      <td>
                        <span
                          className={`status-pill ${getStatusClass(order.status)}`}
                        >
                          {order.status || "N/A"}
                        </span>
                      </td>
                      <td>{order.paymentStatus || "N/A"}</td>
                      <td className="order-total">
                        ${order.totalAmount ?? "N/A"}
                      </td>
                      <td>
                        {new Date(order.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="action-cell">
                        <button
                          ref={(el) =>
                            (actionButtonRefs.current[order._id] = el)
                          }
                          className="action-dots-btn"
                          onClick={() =>
                            setActivePopover(
                              activePopover === order._id ? null : order._id,
                            )
                          }
                        >
                          <i className="fas fa-ellipsis-v"></i>
                        </button>
                        <PopOver
                          isOpen={activePopover === order._id}
                          onClose={() => setActivePopover(null)}
                          items={getActionItems(order)}
                          anchorRef={{
                            current: actionButtonRefs.current[order._id],
                          }}
                          position="bottom"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!loading && filteredOrders.length === 0 && (
              <div className="no-orders-state">
                <i className="fas fa-box-open no-orders-icon"></i>
                <h3>No Orders Found</h3>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isOrderStatusModalOpen}
        onClose={() => setIsOrderStatusModalOpen(false)}
        title="Update Order Status"
        buttons={[
          {
            label: "Cancel",
            className: "cancel-btn",
            onClick: () => setIsOrderStatusModalOpen(false),
          },
          {
            label: nextOrderStatus
              ? `Move to ${nextOrderStatus}`
              : "Update Status",
            className: "primary-btn",
            onClick: handleUpdateOrderStatus,
            loading: updatingOrderStatus,
            disabled: !nextOrderStatus,
          },
        ]}
      >
        {nextOrderStatus ? (
          <p>
            Are you sure you want to move order{" "}
            <strong>
              {selectedOrder?._id
                ? `#${selectedOrder._id.slice(-6).toUpperCase()}`
                : "#------"}
            </strong>{" "}
            from <strong>{selectedOrder?.status}</strong> to{" "}
            <strong>{nextOrderStatus}</strong>?
          </p>
        ) : (
          <p>This order cannot be moved forward.</p>
        )}
      </Modal>

      <Modal
        isOpen={isPaymentStatusModalOpen}
        onClose={() => setIsPaymentStatusModalOpen(false)}
        title="Update Payment Status"
        buttons={[
          {
            label: "Cancel",
            className: "cancel-btn",
            onClick: () => setIsPaymentStatusModalOpen(false),
          },
          {
            label: nextPaymentStatus
              ? `Move to ${nextPaymentStatus}`
              : "Update Payment",
            className: "primary-btn",
            onClick: handleUpdatePaymentStatus,
            loading: updatingPaymentStatus,
            disabled: !nextPaymentStatus,
          },
        ]}
      >
        {nextPaymentStatus ? (
          <p>
            Are you sure you want to change payment status for order{" "}
            <strong>
              {selectedOrder?._id
                ? `#${selectedOrder._id.slice(-6).toUpperCase()}`
                : "#------"}
            </strong>{" "}
            from <strong>{selectedOrder?.paymentStatus || "N/A"}</strong> to{" "}
            <strong>{nextPaymentStatus}</strong>?
          </p>
        ) : (
          <p>Payment status cannot be updated further.</p>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
        buttons={[
          {
            label: "Cancel",
            className: "cancel-btn",
            onClick: () => setIsDeleteModalOpen(false),
          },
          {
            label: "Delete Permanently",
            className: "danger-btn", // Ensure you have a red style for this
            onClick: handleDeleteOrder,
            loading: deletingOrder,
          },
        ]}
      >
        <div className="delete-confirm-content">
          <p>
            Are you sure you want to delete order
            <strong>
              {selectedOrder?._id
                ? ` #${selectedOrder._id.slice(-6).toUpperCase()}`
                : ""}
            </strong>
            ?
          </p>
          <p
            className="warning-text"
            style={{
              color: "var(--danger-color)",
              marginTop: "10px",
              fontSize: "0.9rem",
            }}
          >
            <i className="fas fa-exclamation-triangle"></i> This action is
            permanent and will remove the order from the customer's history.
          </p>
        </div>
      </Modal>
    </section>
  );
};

export default Orders;
