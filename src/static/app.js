/**
 * Initializes the activities management application when the DOM is fully loaded.
 * Sets up event listeners and fetches the initial list of activities.
 * 
 * @function
 * @name DOMContentLoaded
 * @listens DOMContentLoaded
 * 
 * @description
 * This module handles:
 * - Fetching and displaying available activities
 * - Adding new activities via modal prompts
 * - User signup for activities
 * - Real-time UI updates with success/error messages
 * - Activity availability tracking
 * 
 * @typedef {Object} Activity
 * @property {string} name - The name of the activity
 * @property {string} description - The activity description
 * @property {string} schedule - When the activity is scheduled
 * @property {number} max_participants - Maximum participant capacity
 * @property {Array} participants - List of participant emails
 * 
 * @inner
 * @function fetchTotalSignups
 * @async
 * @description Fetches the total number of signups from the server
 * @returns {Promise<void>}
 * 
 * @inner
 * @function addActivity
 * @async
 * @description Prompts user for activity details and creates a new activity via API
 * @returns {Promise<void>}
 * 
 * @inner
 * @function fetchActivities
 * @async
 * @description Fetches all activities from the API and populates the UI
 * @returns {Promise<void>}
 * 
 * @inner
 * @function signupForm.submit
 * @async
 * @param {Event} event - The form submission event
 * @description Handles user signup for a selected activity
 * @returns {Promise<void>}
 */
document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

 
  async function fetchTotalSignups() {
    try { 
      const response = await fetch("/activities/total_signups");
      const data = await response.json();
      console.log("Total signups:", data.total_signups);
    } catch (error) {
      console.error("Error en total firmas:", error);
    }
  }


  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      activitiesList.innerHTML = "";

      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        activitiesList.appendChild(activityCard);

        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  
  async function addActivity() {
    const activityName = prompt("Enter activity name:");
    const description = prompt("Enter activity description:");
    const schedule = prompt("Enter activity schedule:");
    const maxParticipants = prompt("Enter max participants:");

    if (!activityName || !description || !schedule || !maxParticipants) {
      messageDiv.textContent = "All fields are required";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      return;
    }

    try {
      const response = await fetch("/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: activityName,
          description,
          schedule,
          max_participants: parseInt(maxParticipants),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = "Activity added successfully";
        messageDiv.className = "success";
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "Error adding activity";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");
      setTimeout(() => messageDiv.classList.add("hidden"), 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to add activity";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error adding activity:", error);
    }
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
