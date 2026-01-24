/**
 * @file Dashboard.layout.jsx
 * @module Layouts/Dashboard
 * @description
 * The structural wrapper for the Admin application.
 * * **Core Features:**
 * - **Adaptive Navigation:** Dynamically toggles between a fixed sidebar (Desktop) and a drawer-style sidebar (Mobile).
 * - **Outlet Injection:** Serves as the parent route for all dashboard sub-pages (Reports, Users, Settings).
 * - **Resize Watcher:** Actively monitors window dimensions to prevent layout "ghosting" when transitioning between viewports.
 * * **State Management:**
 * - `sidebarOpen`: Controls the visibility of the mobile drawer.
 * - `isMobile`: Derived state based on the 1024px breakpoint.
 */

import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Dashboard.layout.css";
import Sidebar from "../../utilities/Sidebar/Sidebar.utility";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      if (!mobile) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside
        className={`sidebar-container ${
          isMobile && sidebarOpen ? "sidebar-open" : ""
        } ${isMobile ? "sidebar-mobile" : ""}`}
      >
        <Sidebar />
      </aside>

      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
