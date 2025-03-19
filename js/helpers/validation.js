import { clearErrors, displayError } from "./contact.js";

// Form validation
export function validateForm(name, email, phone, message) {
  // Reset previous error messages
  clearErrors();

  let isValid = true;

  // Validate name
  if (name === "") {
    displayError("form_name", "Please enter your name");
    isValid = false;
  }

  // Validate email
  if (email === "") {
    displayError("form_email", "Please enter your email");
    isValid = false;
  } else if (!isValidEmail(email)) {
    displayError("form_email", "Please enter a valid email address");
    isValid = false;
  }

  // Validate phone
  if (phone === "") {
    displayError("form_phone", "Please enter your phone number");
    isValid = false;
  } else if (!isValidPhone(phone)) {
    displayError("form_phone", "Please enter a valid phone number");
    isValid = false;
  }

  // Validate message
  if (message === "") {
    displayError("form_message", "Please enter a message");
    isValid = false;
  }

  return isValid;
}

function isValidEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

function isValidPhone(phone) {
  const phonePattern = /^\+?[0-9]{10,15}$/;
  return phonePattern.test(phone.replace(/[\s()-]/g, ""));
}
