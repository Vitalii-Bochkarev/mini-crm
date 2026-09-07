import { ROLES } from "./formatters";

export function getUiPermissions(role) {
  const canWrite = role === ROLES.ADMINISTRATOR || role === ROLES.EDITOR;

  return {
    canCreate: canWrite,
    canEdit: canWrite,
    canDelete: role === ROLES.ADMINISTRATOR,
  };
}
