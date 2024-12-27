// Validation rules using regular expressions and constraints
const VALIDATION_RULES = {
  email: {
    pattern: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    message: "Please enter a valid email address",
  },
  password: {
    minLength: 8,
    pattern:
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    message:
      "Password must be at least 8 characters and contain uppercase, lowercase, number and special character",
  },
  firstName: {
    minLength: 2,
    pattern: /^[a-zA-Z\s-']+$/,
    message:
      "First name must be at least 2 characters and contain only letters, spaces, hyphens and apostrophes",
  },
  lastName: {
    minLength: 2,
    pattern: /^[a-zA-Z\s-']+$/,
    message:
      "Last name must be at least 2 characters and contain only letters, spaces, hyphens and apostrophes",
  },
};

interface ValidationErrors {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}

export const validateField = (name: string, value: string): string => {
  const rules = VALIDATION_RULES[name];
  if (!value)
    return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;

  if (rules.minLength && value.length < rules.minLength) {
    return `${name.charAt(0).toUpperCase() + name.slice(1)} must be at least ${
      rules.minLength
    } characters`;
  }

  if (rules.pattern && !rules.pattern.test(value)) {
    return rules.message;
  }

  return "";
};

export const isFieldValid = (name: string, value: string): boolean => {
  const rules = VALIDATION_RULES[name];

  if (rules.minLength && value.length < rules.minLength) {
    return false;
  }

  if (rules.pattern && !rules.pattern.test(value)) {
    return false;
  }

  return false;
};
