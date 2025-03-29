import { db } from '../config/firebase.js';
import {
  doc,
  collection,
  addDoc,
  serverTimestamp,
  getDoc,
  setDoc,
} from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';
import {
  getStorage,
  ref,
  getDownloadURL,
} from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js';
import { validateForm } from '../helpers/validation.js';
import { showMessage, clearErrors } from '../helpers/contact.js';

document.addEventListener('DOMContentLoaded', function () {
  // Contact form handling
  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Get form values
      const name = document.getElementById('form_name').value.trim();
      const email = document.getElementById('form_email').value.trim();
      const phone = document.getElementById('form_phone').value.trim();
      const message = document.getElementById('form_message').value.trim();

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
          'Thank you! Your message has been sent successfully.',
          'success'
        );
      } catch (error) {
        console.error('Error submitting form:', error);
        showMessage(
          'Sorry, there was an error sending your message. Please try again.',
          'error'
        );
      }
    });
  }

  // Syllabus form handling
  const syllabusForm = document.getElementById('syllabusForm');

  if (syllabusForm) {
    syllabusForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Get form values
      const name = document.getElementById('username').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const message = 'Requested syllabus download';

      clearErrors();

      // Validate form
      if (!validateForm(name, email, phone, message)) {
        return;
      }

      // Submit to Firebase
      try {
        await submitSyllabusQuery(name, email, phone, message);
        // Reset form on success
        syllabusForm.reset();

        // Create message element if it doesn't exist
        let messageContainer = document.querySelector('.syllabus-messages');
        if (!messageContainer) {
          messageContainer = document.createElement('div');
          messageContainer.className = 'syllabus-messages';
          syllabusForm.prepend(messageContainer);
        }

        try {
          const storage = getStorage();
          const syllabusRef = ref(storage, 'syllabus.pdf');
          const downloadURL = await getDownloadURL(syllabusRef);

          window.open(downloadURL, '_blank');
          messageContainer.innerHTML = `<div class="alert alert-success">Downloaded successfully</div>`;
        } catch (downloadError) {
          console.error('Error downloading PDF:', downloadError);
          messageContainer.innerHTML = `<div class="alert alert-danger">Sorry, there was an error downloading the syllabus. Please try again.</div>`;
        }
      } catch (error) {
        console.error('Error submitting syllabus form:', error);
        let messageContainer = document.querySelector('.syllabus-messages');
        if (!messageContainer) {
          messageContainer = document.createElement('div');
          messageContainer.className = 'syllabus-messages';
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
    const docRef = await addDoc(collection(db, "user-queries"), {
      name: name,
      email: email,
      phone: phone,
      message: message,
      timestamp: serverTimestamp(),
      status: 'pending',
    });

    console.log('Query submitted with ID: ', phone);
    return docRef.id;
  } catch (error) {
    console.error('Error submitting query: ', error);
    throw error;
  }
}

async function submitSyllabusQuery(name, email, phone, message) {
  try {
    const docRef = await addDoc(collection(db, "syllabus-queries"), {
      name: name,
      email: email,
      phone: phone,
      message: message,
      timestamp: serverTimestamp(),
      status: 'pending',
    });

    console.log("Query submitted with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error submitting syllabus query: ', error);
    throw error;
  }
}
