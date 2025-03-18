export function displayError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorElement = field.parentElement.querySelector(".help-block");
  if (errorElement) {
    errorElement.textContent = message;
    field.classList.add("is-invalid");
  }
}

export function clearErrors() {
  const errorElements = document.querySelectorAll(".help-block");
  errorElements.forEach((element) => {
    element.textContent = "";
  });

  const formFields = document.querySelectorAll(".form-control");
  formFields.forEach((field) => {
    field.classList.remove("is-invalid");
  });
}

export function showMessage(message, type) {
  const messagesDiv = document.querySelector(".messages");
  if (messagesDiv) {
    messagesDiv.innerHTML = `<div class="alert alert-${
      type === "success" ? "success" : "danger"
    }">${message}</div>`;

    // Auto-hide the message after 5 seconds
    setTimeout(() => {
      messagesDiv.innerHTML = "";
    }, 5000);
  }
}
