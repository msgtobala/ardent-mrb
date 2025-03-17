document.getElementById("payment-btn").onclick = function (e) {
  var options = {
    key: "rzp_test_YOUR_KEY_ID", // Replace with your key
    amount: "5000", // Amount is in currency subunits (100 = ₹1)
    currency: "INR",
    name: "Ardent MDS",
    description: "Test Transaction",
    image: "your_logo_url",
    handler: function (response) {
      alert("Payment ID: " + response.razorpay_payment_id);
      // Handle success - send payment ID to your server
    },
    prefill: {
      name: "Customer Name",
      email: "customer@example.com",
      contact: "9999999999",
    },
    theme: {
      color: "#3399cc",
    },
  };

  var rzp1 = new Razorpay(options);
  rzp1.open();
  e.preventDefault();
};
