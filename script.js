$(document).ready(function () {
  const guessesPerSecond = 2500000000; // 2.5 billion guesses per second

  // Toggle visibility of sections based on navigation clicks
  $(".nav-links a").on("click", function (e) {
    e.preventDefault(); // Prevent default anchor behavior
    const section = $(this).data("section"); // Get the section name from data attribute
    const sectionId = `#${section}Section`;

    // Toggle visibility of the clicked section and hide others
    $(".textSection").not(sectionId).hide(); // Hide all other sections
    $(sectionId).toggle(); // Toggle the clicked section's visibility
  });

  // Listen for input in the password field
  $("#password").on("input", function () {
    const password = $(this).val();

    if (password === "") {
      resetStrengthIndicator();
      resetPasswordCriteria();
      return;
    }

    const result = calculateCrackTime(password, guessesPerSecond);

    // Display the estimated time in a readable format
    $("#time").text(getReadableTime(result));

    // Update strength color based on timeInSeconds
    updateStrengthColor(result.seconds);

    // Update the password size and criteria checks
    updatePasswordCriteria(password);
  });

  // Prevent form submission when pressing Enter key
  $("#password").on("keydown", function (e) {
    if (e.key === "Enter" || e.keyCode === 13) {
      e.preventDefault();
    }
  });

  // Function to check the password size and character types
  function updatePasswordCriteria(password) {
    const length = password.length;
    $("#charSize").text(length);

    // Update criteria checks
    updateCriteriaColor("#upperCase", /[A-Z]/.test(password));
    updateCriteriaColor("#lowerCase", /[a-z]/.test(password));
    updateCriteriaColor("#numbers", /[0-9]/.test(password));
    updateCriteriaColor("#char", /[^a-zA-Z0-9]/.test(password));
  }

  // Helper function to update criteria color
  function updateCriteriaColor(selector, condition) {
    $(selector).css("color", condition ? "green" : "#989292");
  }

  // Function to calculate password crack time
  function calculateCrackTime(password, guessesPerSecond) {
    const charSetSizes = {
      lowercase: 26,
      uppercase: 26,
      digits: 10,
      specialChars: 32,
    };

    let characterSetSize = 0;
    if (/[a-z]/.test(password)) characterSetSize += charSetSizes.lowercase;
    if (/[A-Z]/.test(password)) characterSetSize += charSetSizes.uppercase;
    if (/[0-9]/.test(password)) characterSetSize += charSetSizes.digits;
    if (/[^a-zA-Z0-9]/.test(password)) characterSetSize += charSetSizes.specialChars;

    const totalCombinations = Math.pow(characterSetSize, password.length);
    const timeInSeconds = totalCombinations / guessesPerSecond;

    return {
      seconds: timeInSeconds,
      minutes: timeInSeconds / 60,
      hours: timeInSeconds / 3600,
      days: timeInSeconds / (3600 * 24),
      years: timeInSeconds / (3600 * 24 * 365),
    };
  }

  // Function to update strength color based on time
  function updateStrengthColor(timeInSeconds) {
    let strengthText = "";
    let color = "";

    if (timeInSeconds < 60) {
      strengthText = "Very Weak";
      color = "red";
    } else if (timeInSeconds < 3600) {
      strengthText = "Weak";
      color = "orange";
    } else if (timeInSeconds < 86400) {
      strengthText = "Moderate";
      color = "yellow";
    } else if (timeInSeconds < 31536000) {
      strengthText = "Strong";
      color = "green";
    } else {
      strengthText = "Very Strong";
      color = "blue";
    }

    $(".strength").css("background-color", color).text(strengthText);
  }

  // Function to reset the strength indicator
  function resetStrengthIndicator() {
    $(".strength").css("background-color", "#989292").text("No Password");
    $("#time").text("0 Seconds");
  }

  // Function to reset the password criteria colors
  function resetPasswordCriteria() {
    $("#upperCase, #lowerCase, #numbers, #char").css("color", "#000");
    $("#charSize").text("0");
  }

  // Function to convert time into readable format
  function getReadableTime({ seconds, minutes, hours, days, years }) {
    if (seconds < 100) {
      return `${seconds.toFixed(2)} Seconds`;
    } else if (minutes < 100) {
      return `${minutes.toFixed(2)} Minutes`;
    } else if (hours <= 48) {
      return `${hours.toFixed(2)} Hours`;
    } else if (days < 400) {
      return `${days.toFixed(2)} Days`;
    } else {
      return `${years.toFixed(2)} Years`;
    }
  }
});
