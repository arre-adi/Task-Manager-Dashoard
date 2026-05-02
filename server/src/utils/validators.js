import { badRequest } from "./http.js";

export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "DONE"];
export const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH"];
export const PROJECT_ROLES = ["ADMIN", "MEMBER"];

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function assertRequired(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    badRequest(`${fieldName} is required`);
  }
}

export function assertEnum(value, allowedValues, fieldName) {
  if (!allowedValues.includes(value)) {
    badRequest(`${fieldName} must be one of: ${allowedValues.join(", ")}`);
  }
}

export function assertPositiveInteger(value, fieldName) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    badRequest(`${fieldName} must be a positive integer`);
  }

  return parsed;
}

export function assertDateString(value, fieldName) {
  if (Number.isNaN(Date.parse(value))) {
    badRequest(`${fieldName} must be a valid date`);
  }
}

