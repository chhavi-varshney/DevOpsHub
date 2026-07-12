export const validateLogin = (email, password) => {
  const errors = {};

  if (!email.trim()) {
    errors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = "Invalid email";
  }

  if (!password.trim()) {
    errors.password = "Password is required";
  }

  return errors;
};