$(document).ready(function () {
    // Listen for input in the password field
    $('#password').on('input', function () {
        const password = $(this).val();
        const guessesPerSecond = 2500000000; // 2.5 billion guesses per second

        // Check if the password field is empty
        if (password === "") {
            resetStrengthIndicator();
            return;
        }

        const result = calculateCrackTime(password, guessesPerSecond);

        // Display the estimated time in a readable format
        $('#time').text(getReadableTime(result));

        // Update strength color based on timeInSeconds
        strengthcolor(result.seconds);
    });

    // Prevent form submission when pressing Enter key
    $('#password').on('keydown', function (e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            e.preventDefault();
        }
    });

    function calculateCrackTime(password, guessesPerSecond) {
        const lowercase = 26;
        const uppercase = 26;
        const digits = 10;
        const specialChars = 32;

        let characterSetSize = 0;
        if (/[a-z]/.test(password)) characterSetSize += lowercase;
        if (/[A-Z]/.test(password)) characterSetSize += uppercase;
        if (/[0-9]/.test(password)) characterSetSize += digits;
        if (/[^a-zA-Z0-9]/.test(password)) characterSetSize += specialChars;

        const totalCombinations = Math.pow(characterSetSize, password.length);
        const timeInSeconds = totalCombinations / guessesPerSecond;
        const minutes = timeInSeconds / 60;
        const hours = timeInSeconds / 3600;
        const days = timeInSeconds / (3600 * 24);
        const years = timeInSeconds / (3600 * 24 * 365);

        return { seconds: timeInSeconds, minutes, hours, days, years };
    }

    function strengthcolor(timeInSeconds) {
        let strengthText = "";
        let color = "";

        if (timeInSeconds < 60) {
            strengthText = "Very Weak";
            color = "red";
        } else if (timeInSeconds >= 60 && timeInSeconds < 3600) {
            strengthText = "Weak";
            color = "orange";
        } else if (timeInSeconds >= 3600 && timeInSeconds < 86400) {
            strengthText = "Moderate";
            color = "yellow";
        } else if (timeInSeconds >= 86400 && timeInSeconds < 31536000) {
            strengthText = "Strong";
            color = "green";
        } else {
            strengthText = "Very Strong";
            color = "blue";
        }

        $(".strength").css("background-color", color);
        $(".strength").text(strengthText);
    }

    // Function to reset the strength indicator
    function resetStrengthIndicator() {
        $(".strength").css("background-color", "#989292");
        $(".strength").text("No Password");
        $('#time').text("");
    }

    function getReadableTime({ seconds, minutes, hours, days, years }) {
        if (seconds < 100) {
            return `${seconds.toFixed(2)} Seconds`;
        } else if (seconds >= 100 && minutes < 100) {
            return `${minutes.toFixed(2)} Minutes`;
        } else if (minutes >= 100 && hours <= 48) {
            return `${hours.toFixed(2)} Hours`;
        } else if (hours > 48 && days < 400) {
            return `${days.toFixed(2)} Days`;
        } else if (days >= 400) {
            return `${years.toFixed(2)} Years`;
        }
    }
 
});


