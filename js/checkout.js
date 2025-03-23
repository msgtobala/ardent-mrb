document.addEventListener("DOMContentLoaded", function () {
  // Extract product ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  // Get product information container
  const orderDetailsContainer = document.getElementById("order-details");
  const errorMessageContainer = document.getElementById("error-message");
  const checkoutForm = document.getElementById("checkout-form");
  const productTitleElement = document.getElementById("product-title");
  const proceedToPaymentBtn = document.getElementById("proceed-payment");
  const formFields = document.querySelectorAll(".form-control");

  // Store the selected product globally
  let selectedProduct = null;

  // If no product ID is provided
  if (!productId) {
    handleError(
      "No product selected. Please choose a product from our offerings."
    );
    return;
  }

  // Convert product ID to number for comparison
  const productIdNum = parseInt(productId);

  // Find the product with matching ID
  selectedProduct = products.find((product) => product.id === productIdNum);

  // If product not found
  if (!selectedProduct) {
    handleError(
      "Invalid product selection. Please choose a valid product from our offerings."
    );
    return;
  }

  // Show the product details
  displayProductDetails(selectedProduct);

  // Ensure the form is visible
  if (checkoutForm) {
    checkoutForm.style.display = "block";
  }

  // Add event listeners for form field validation
  if (formFields) {
    formFields.forEach((field) => {
      field.addEventListener("blur", function () {
        validateField(this);
      });

      field.addEventListener("input", function () {
        // Clear error when user starts typing
        clearFieldError(this);
      });
    });
  }

  // Add event listener to proceed to payment button
  if (proceedToPaymentBtn) {
    proceedToPaymentBtn.addEventListener("click", function (e) {
      e.preventDefault();

      // Validate all fields before proceeding
      if (validateCheckoutForm()) {
        // Collect customer information
        const customerInfo = collectCustomerInfo();

        // Process payment for the selected product
        if (window.PaymentHandler && selectedProduct) {
          window.PaymentHandler.processPayment(selectedProduct, customerInfo);
        } else {
          console.error("Payment handler not found or no product selected");
          alert("Unable to process payment. Please try again later.");
        }
      }
    });
  }

  // Handle apply coupon button
  const applyCouponBtn = document.getElementById("button-addon2");
  if (applyCouponBtn) {
    applyCouponBtn.addEventListener("click", function () {
      const couponCode = document.getElementById("c-code").value.trim();

      if (couponCode) {
        // Show processing message
        this.innerHTML =
          '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Applying...';
        this.disabled = true;

        // Simulate API call to apply coupon
        setTimeout(() => {
          // Reset button
          this.innerHTML = "Apply";
          this.disabled = false;

          // For demo purposes, show a message that coupon is invalid
          showCouponMessage(
            "Invalid coupon code. Please try another one.",
            "danger"
          );
        }, 1500);
      } else {
        showCouponMessage("Please enter a coupon code", "warning");
      }
    });
  }

  // Function to show coupon message
  function showCouponMessage(message, type) {
    // Remove existing message if any
    const existingMsg = document.querySelector(".coupon-message");
    if (existingMsg) {
      existingMsg.remove();
    }

    // Create new message
    const msgHTML = `<div class="coupon-message alert alert-${type} mt-2">${message}</div>`;
    document.getElementById("c-code").insertAdjacentHTML("afterend", msgHTML);

    // Auto remove after 5 seconds
    setTimeout(() => {
      const msg = document.querySelector(".coupon-message");
      if (msg) {
        msg.remove();
      }
    }, 5000);
  }

  // Function to handle errors
  function handleError(message) {
    if (errorMessageContainer) {
      errorMessageContainer.textContent = message;
      errorMessageContainer.style.display = "block";
    }

    if (orderDetailsContainer) {
      orderDetailsContainer.style.display = "none";
    }

    if (checkoutForm) {
      checkoutForm.style.display = "none";
    }
  }

  // Function to display product details
  function displayProductDetails(product) {
    if (!orderDetailsContainer) return;

    // Show product title if element exists
    if (productTitleElement) {
      productTitleElement.textContent = product.name;
    }

    // Clear existing content
    orderDetailsContainer.innerHTML = "";

    // Create the order details HTML
    let html = `
            <li class="mb-3 border-bottom border-light pb-3">
                <span>1 x ${product.name}</span> ₹ ${product.price.toFixed(2)}
            </li>
            <li class="mb-3 border-bottom border-light pb-3">
                <span>Subtotal</span> ₹ ${product.price.toFixed(2)}
            </li>
            <li class="text-black">
                <span><strong class="cart-total">Total:</strong></span>
                <strong class="cart-total">₹ ${product.price.toFixed(
                  2
                )}</strong>
            </li>
        `;

    // Add the HTML to the container
    orderDetailsContainer.innerHTML = html;
  }

  // Function to validate individual field
  function validateField(field) {
    const fieldId = field.id;
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = "";

    // Clear previous error
    clearFieldError(field);

    // Validate based on field ID
    switch (fieldId) {
      case "fname":
      case "lname":
        if (!value) {
          isValid = false;
          errorMessage = "This field is required";
        }
        break;

      case "email":
        if (!value) {
          isValid = false;
          errorMessage = "Email is required";
        } else if (!isValidEmail(value)) {
          isValid = false;
          errorMessage = "Please enter a valid email address";
        }
        break;

      case "phone":
        if (!value) {
          isValid = false;
          errorMessage = "Phone number is required";
        } else if (!isValidPhone(value)) {
          isValid = false;
          errorMessage = "Please enter a valid 10-digit phone number";
        }
        break;

      case "address":
        if (!value) {
          isValid = false;
          errorMessage = "Address is required";
        }
        break;

      case "towncity":
        if (!value) {
          isValid = false;
          errorMessage = "City is required";
        }
        break;

      case "statename":
        if (!value) {
          isValid = false;
          errorMessage = "State is required";
        }
        break;

      case "zippostalcode":
        if (!value) {
          isValid = false;
          errorMessage = "Postal code is required";
        } else if (!isValidZipCode(value)) {
          isValid = false;
          errorMessage = "Please enter a valid postal code";
        }
        break;
    }

    // Display error if validation failed
    if (!isValid) {
      displayFieldError(field, errorMessage);
    }

    return isValid;
  }

  // Function to validate the entire form
  function validateCheckoutForm() {
    let isFormValid = true;

    // Validate all form fields
    formFields.forEach((field) => {
      if (!validateField(field)) {
        isFormValid = false;
      }
    });

    return isFormValid;
  }

  // Function to display field error
  function displayFieldError(field, message) {
    // Find or create error element
    let errorElement = field.nextElementSibling;
    if (!errorElement || !errorElement.classList.contains("form-error")) {
      errorElement = document.createElement("div");
      errorElement.className = "form-error text-danger mt-1";
      field.insertAdjacentElement("afterend", errorElement);
    }

    // Set error message
    errorElement.textContent = message;

    // Add error class to input
    field.classList.add("is-invalid");
  }

  // Function to clear field error
  function clearFieldError(field) {
    // Remove error message if it exists
    const errorElement = field.nextElementSibling;
    if (errorElement && errorElement.classList.contains("form-error")) {
      errorElement.remove();
    }

    // Remove error class from input
    field.classList.remove("is-invalid");
  }

  // Function to collect customer information
  function collectCustomerInfo() {
    return {
      name: `${document.getElementById("fname").value.trim()} ${document
        .getElementById("lname")
        .value.trim()}`,
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      address: document.getElementById("address").value.trim(),
      city: document.getElementById("towncity").value.trim(),
      state: document.getElementById("statename").value.trim(),
      zipCode: document.getElementById("zippostalcode").value.trim(),
    };
  }

  // Helper function to validate email
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Helper function to validate phone number (10 digits)
  function isValidPhone(phone) {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ""));
  }

  // Helper function to validate zip/postal code
  function isValidZipCode(zipCode) {
    // Basic validation for 6-digit Indian postal code
    const zipRegex = /^\d{6}$/;
    return zipRegex.test(zipCode.replace(/\s/g, ""));
  }
});
