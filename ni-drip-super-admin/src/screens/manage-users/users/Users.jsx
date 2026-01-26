/**
 * @file Users.jsx
 * @module Screens/Users/Management
 * @description
 * The primary interface for Super Admins to view and manage the system's user directory.
 * * **Key Capabilities:**
 * - **Live Search:** Filters `allUsers` state by username or email.
 * - **Status Badging:** Visual differentiation between active and inactive user accounts.
 * - **Admin Metrics:** Real-time count of total registered users and active sessions.
 * * @requires react-redux
 * @requires react-hot-toast
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import "./Users.css";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "../../../redux/slices/user.slice";
import Loader from "../../../utilities/loader/Loader.utility";
import InputField from "../../../utilities/input-field/InputField.utility";
import PopOver from "../../../utilities/pop-over/PopOver.utility";
import { useNavigate } from "react-router-dom";

const Users = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const actionButtonRefs = useRef({});

  const [search, setSearch] = useState("");
  const authUser = useSelector((state) => state.auth.user);
  const { allUsers, loading } = useSelector((state) => state.users);
  const [activePopover, setActivePopover] = useState(null);

  useEffect(() => {
    if (authUser?.id) {
      dispatch(getAllUsers());
    }
  }, [dispatch, authUser?.id]);

  // Updated Stats to track Email Verification specifically
  const stats = {
    total: allUsers.length,
    verified: allUsers.filter((u) => u.isEmailVerified === true).length,
    unverified: allUsers.filter((u) => u.isEmailVerified === false).length,
  };

  const filteredUsers = allUsers.filter(
    (user) =>
      user.userName?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const getActionItems = (user) => [
    {
      label: "View Details",
      icon: "fas fa-user-circle",
      action: () =>
        navigate(`/super-admin/users/manage-users/user-details/${user._id}`, {
          state: { user },
        }),
    },
  ];

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <section id="users">
      <div className="users-container">
        <div className="users-breadcrumb">
          <div className="users-header">
            <h1 className="users-title">Customer Management</h1>
            <p className="users-subtitle">
              Manage and track all registered customers
            </p>
          </div>

          <div className="search-wrapper">
            <InputField
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              width={450}
              icon={<i className="fas fa-search"></i>}
            />
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card stat-total">
            <h3>Total Users</h3>
            <p>{stats.total}</p>
          </div>

          <div className="stat-card stat-verified">
            <h3>Verified Users</h3>
            <p>{stats.verified}</p>
          </div>

          <div className="stat-card stat-unverified">
            <h3>Not Verified Users</h3>
            <p>{stats.unverified}</p>
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
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Orders</th>
                    <th>Verification</th>
                    <th>Join Date</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td className="user-name">
                        <div>{user.userName}</div>
                      </td>
                      <td className="user-email">
                        <div>{user.email}</div>
                      </td>
                      <td>
                        <span className="orders-count">
                          {user.orders?.length || 0}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            user.isEmailVerified ? "verified" : "not-verified"
                          }`}
                        >
                          <i
                            className={`fas ${user.isEmailVerified ? "fa-check-circle" : "fa-times-circle"}`}
                            style={{ marginRight: "5px" }}
                          ></i>
                          {user.isEmailVerified ? "Verified" : "Not Verified"}
                        </span>
                      </td>

                      <td>{formatDate(user.createdAt)}</td>

                      <td className="action-dots">
                        <div className="popover-anchor">
                          <button
                            ref={(el) =>
                              (actionButtonRefs.current[user._id] = el)
                            }
                            className="action-dots"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePopover(
                                activePopover === user._id ? null : user._id,
                              );
                            }}
                          >
                            <i
                              className="fas fa-ellipsis-v"
                              style={{ marginLeft: 40 }}
                            ></i>
                          </button>

                          <PopOver
                            isOpen={activePopover === user._id}
                            onClose={() => setActivePopover(null)}
                            items={getActionItems(user)}
                            className="user-actions-popover"
                            anchorRef={{
                              current: actionButtonRefs.current[user._id],
                            }}
                            position="bottom"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {/* Empty State Logic */}
            {!loading && filteredUsers.length === 0 && (
              <div className="no-users-state">
                <i className="fas fa-users-slash no-users-icon"></i>
                <h3>No Users Found</h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Users;
