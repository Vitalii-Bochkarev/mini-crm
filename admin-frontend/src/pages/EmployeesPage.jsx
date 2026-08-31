import React from "react";
import CreateEmployeeForm from "../components/CreateEmployeeForm";
import EmployeesTable from "../components/EmployeesTable";

function EmployeesPage({
  employees,
  employeesLoading,
  employeesError,
  createEmployeeForm,
  onCreateEmployeeFieldChange,
  onCreateEmployee,
  createEmployeeLoading,
  createEmployeeError,
  createEmployeeSuccess,
  onDeleteEmployee,
  deleteEmployeeLoadingId,
  deleteEmployeeError,
  restaurants,
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <CreateEmployeeForm
        formData={createEmployeeForm}
        onFieldChange={onCreateEmployeeFieldChange}
        onSubmit={onCreateEmployee}
        loading={createEmployeeLoading}
        error={createEmployeeError}
        success={createEmployeeSuccess}
        restaurants={restaurants}
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
          <h3 style={{ color: "#e6eef8", margin: 0, fontSize: 20 }}>Сотрудники</h3>
          <p style={{ color: "#9ca3af", margin: "8px 0 0 0", fontSize: 14 }}>
            Управляйте сотрудниками и их распределением по ресторанам.
          </p>
        </div>

        <EmployeesTable
          employees={employees}
          loading={employeesLoading}
          error={employeesError}
          onDeleteEmployee={onDeleteEmployee}
          deleteLoadingId={deleteEmployeeLoadingId}
          deleteError={deleteEmployeeError}
        />
      </div>
    </div>
  );
}

export default EmployeesPage;
