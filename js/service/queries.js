import { db } from "../config/firebase.js";
import {
  doc,
  collection,
  addDoc,
  serverTimestamp,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { validateForm } from "../helpers/validation.js";
import { showMessage, clearErrors, displayError } from "../helpers/contact.js";

document.addEventListener("DOMContentLoaded", function () {
  // Contact form handling
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

  // Syllabus form handling
  const syllabusForm = document.getElementById("syllabusForm");

  if (syllabusForm) {
    syllabusForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Get form values
      const name = document.getElementById("username").value.trim();
      const email = document.getElementById("email").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const message = "Requested syllabus download"; // Default message for syllabus requests

      // Clear any previous error messages
      clearErrors();

      // Validate form
      if (!validateForm(name, email, phone, message)) {
        return;
      }

      // Submit to Firebase
      try {
        await submitQuery(name, email, phone, message);
        // Reset form on success
        syllabusForm.reset();

        // Create message element if it doesn't exist
        let messageContainer = document.querySelector(".syllabus-messages");
        if (!messageContainer) {
          messageContainer = document.createElement("div");
          messageContainer.className = "syllabus-messages";
          syllabusForm.prepend(messageContainer);
        }

        // Show success message
        messageContainer.innerHTML = `<div class="alert alert-success">Thank you! Your syllabus download request has been received. We'll send it to you shortly.</div>`;

        // Hide the modal after a short delay
        setTimeout(() => {
          const syllabusModal = bootstrap.Modal.getInstance(
            document.getElementById("syllabusModal")
          );
          if (syllabusModal) {
            syllabusModal.hide();
          }
          // Clear the message after hiding
          setTimeout(() => {
            messageContainer.innerHTML = "";
          }, 1000);
        }, 2000);
      } catch (error) {
        console.error("Error submitting syllabus form:", error);

        // Create message element if it doesn't exist
        let messageContainer = document.querySelector(".syllabus-messages");
        if (!messageContainer) {
          messageContainer = document.createElement("div");
          messageContainer.className = "syllabus-messages";
          syllabusForm.prepend(messageContainer);
        }

        // Show error message
        messageContainer.innerHTML = `<div class="alert alert-danger">Sorry, there was an error processing your request. Please try again.</div>`;
      }
    });
  }
});

async function submitQuery(name, email, phone, message) {
  try {
    const docRef = doc(db, "user-queries", phone);

    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("Document already exists with phone: ", phone);
      return phone;
    }

    await setDoc(docRef, {
      name: name,
      email: email,
      phone: phone,
      message: message,
      timestamp: serverTimestamp(),
    });

    console.log("Query submitted with ID: ", phone);
    return phone;
  } catch (error) {
    console.error("Error submitting query: ", error);
    throw error;
  }
}
