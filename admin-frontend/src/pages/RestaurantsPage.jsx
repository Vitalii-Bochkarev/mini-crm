import React from "react";
import CreateRestaurantForm from "../components/CreateRestaurantForm";
import RestaurantsTable from "../components/RestaurantsTable";

function RestaurantsPage({
  restaurants,
  restaurantsLoading,
  restaurantsError,
  createRestaurantForm,
  onCreateRestaurantFieldChange,
  onCreateRestaurant,
  createRestaurantLoading,
  createRestaurantError,
  createRestaurantSuccess,
  onDeleteRestaurant,
  deleteRestaurantLoadingId,
  deleteRestaurantError,
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <CreateRestaurantForm
        formData={createRestaurantForm}
        onFieldChange={onCreateRestaurantFieldChange}
        onSubmit={onCreateRestaurant}
        loading={createRestaurantLoading}
        error={createRestaurantError}
        success={createRestaurantSuccess}
      />

      <div
        style={{
          backgroundColor: "#111827",
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.04)",
          boxShadow: "0 8px 30px rgba(2,6,23,0.7)",
          padding: 24,
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ color: "#e6eef8", margin: 0, fontSize: 20 }}>Restaurants</h3>
          <p style={{ color: "#9ca3af", margin: "8px 0 0 0", fontSize: 14 }}>
            Manage restaurants and their status within the CRM.
          </p>
        </div>

        <RestaurantsTable
          restaurants={restaurants}
          loading={restaurantsLoading}
          error={restaurantsError}
          onDeleteRestaurant={onDeleteRestaurant}
          deleteLoadingId={deleteRestaurantLoadingId}
          deleteError={deleteRestaurantError}
        />
      </div>
    </div>
  );
}

export default RestaurantsPage;
