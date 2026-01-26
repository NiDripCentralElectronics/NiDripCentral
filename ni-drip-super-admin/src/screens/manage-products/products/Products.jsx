/**
 * @file Products.jsx
 * @module Screens/Products/Management
 * @description
 * The primary interface for Super Admins to view, filter, and moderate the product catalog.
 * * **Key Capabilities:**
 * - **Live Search:** Client-side filtering of the `products` state based on title matches.
 * - **Dynamic Actions:** Contextual popover menus per table row (View, Edit, Delete).
 * - **Inventory Metrics:** Aggregated stats for total and active product counts.
 * - **Destructive Workflows:** Implements a two-step verification (Modal confirmation) for product deletion.
 * * @requires react-redux
 * @requires react-router-dom
 * @requires react-hot-toast
 */

import React, { useState, useEffect } from "react";
import "./Products.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  deleteProduct,
  getAllProducts,
} from "../../../redux/slices/product.slice";
import Loader from "../../../utilities/loader/Loader.utility";
import InputField from "../../../utilities/input-field/InputField.utility";
import PopOver from "../../../utilities/pop-over/PopOver.utility";
import Modal from "../../../utilities/modal/Modal.utlity";
import { toast } from "react-hot-toast";
import Button from "../../../utilities/button/Button.utility";
import { useRef } from "react";

const Products = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const actionButtonRefs = useRef({});
  const user = useSelector((state) => state.auth.user);
  const products = useSelector((state) => state.products.products || []);
  const loading = useSelector((state) => state.products.loading);
  const [search, setSearch] = useState("");
  const [activePopover, setActivePopover] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      dispatch(getAllProducts());
    }
  }, [dispatch, user?.id]);

  const stats = {
    total: products.length,
    active: products.filter((p) => p.status === "ACTIVE").length,
  };

  const filteredProducts = products.filter((product) =>
    product.title?.toLowerCase().includes(search.toLowerCase()),
  );

  const getActionItems = (product) => [
    {
      label: "View Details",
      icon: "fas fa-eye",
      action: () =>
        navigate(
          `/super-admin/products/manage-products/product-details/${product._id}`,
          {
            state: { product },
          },
        ),
    },
    {
      label: "Edit Product",
      icon: "fas fa-pencil-alt",
      action: () =>
        navigate(
          `/super-admin/products/manage-products/update-product/${product._id}`,
          {
            state: { product },
          },
        ),
    },
    {
      label: "Delete",
      icon: "fas fa-trash",
      type: "danger",
      action: () => handleOpenDeleteModal(product),
    },
  ];

  const handleOpenDeleteModal = (product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    setDeleting(true);

    try {
      const result = await dispatch(deleteProduct(selectedProduct._id));

      if (deleteProduct.fulfilled.match(result)) {
        const { message } = result.payload;
        toast.success(message);
        setIsDeleteModalOpen(false);
        setSelectedProduct(null);
      } else {
        const errorMsg = result.payload?.message;
        toast.error(errorMsg);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section id="products">
      <div className="products-container">
        <div className="products-breadcrumb">
          <div className="products-header">
            <h1 className="products-title">Products</h1>
            <p className="products-subtitle">
              Manage all your products and inventory
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
            <h3>Total Products</h3>
            <p className="stat-value">{stats.total.toLocaleString()}</p>
          </div>
          <div className="stat-card stat-active">
            <h3>Active</h3>
            <p className="stat-value">{stats.active}</p>
          </div>          

          <div className="btn-container">
            <Button
              title="Add Product"
              width={150}
              icon={<i className="fas fa-plus-circle"></i>}
              onPress={() =>
                navigate("/super-admin/products/manage-products/add-product")
              }
            />
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
                    <th>Product</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product._id}>
                      <td className="product-name">{product.title}</td>
                      <td>{product.category?.[0] || "N/A"}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            product.status === "ACTIVE" ? "active" : "inactive"
                          }`}
                        >
                          {product.status === "ACTIVE" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>${product.price?.toFixed(2)}</td>
                      <td className="action-dots">
                        <div className="popover-anchor">
                          <button
                            ref={(el) =>
                              (actionButtonRefs.current[product._id] = el)
                            }
                            className="action-dots"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePopover(
                                activePopover === product._id
                                  ? null
                                  : product._id,
                              );
                            }}
                          >
                            <i
                              className="fas fa-ellipsis-v"
                              style={{ marginLeft: 40 }}
                            ></i>
                          </button>

                          <PopOver
                            isOpen={activePopover === product._id}
                            onClose={() => setActivePopover(null)}
                            items={getActionItems(product)}
                            className="product-actions-popover"
                            anchorRef={{
                              current: actionButtonRefs.current[product._id],
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
            {!loading && filteredProducts.length === 0 && (
              <div className="no-products-state">
                <i className="fas fa-box-open no-products-icon"></i>
                <h3>No Products Found</h3>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Product?"
        buttons={[
          {
            label: "Cancel",
            className: "cancel-btn",
            onClick: () => setIsDeleteModalOpen(false),
          },
          {
            label: "Delete",
            className: "danger-btn",
            onClick: handleDelete,
            loading: deleting,
          },
        ]}
      >
        Are you sure you want to delete{" "}
        <strong>{selectedProduct?.title}</strong>?
      </Modal>
    </section>
  );
};

export default Products;
