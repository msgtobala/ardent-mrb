import { displayError, clearErrors } from "./contact.js";

export function validateForm(name, email, phone, message) {
  let isValid = true;

  clearErrors();

  // Validate name
  if (!name) {
    displayError(
      "form_name" in document.body ? "form_name" : "username",
      "Please enter your name"
    );
    isValid = false;
  }

  // Validate email
  if (!email) {
    displayError(
      "form_email" in document.body ? "form_email" : "email",
      "Please enter your email"
    );
    isValid = false;
  } else if (!isValidEmail(email)) {
    displayError(
      "form_email" in document.body ? "form_email" : "email",
      "Please enter a valid email address"
    );
    isValid = false;
  }

  // Validate phone
  if (!phone) {
    displayError(
      "form_phone" in document.body ? "form_phone" : "phone",
      "Please enter your phone number"
    );
    isValid = false;
  } else if (!isValidPhone(phone)) {
    displayError(
      "form_phone" in document.body ? "form_phone" : "phone",
      "Please enter a valid phone number"
    );
    isValid = false;
  }

  // Validate message (only for contact form)
  if (document.getElementById("form_message") && !message) {
    displayError("form_message", "Please enter your message");
    isValid = false;
  }

  return isValid;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  // Basic phone validation - at least 10 digits
  const phoneRegex = /^\d{10,15}$/;
  return phoneRegex.test(phone);
}
