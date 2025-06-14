$(document).ready(function () {
  // Common passwords list for dictionary attack simulation
  const commonPasswords = [
    "password", "123456", "password123", "admin", "qwerty", "letmein", "welcome", 
    "monkey", "1234567890", "abc123", "111111", "dragon", "master", "shadow", 
    "jordan", "superman", "harley", "1234567", "hunter", "trust", "ranger", 
    "buster", "thomas", "robert", "soccer", "killer", "hockey", "george", 
    "charlie", "andrew", "michelle", "love", "sunshine", "america", "patrick", 
    "april", "carlos", "joshua", "matthew", "daniel", "starwars", "michael"
  ];

  // Attack scenarios with different capabilities
  const attackScenarios = {
    online: {
      name: "Online Attack",
      guessesPerSecond: 1000, // Throttled by server
      description: "Typical online brute force attack"
    },
    offline: {
      name: "Offline Attack (Fast Hash)",
      guessesPerSecond: 1000000000, // 1 billion - MD5/SHA1
      description: "Fast hash functions like MD5 or SHA1"
    },
    massive: {
      name: "Massive Cracking Operation",
      guessesPerSecond: 350000000000, // 350 billion - specialized hardware
      description: "GPU clusters and specialized hardware"
    }
  };

  let currentScenario = 'offline'; // Default scenario

  // Toggle visibility of sections based on navigation clicks
  $(".nav-links a").on("click", function (e) {
    e.preventDefault();
    const section = $(this).data("section");
    const sectionId = `#${section}Section`;

    $(".textSection").not(sectionId).hide();
    $(sectionId).toggle();
  });

  // Listen for input in the password field
  $("#password").on("input", function () {
    const password = $(this).val();

    if (password === "") {
      resetStrengthIndicator();
      resetPasswordCriteria();
      return;
    }

    const analysis = analyzePassword(password);
    displayPasswordAnalysis(analysis);
    updatePasswordCriteria(password, analysis);
  });

  // Attack scenario selector change
  $("#attackScenario").on("change", function() {
    currentScenario = $(this).val();
    const password = $("#password").val();
    if (password !== "") {
      const analysis = analyzePassword(password);
      displayPasswordAnalysis(analysis);
    }
  });

  // Toggle password visibility
  $("#togglePassword").on("click", function() {
    const passwordField = $("#password");
    const type = passwordField.attr("type");
    
    if (type === "password") {
      passwordField.attr("type", "text");
      $(this).text("🙈 Hide");
    } else {
      passwordField.attr("type", "password");
      $(this).text("👁️ Show");
    }
  });

  // Password generator functionality
  $("#generatePassword").on("click", function() {
    const length = parseInt($("#genLength").val());
    const useUppercase = $("#genUppercase").is(":checked");
    const useLowercase = $("#genLowercase").is(":checked");
    const useNumbers = $("#genNumbers").is(":checked");
    const useSpecial = $("#genSpecial").is(":checked");
    
    const generatedPassword = generateSecurePassword(length, {
      uppercase: useUppercase,
      lowercase: useLowercase,
      numbers: useNumbers,
      special: useSpecial
    });
    
    $("#generatedPassword").val(generatedPassword);
  });

  // Copy generated password to main input
  $("#generatedPassword").on("click", function() {
    $(this).select();
    document.execCommand("copy");
    
    // Optional: Set generated password as the test password
    const generatedPassword = $(this).val();
    if (generatedPassword) {
      $("#password").val(generatedPassword);
      $("#password").trigger("input");
    }
  });

  // Prevent form submission when pressing Enter key
  $("#password").on("keydown", function (e) {
    if (e.key === "Enter" || e.keyCode === 13) {
      e.preventDefault();
    }
  });

  // Comprehensive password analysis function
  function analyzePassword(password) {
    const length = password.length;
    
    // Character set analysis
    const charSets = {
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      digits: /[0-9]/.test(password),
      specialChars: /[^a-zA-Z0-9]/.test(password),
      unicode: /[^\x00-\x7F]/.test(password) // Non-ASCII characters
    };

    // Calculate character space
    let charSpace = 0;
    if (charSets.lowercase) charSpace += 26;
    if (charSets.uppercase) charSpace += 26;
    if (charSets.digits) charSpace += 10;
    if (charSets.specialChars) charSpace += 33; // Updated count
    if (charSets.unicode) charSpace += 100; // Approximation for unicode chars

    // Pattern detection
    const patterns = detectPatterns(password);
    
    // Dictionary check
    const isDictionaryWord = checkDictionaryWords(password);
    
    // Calculate entropy and crack time
    const entropy = calculateEntropy(password, charSpace, patterns, isDictionaryWord);
    const crackTimes = calculateCrackTime(entropy, currentScenario);
    
    // Overall strength assessment
    const strengthScore = calculateStrengthScore(password, entropy, patterns, isDictionaryWord);

    return {
      length,
      charSets,
      charSpace,
      patterns,
      isDictionaryWord,
      entropy,
      crackTimes,
      strengthScore,
      recommendations: generateRecommendations(password, patterns, isDictionaryWord)
    };
  }

  // Enhanced pattern detection
  function detectPatterns(password) {
    const patterns = {
      sequential: false,
      repeated: false,
      keyboard: false,
      dates: false,
      commonSubstitutions: false
    };

    // Sequential characters (abc, 123, etc.)
    patterns.sequential = /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789|012)/i.test(password);
    
    // Repeated characters (aaa, 111, etc.)
    patterns.repeated = /(.)\1{2,}/.test(password);
    
    // Common keyboard patterns
    patterns.keyboard = /(?:qwe|wer|ert|rty|tyu|yui|uio|iop|asd|sdf|dfg|fgh|ghj|hjk|jkl|zxc|xcv|cvb|vbn|bnm|qaz|wsx|edc|rfv|tgb|yhn|ujm)/i.test(password);
    
    // Date patterns (1990, 2020, etc.)
    patterns.dates = /(?:19|20)\d{2}/.test(password);
    
    // Common substitutions (@=a, 3=e, 1=i, 0=o, 5=s)
    patterns.commonSubstitutions = /@|3(?=.*[a-z])|1(?=.*[a-z])|0(?=.*[a-z])|5(?=.*[a-z])/.test(password);

    return patterns;
  }

  // Dictionary word checking
  function checkDictionaryWords(password) {
    const lowerPassword = password.toLowerCase();
    
    // Check for exact matches
    if (commonPasswords.includes(lowerPassword)) {
      return { exact: true, partial: false };
    }
    
    // Check for partial matches or with simple modifications
    for (let word of commonPasswords) {
      if (lowerPassword.includes(word) || word.includes(lowerPassword)) {
        return { exact: false, partial: true };
      }
    }
    
    // Check for leet speak variations
    const leetVariations = lowerPassword
      .replace(/0/g, 'o')
      .replace(/1/g, 'i')
      .replace(/3/g, 'e')
      .replace(/4/g, 'a')
      .replace(/5/g, 's')
      .replace(/7/g, 't')
      .replace(/@/g, 'a');
    
    if (commonPasswords.includes(leetVariations)) {
      return { exact: false, partial: true, leetSpeak: true };
    }
    
    return { exact: false, partial: false };
  }

  // Enhanced entropy calculation
  function calculateEntropy(password, charSpace, patterns, isDictionaryWord) {
    let baseEntropy = Math.log2(Math.pow(charSpace, password.length));
    
    // Reduce entropy for patterns and dictionary words
    let entropyReduction = 0;
    
    if (isDictionaryWord.exact) {
      entropyReduction += baseEntropy * 0.8; // Massive reduction for exact dictionary matches
    } else if (isDictionaryWord.partial) {
      entropyReduction += baseEntropy * 0.4; // Significant reduction for partial matches
    }
    
    // Pattern-based reductions
    if (patterns.sequential) entropyReduction += baseEntropy * 0.2;
    if (patterns.repeated) entropyReduction += baseEntropy * 0.3;
    if (patterns.keyboard) entropyReduction += baseEntropy * 0.25;
    if (patterns.dates) entropyReduction += baseEntropy * 0.15;
    if (patterns.commonSubstitutions) entropyReduction += baseEntropy * 0.1;
    
    return Math.max(baseEntropy - entropyReduction, 1); // Minimum entropy of 1
  }

  // Calculate crack time for different scenarios
  function calculateCrackTime(entropy, scenario) {
    const guessesPerSecond = attackScenarios[scenario].guessesPerSecond;
    const averageGuesses = Math.pow(2, entropy - 1); // Average case (half the keyspace)
    const worstCaseGuesses = Math.pow(2, entropy); // Worst case (full keyspace)
    
    const averageSeconds = averageGuesses / guessesPerSecond;
    const worstCaseSeconds = worstCaseGuesses / guessesPerSecond;
    
    return {
      average: {
        seconds: averageSeconds,
        minutes: averageSeconds / 60,
        hours: averageSeconds / 3600,
        days: averageSeconds / (3600 * 24),
        years: averageSeconds / (3600 * 24 * 365.25)
      },
      worstCase: {
        seconds: worstCaseSeconds,
        minutes: worstCaseSeconds / 60,
        hours: worstCaseSeconds / 3600,
        days: worstCaseSeconds / (3600 * 24),
        years: worstCaseSeconds / (3600 * 24 * 365.25)
      }
    };
  }

  // Calculate overall strength score (0-100)
  function calculateStrengthScore(password, entropy, patterns, isDictionaryWord) {
    let score = 0;
    
    // Length scoring (0-25 points)
    if (password.length >= 12) score += 25;
    else if (password.length >= 8) score += 15;
    else if (password.length >= 6) score += 8;
    else score += password.length;
    
    // Character diversity (0-25 points)
    let charTypes = 0;
    if (/[a-z]/.test(password)) charTypes++;
    if (/[A-Z]/.test(password)) charTypes++;
    if (/[0-9]/.test(password)) charTypes++;
    if (/[^a-zA-Z0-9]/.test(password)) charTypes++;
    score += charTypes * 6.25;
    
    // Entropy bonus (0-30 points)
    if (entropy >= 60) score += 30;
    else if (entropy >= 40) score += 20;
    else if (entropy >= 25) score += 10;
    else score += entropy * 0.4;
    
    // Pattern penalties
    if (patterns.sequential) score -= 10;
    if (patterns.repeated) score -= 15;
    if (patterns.keyboard) score -= 12;
    if (patterns.dates) score -= 8;
    if (patterns.commonSubstitutions) score -= 5;
    
    // Dictionary penalties
    if (isDictionaryWord.exact) score -= 30;
    else if (isDictionaryWord.partial) score -= 15;
    
    // Uniqueness bonus (0-20 points)
    const uniqueChars = new Set(password).size;
    score += Math.min(uniqueChars * 1.5, 20);
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  // Generate personalized recommendations
  function generateRecommendations(password, patterns, isDictionaryWord) {
    const recommendations = [];
    
    if (password.length < 12) {
      recommendations.push("Increase length to at least 12 characters");
    }
    
    if (!/[a-z]/.test(password)) {
      recommendations.push("Add lowercase letters");
    }
    
    if (!/[A-Z]/.test(password)) {
      recommendations.push("Add uppercase letters");
    }
    
    if (!/[0-9]/.test(password)) {
      recommendations.push("Add numbers");
    }
    
    if (!/[^a-zA-Z0-9]/.test(password)) {
      recommendations.push("Add special characters (!@#$%^&* etc.)");
    }
    
    if (patterns.sequential) {
      recommendations.push("Avoid sequential characters (abc, 123)");
    }
    
    if (patterns.repeated) {
      recommendations.push("Avoid repeated characters (aaa, 111)");
    }
    
    if (patterns.keyboard) {
      recommendations.push("Avoid keyboard patterns (qwerty, asdf)");
    }
    
    if (patterns.dates) {
      recommendations.push("Avoid using years or dates");
    }
    
    if (isDictionaryWord.exact || isDictionaryWord.partial) {
      recommendations.push("Avoid common words and dictionary terms");
    }
    
    if (recommendations.length === 0) {
      recommendations.push("Excellent! Your password follows security best practices");
    }
    
    return recommendations;
  }

  // Display password analysis results  
  function displayPasswordAnalysis(analysis) {
    // Update time display
    $("#time").text(getReadableTime(analysis.crackTimes.average));
    $("#worstCaseTime").text(getReadableTime(analysis.crackTimes.worstCase));
    
    // Update strength indicator
    updateStrengthIndicator(analysis.strengthScore, analysis.entropy);
    
    // Update entropy display
    $("#entropy").text(`${analysis.entropy.toFixed(1)} bits`);
    
    // Update character space
    $("#charSpace").text(analysis.charSpace);
    
    // Update attack scenario info
    $("#scenarioName").text(attackScenarios[currentScenario].name);
    $("#scenarioDesc").text(attackScenarios[currentScenario].description);
    
    // Update recommendations
    updateRecommendations(analysis.recommendations);
    
    // Update pattern warnings
    updatePatternWarnings(analysis.patterns, analysis.isDictionaryWord);
  }

  // Function to check the password size and character types
  function updatePasswordCriteria(password, analysis) {
    const length = password.length;
    $("#charSize").text(length);

    // Update criteria checks with enhanced logic
    updateCriteriaColor("#upperCase", analysis.charSets.uppercase);
    updateCriteriaColor("#lowerCase", analysis.charSets.lowercase);  
    updateCriteriaColor("#numbers", analysis.charSets.digits);
    updateCriteriaColor("#char", analysis.charSets.specialChars);
    updateCriteriaColor("#minLength", length >= 12);
  }

  // Helper function to update criteria color
  function updateCriteriaColor(selector, condition) {
    if (condition) {
      $(selector).css("color", "green").find(".check-icon").text("✓");
    } else {
      $(selector).css("color", "#989292").find(".check-icon").text("✗");
    }
  }

  // Enhanced strength indicator
  function updateStrengthIndicator(score, entropy) {
    let strengthText = "";
    let color = "";
    let bgColor = "";
    
    if (score >= 80) {
      strengthText = "Very Strong";
      color = "white";
      bgColor = "#27ae60"; // Green
    } else if (score >= 60) {
      strengthText = "Strong";
      color = "white";
      bgColor = "#3498db"; // Blue  
    } else if (score >= 40) {
      strengthText = "Moderate";
      color = "black";
      bgColor = "#f39c12"; // Orange
    } else if (score >= 20) {
      strengthText = "Weak";
      color = "white";
      bgColor = "#e74c3c"; // Red
    } else {
      strengthText = "Very Weak";
      color = "white";
      bgColor = "#c0392b"; // Dark red
    }

    $(".strength").css({
      "background-color": bgColor,
      "color": color
    }).html(`${strengthText}<br><small>Score: ${score}/100</small>`);
  }

  // Update recommendations display
  function updateRecommendations(recommendations) {
    const recList = $("#recommendations");
    recList.empty();
    
    recommendations.forEach(rec => {
      recList.append(`<li>${rec}</li>`);
    });
  }

  // Update pattern warnings
  function updatePatternWarnings(patterns, isDictionaryWord) {
    const warnings = $("#warnings");
    warnings.empty();
    
    if (patterns.sequential) {
      warnings.append('<li class="warning">⚠️ Contains sequential characters</li>');
    }
    
    if (patterns.repeated) {
      warnings.append('<li class="warning">⚠️ Contains repeated characters</li>');
    }
    
    if (patterns.keyboard) {
      warnings.append('<li class="warning">⚠️ Contains keyboard patterns</li>');
    }
    
    if (patterns.dates) {
      warnings.append('<li class="warning">⚠️ Contains date patterns</li>');
    }
    
    if (isDictionaryWord.exact) {
      warnings.append('<li class="warning">⚠️ Matches common password</li>');
    } else if (isDictionaryWord.partial) {
      warnings.append('<li class="warning">⚠️ Contains common words</li>');
    }
    
    if (warnings.children().length === 0) {
      warnings.append('<li class="success">✅ No common patterns detected</li>');
    }
  }

  // Function to reset the strength indicator
  function resetStrengthIndicator() {
    $(".strength").css({"background-color": "#989292", "color": "white"}).text("No Password");
    $("#time").text("0 Seconds");
    $("#worstCaseTime").text("0 Seconds");
    $("#entropy").text("0 bits");
    $("#charSpace").text("0");
    $("#recommendations").empty();
    $("#warnings").empty();
  }

  // Function to reset the password criteria colors
  function resetPasswordCriteria() {
    $("#upperCase, #lowerCase, #numbers, #char, #minLength").css("color", "#989292").find(".check-icon").text("✗");
    $("#charSize").text("0");
  }

  // Enhanced readable time formatting
  function getReadableTime({ seconds, minutes, hours, days, years }) {
    if (seconds < 1) {
      return "Instantly";
    } else if (seconds < 60) {
      return `${seconds.toExponential(2)} seconds`;
    } else if (minutes < 60) {
      return `${minutes.toFixed(1)} minutes`;
    } else if (hours < 24) {
      return `${hours.toFixed(1)} hours`;
    } else if (days < 365) {
      return `${days.toFixed(1)} days`;
    } else if (years < 1000000) {
      return `${years.toExponential(2)} years`;
    } else {
      return "Practically unbreakable";
    }
  }

  // Secure password generator
  function generateSecurePassword(length, options) {
    let charset = '';
    
    if (options.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (options.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (options.numbers) charset += '0123456789';
    if (options.special) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (charset === '') {
      charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    }
    
    let password = '';
    
    // Ensure at least one character from each selected category
    if (options.lowercase) password += getRandomChar('abcdefghijklmnopqrstuvwxyz');
    if (options.uppercase) password += getRandomChar('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    if (options.numbers) password += getRandomChar('0123456789');
    if (options.special) password += getRandomChar('!@#$%^&*()_+-=[]{}|;:,.<>?');
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += getRandomChar(charset);
    }
    
    // Shuffle the password to avoid predictable patterns
    return shuffleString(password);
  }

  // Get random character from charset
  function getRandomChar(charset) {
    return charset.charAt(Math.floor(Math.random() * charset.length));
  }

  // Shuffle string characters
  function shuffleString(str) {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  }
});
