/**
 * Payment handler for Razorpay integration
 */

// Razorpay test key
const razorpayKeyId = "rzp_live_08tMX4Iwv9nZAB";

// API endpoints
const API_BASE_URL =
  "https://us-central1-mrb-ardent-mds.cloudfunctions.net/api"; // Replace with your actual API URL
const CREATE_ORDER_ENDPOINT = "/create-order";
const VERIFY_PAYMENT_ENDPOINT = "/verify-payment";

// Initialize the payment process
async function initializePayment(product, customerInfo) {
  try {
    // Show loading state
    showProcessingOverlay(true, "Creating your order...");

    // Create order via API
    const orderData = await createOrder(1);

    if (!orderData || !orderData.order || !orderData.order.id) {
      throw new Error("Failed to create order. Please try again.");
    }

    // Hide loading state
    showProcessingOverlay(false);

    // Configure Razorpay options
    const options = {
      key: razorpayKeyId,
      amount: 1 * 100, // Amount in smallest currency unit (paise for INR)
      currency: "INR",
      name: "Ardent MDS",
      description: `Payment for ${product.name}`,
      image: "images/ardent-logo.png",
      order_id: orderData.order.id,
      handler: function (response) {
        // This function runs when payment is successful
        handlePaymentSuccess(response, product, customerInfo);
      },
      prefill: {
        name: customerInfo.name,
        email: customerInfo.email,
        contact: customerInfo.phone,
      },
      notes: {
        productId: product.id,
        productName: product.name,
        customerDetails: JSON.stringify(customerInfo),
      },
      theme: {
        color: "#1360ef", // Match the theme color of the website
      },
      modal: {
        ondismiss: function () {
          showPaymentStatus(
            "warning",
            "Payment Cancelled",
            "You've cancelled the payment process. Your order has not been placed."
          );
        },
      },
    };

    // Initialize Razorpay
    const razorpayInstance = new Razorpay(options);

    // Open Razorpay checkout
    razorpayInstance.open();

    // Handle payment failure
    razorpayInstance.on("payment.failed", function (response) {
      handlePaymentFailure(response);
    });

    return razorpayInstance;
  } catch (error) {
    console.error("Payment initialization error:", error);
    showProcessingOverlay(false);
    showPaymentStatus(
      "error",
      "Payment Setup Failed",
      `We couldn't set up your payment: ${error.message}. Please try again later.`
    );
    return null;
  }
}

// Create order through API
async function createOrder(amount) {
  try {
    const response = await fetch(`${API_BASE_URL}${CREATE_ORDER_ENDPOINT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

// Handle successful payment
async function handlePaymentSuccess(response, product, customerInfo) {
  try {
    showProcessingOverlay(true, "Verifying your payment...");

    // Verify payment with backend
    const verificationResult = await verifyPayment(response);

    // Store the payment details with the order in the database
    showProcessingOverlay(false);

    // Handle verification result
    if (verificationResult && verificationResult.success) {
      // Payment verified successfully
      showPaymentStatus(
        "success",
        "Payment Successful!",
        `Your payment for ${
          product.name
        } has been processed successfully. Your order number is ${
          response.razorpay_order_id || "N/A"
        }. You will receive a confirmation email shortly.`,
        function () {
          // Redirect to success page or dashboard
          window.location.href =
            "payment-success.html?order=" +
            (response.razorpay_order_id || "unknown");
        }
      );
    } else {
      // Payment verification failed
      showPaymentStatus(
        "error",
        "Payment Verification Failed",
        "We've received your payment, but we couldn't verify it. Please contact our support team with your payment details."
      );
    }
  } catch (error) {
    showProcessingOverlay(false);
    console.error("Payment verification error:", error);
    showPaymentStatus(
      "error",
      "Payment Verification Error",
      "We've encountered an error while verifying your payment. Please contact our support team."
    );
  }
}

// Verify payment with API
async function verifyPayment(res) {
  try {
    const response = await fetch(`${API_BASE_URL}${VERIFY_PAYMENT_ENDPOINT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(res),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error verifying payment:", error);
    throw error;
  }
}

// Handle payment failure
function handlePaymentFailure(response) {
  console.error("Payment failed:", response);

  // Show failure message
  showPaymentStatus(
    "error",
    "Payment Failed",
    `Your payment could not be processed. Error: ${
      response.error.description || "Unknown error"
    }. Please try again or use a different payment method.`
  );
}

// Show processing overlay
function showProcessingOverlay(show, message = "Processing...") {
  // Remove existing overlay if any
  const existingOverlay = document.getElementById("processing-overlay");
  if (existingOverlay) {
    existingOverlay.remove();
  }

  if (show) {
    // Create and show overlay
    const overlayHtml = `
      <div id="processing-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 9999; display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <div class="spinner-border text-light" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="text-light mt-3">${message}</p>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", overlayHtml);
  }
}

// Show payment status message with improved styling
function showPaymentStatus(status, title, message, onClose = null) {
  // Status can be: success, error, warning
  const statusColors = {
    success: {
      header: "bg-success",
      icon: '<i class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i>',
    },
    error: {
      header: "bg-danger",
      icon: '<i class="bi bi-x-circle-fill text-danger" style="font-size: 4rem;"></i>',
    },
    warning: {
      header: "bg-warning",
      icon: '<i class="bi bi-exclamation-triangle-fill text-warning" style="font-size: 4rem;"></i>',
    },
  };

  const statusConfig = statusColors[status] || statusColors.warning;

  // Create modal HTML for showing payment status
  const modalHtml = `
  <div class="modal fade" id="paymentStatusModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
      <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
              <div class="modal-header ${statusConfig.header} text-white">
                  <h5 class="modal-title">${title}</h5>
                  <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body p-5">
                  <div class="text-center mb-4">
                      ${statusConfig.icon}
                  </div>
                  <p class="text-center">${message}</p>
              </div>
              <div class="modal-footer justify-content-center">
                  <button type="button" class="themeht-btn ${
                    status === "success" ? "primary-btn" : "outline-btn"
                  }" data-bs-dismiss="modal">
                      ${status === "success" ? "Continue" : "Close"}
                  </button>
              </div>
          </div>
      </div>
  </div>
  `;

  // Add modal to the document
  document.body.insertAdjacentHTML("beforeend", modalHtml);

  // Initialize and show the modal
  const modalElement = document.getElementById("paymentStatusModal");
  const modal = new bootstrap.Modal(modalElement);
  modal.show();

  // Handle custom close action if provided
  if (onClose) {
    modalElement.addEventListener("hidden.bs.modal", onClose);
  }

  // Remove modal from DOM when hidden
  modalElement.addEventListener("hidden.bs.modal", function () {
    this.remove();
  });
}

// Validate customer information
function validateCustomerInfo() {
  // Get form fields
  const fname = document.getElementById("fname").value.trim();
  const lname = document.getElementById("lname").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const city = document.getElementById("towncity").value.trim();

  // Basic validation
  if (!fname) {
    alert("Please enter your first name");
    return null;
  }

  if (!lname) {
    alert("Please enter your last name");
    return null;
  }

  if (!email || !isValidEmail(email)) {
    alert("Please enter a valid email address");
    return null;
  }

  if (!phone || !isValidPhone(phone)) {
    alert("Please enter a valid phone number");
    return null;
  }

  if (!address) {
    alert("Please enter your address");
    return null;
  }

  if (!city) {
    alert("Please enter your city");
    return null;
  }

  // Return customer info object if validation passes
  return {
    name: `${fname} ${lname}`,
    email: email,
    phone: phone,
    address: address,
    city: city,
  };
}

// Email validation helper
function isValidEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

// Phone validation helper
function isValidPhone(phone) {
  return /^\d{10}$/.test(phone.replace(/[\s-]/g, ""));
}

// Export functions
window.PaymentHandler = {
  processPayment: function (product) {
    // Validate customer info before proceeding
    const customerInfo = validateCustomerInfo();

    if (customerInfo) {
      return initializePayment(product, customerInfo);
    }

    return null;
  },
};
