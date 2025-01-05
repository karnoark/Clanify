const hasErrorsInEmail = (email: string): boolean => {
  const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const noError = pattern.test(email);
  return !noError;
};

const hasErrorsInPassword = (password: string): boolean => {
  const minLength = 8;
  const pattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const noError = password.length > minLength && pattern.test(password);
  return !noError;
};

const hasErrorsInName = (name: string): boolean => {
  const minLength = 2;
  const maxLength = 15;
  const noError = name.length >= minLength && name.length <= maxLength;
  return !noError;
};

export { hasErrorsInEmail, hasErrorsInPassword, hasErrorsInName };
