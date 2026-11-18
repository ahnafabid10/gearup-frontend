"use client";

import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { useApiData } from "@/hooks/use-api-data";
import { DataState } from "@/components/shared/data-state";
import type { GearRecord } from "@/lib/types";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiShield,
  FiSave,
  FiCheckCircle,
} from "react-icons/fi";

export function ProfileSettings({ role }: { role: string }) {
  const { data, loading, error, reload } = useApiData("users/profile");
  const user = data?.data as GearRecord | undefined;

  const [busy, setBusy] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setSuccessMsg("");
    setErrMsg("");

    const formData = new FormData(e.currentTarget);
    const body = {
      name: String(formData.get("name") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      address: String(formData.get("address") || "").trim(),
    };

    try {
      await api("users/profile", "PATCH", body);
      setSuccessMsg("Profile details updated successfully!");
      await reload();
    } catch (err) {
      setErrMsg((err as Error).message || "Failed to update profile.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="dash-profile-container">
      <DataState loading={loading} error={error} empty={!user} retry={reload}>
        {user && (
          <div className="dash-profile-grid">
            {/* Profile Edit Form */}
            <form onSubmit={handleSubmit} className="dash-profile-card">
              <h3 className="dash-profile-card-title">
                Edit Profile Information
              </h3>

              {successMsg && (
                <div className="dash-alert success" role="status">
                  <FiCheckCircle size={16} />
                  <span>{successMsg}</span>
                </div>
              )}

              {errMsg && (
                <div className="dash-alert error" role="alert">
                  <span>{errMsg}</span>
                </div>
              )}

              <div className="dash-form-row">
                <label className="dash-form-label">
                  <span className="label-text">
                    <FiUser size={13} /> Full Name
                  </span>
                  <input
                    name="name"
                    type="text"
                    required
                    defaultValue={user.name || ""}
                    className="dash-input"
                    placeholder="Enter your full name"
                  />
                </label>
              </div>

              <div className="dash-form-row">
                <label className="dash-form-label">
                  <span className="label-text">
                    <FiMail size={13} /> Email Address (Immutable)
                  </span>
                  <input
                    type="email"
                    disabled
                    value={user.email || ""}
                    className="dash-input disabled"
                  />
                  <small className="dash-input-hint">
                    Email address is tied to your login credentials and security
                    tokens.
                  </small>
                </label>
              </div>

              <div className="dash-form-row">
                <label className="dash-form-label">
                  <span className="label-text">
                    <FiPhone size={13} /> Phone Number
                  </span>
                  <input
                    name="phone"
                    type="tel"
                    defaultValue={user.phone || ""}
                    className="dash-input"
                    placeholder="+1 (555) 000-0000"
                  />
                </label>
              </div>

              <div className="dash-form-row">
                <label className="dash-form-label">
                  <span className="label-text">
                    <FiMapPin size={13} /> Default Equipment Pickup / Delivery
                    Address
                  </span>
                  <textarea
                    name="address"
                    rows={3}
                    defaultValue={user.address || ""}
                    className="dash-textarea"
                    placeholder="Street address, city, state, postal code…"
                  />
                </label>
              </div>

              <div className="dash-form-actions">
                <button
                  type="submit"
                  disabled={busy}
                  className="btn dash-btn-primary"
                >
                  <FiSave size={15} />
                  <span>
                    {busy ? "Saving Changes…" : "Save Profile Details"}
                  </span>
                </button>
              </div>
            </form>

            {/* Profile Overview & Statistics Sidebar Card */}
            <div className="dash-profile-meta-card">
              <div className="dash-profile-avatar-wrap">
                <div className="dash-profile-large-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <h4 className="dash-meta-name">{user.name}</h4>
                  <p className="dash-meta-role">
                    <FiShield size={12} /> {user.role} ·{" "}
                    {user.status || "ACTIVE"}
                  </p>
                </div>
              </div>

              <div className="dash-meta-divider" />

              <h4 className="dash-meta-stats-title">Platform Participation</h4>
              <div className="dash-meta-stats-list">
                <div className="dash-meta-stat-item">
                  <span>Rental Bookings</span>
                  <strong>{user._count?.rentalOrders ?? 0}</strong>
                </div>
                {role === "provider" && (
                  <div className="dash-meta-stat-item">
                    <span>Equipment Listed</span>
                    <strong>{user._count?.gearItems ?? 0}</strong>
                  </div>
                )}
                <div className="dash-meta-stat-item">
                  <span>Verified Reviews</span>
                  <strong>{user._count?.reviews ?? 0}</strong>
                </div>
                <div className="dash-meta-stat-item">
                  <span>Settled Transactions</span>
                  <strong>{user._count?.payments ?? 0}</strong>
                </div>
              </div>

              <div className="dash-meta-footer">
                <small>Account ID: #{user.id.slice(0, 12)}</small>
              </div>
            </div>
          </div>
        )}
      </DataState>
    </div>
  );
}
