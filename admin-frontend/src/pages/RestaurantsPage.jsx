import React, { useRef } from "react";
import ConfirmDeleteDialog from "../components/ConfirmDeleteDialog";
import CreateRestaurantForm from "../components/CreateRestaurantForm";
import Modal from "../components/Modal";
import PaginationControls from "../components/PaginationControls";
import RestaurantsTable from "../components/RestaurantsTable";

function RestaurantsPage({
  restaurants,
  restaurantsLoading,
  restaurantsError,
  totalCount,
  page,
  pageSize,
  searchInput,
  sortBy,
  sortDirection,
  onSearchChange,
  onSortByChange,
  onSortDirectionChange,
  onPageChange,
  onPageSizeChange,
  createRestaurantForm,
  onCreateRestaurantFieldChange,
  onCreateRestaurant,
  createRestaurantLoading,
  createRestaurantError,
  createRestaurantFieldErrors,
  createRestaurantSuccess,
  onDeleteRestaurant,
  restaurantToDelete,
  onConfirmDeleteRestaurant,
  onCloseDeleteRestaurant,
  deleteRestaurantLoadingId,
  deleteRestaurantError,
  editRestaurant,
  editRestaurantForm,
  onEditRestaurant,
  onEditRestaurantFieldChange,
  onEditRestaurantSubmit,
  onCloseEditRestaurant,
  editRestaurantLoading,
  editRestaurantError,
  editRestaurantFieldErrors,
  permissions,
}) {
  const deleteTriggerRef = useRef(null);
  const listFocusRef = useRef(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {permissions.canCreate && (
        <CreateRestaurantForm
          formData={createRestaurantForm}
          onFieldChange={onCreateRestaurantFieldChange}
          onSubmit={onCreateRestaurant}
          loading={createRestaurantLoading}
          error={createRestaurantError}
          fieldErrors={createRestaurantFieldErrors}
          success={createRestaurantSuccess}
        />
      )}

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
          <h3 style={{ color: "#e6eef8", margin: 0, fontSize: 20 }}>Рестораны</h3>
          <p style={{ color: "#9ca3af", margin: "8px 0 0 0", fontSize: 14 }}>
            Управляйте ресторанами и их статусом в CRM.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >
          <label style={{ flex: "1 1 260px", color: "#9ca3af", fontSize: 13 }}>
            Поиск
            <input
              ref={listFocusRef}
              type="search"
              value={searchInput}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Название или город"
              style={{
                width: "100%",
                boxSizing: "border-box",
                marginTop: 6,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "#0f172a",
                color: "#e6eef8",
                padding: "10px 12px",
              }}
            />
          </label>

          <label style={{ color: "#9ca3af", fontSize: 13 }}>
            Сортировка
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              style={{
                display: "block",
                marginTop: 6,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "#0f172a",
                color: "#e6eef8",
                padding: "10px 12px",
              }}
            >
              <option value="name">Название</option>
              <option value="city">Город</option>
              <option value="createdAt">Дата создания</option>
            </select>
          </label>

          <button
            type="button"
            onClick={onSortDirectionChange}
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
              padding: "10px 14px",
              background: "#0f172a",
              color: "#e6eef8",
              cursor: "pointer",
            }}
          >
            {sortDirection === "asc" ? "По возрастанию ↑" : "По убыванию ↓"}
          </button>
        </div>

        <RestaurantsTable
          restaurants={restaurants}
          loading={restaurantsLoading}
          error={restaurantsError}
          onEditRestaurant={onEditRestaurant}
          onDeleteRestaurant={(record, trigger) => {
            deleteTriggerRef.current = trigger;
            onDeleteRestaurant(record);
          }}
          deleteLoadingId={deleteRestaurantLoadingId}
          canEdit={permissions.canEditRestaurants}
          canDelete={permissions.canDelete}
        />

        <PaginationControls
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          loading={restaurantsLoading}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>

      {restaurantToDelete && (
        <ConfirmDeleteDialog
          title="Удаление ресторана"
          name={restaurantToDelete.name}
          loading={deleteRestaurantLoadingId !== null}
          error={deleteRestaurantError}
          onConfirm={onConfirmDeleteRestaurant}
          onClose={onCloseDeleteRestaurant}
          returnFocusRef={deleteTriggerRef}
          fallbackFocusRef={listFocusRef}
        />
      )}

      {editRestaurant && (
        <Modal
          title="Изменение ресторана"
          loading={editRestaurantLoading}
          onClose={onCloseEditRestaurant}
        >
          <CreateRestaurantForm
            mode="edit"
            embedded
            formData={editRestaurantForm}
            onFieldChange={onEditRestaurantFieldChange}
            onSubmit={onEditRestaurantSubmit}
            onCancel={onCloseEditRestaurant}
            loading={editRestaurantLoading}
            error={editRestaurantError}
            fieldErrors={editRestaurantFieldErrors}
          />
        </Modal>
      )}
    </div>
  );
}

export default RestaurantsPage;
