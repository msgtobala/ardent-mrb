import { db } from "../config/firebase.js";
import {
  doc,
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { validateForm } from "../helpers/validation.js";
import { showMessage } from "../helpers/contact.js";

document.addEventListener("DOMContentLoaded", function () {
  const contactForm = document.getElementById("contact-form");

  if (contactForm) {
    contactForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Get form values
      const name = document.getElementById("form_name").value.trim();
      const email = document.getElementById("form_email").value.trim();
      const phone = document.getElementById("form_phone").value.trim();
      const message = document.getElementById("form_message").value.trim();

      // Validate form
      if (!validateForm(name, email, phone, message)) {
        return;
      }

      // Submit to Firebase
      try {
        await submitQuery(name, email, phone, message);
        // Reset form on success
        contactForm.reset();
        showMessage(
          "Thank you! Your message has been sent successfully.",
          "success"
        );
      } catch (error) {
        console.error("Error submitting form:", error);
        showMessage(
          "Sorry, there was an error sending your message. Please try again.",
          "error"
        );
      }
    });
  }
});

// Submit query to Firestore
async function submitQuery(name, email, phone, message) {
  try {
    // Add a new document with auto-generated id
    const docRef = await addDoc(collection(db, "user-queries"), {
      name: name,
      email: email,
      phone: phone,
      message: message,
      timestamp: serverTimestamp(), // Add server timestamp
    });

    console.log("Query submitted with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error submitting query: ", error);
    throw error;
  }
}
