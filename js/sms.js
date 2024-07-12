// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBKMUT1Mvums9TZYQSvs2mwaRBg5qFuiz4",
    authDomain: "sms-sender-c293c.firebaseapp.com",
    projectId: "sms-sender-c293c",
    storageBucket: "sms-sender-c293c.appspot.com",
    messagingSenderId: "962610219948",
    appId: "1:962610219948:web:fade71761e059af1e68809"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const database = firebase.database();

document.addEventListener('DOMContentLoaded', function() {
    // Get the current user
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            console.log('User is signed in. UID:', user.uid);

            // Get the user's name and credits from the database
            const userId = user.uid;
            const userRef = database.ref('users').child(userId);

            userRef.once('value', function(snapshot) {
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    const username = userData.username;
                    const credits = userData.credits;

                    // Print the current logged-in user's name and credits
                    console.log('Current user:', username);
                    console.log('Credits:', credits);

                    // Update the welcome message with the user's name and credits
                    document.getElementById('username').textContent = username;
                    document.getElementById('credits').textContent = credits;
                } else {
                    console.error('User data not found');
                }
            });
        } else {
            console.log('User is not signed in');
            window.location.href = 'index.html';
        }
    });
});

function updateAmount() {
    var recipientNumbers = document.getElementById('recipient-numbers').value;
    var amountInput = document.getElementById('amount');
    var commaCount = recipientNumbers.split(',').length - 1; // Count commas in input

    amountInput.value = commaCount + 1; // Set amount to number of commas + 1
}

function validateAndSendSMS() {
    var recipientNumbers = document.getElementById('recipient-numbers').value;
    var recipientNumbersArray = recipientNumbers.split(',');
    var creditsDeduction = 0;
    var isValid = true;

    // Regular expression to match valid country codes
    var validCountryCodes = /^(?:\+1|\+44|\+91|\+61|\+49|\+33|\+48|\+65)$/;

    // Calculate credits deduction based on country code prefixes
    for (var i = 0; i < recipientNumbersArray.length; i++) {
        var number = recipientNumbersArray[i].trim();
        var countryCode = number.substring(0, 3); // Extract country code (e.g., +1, +44, +91, etc.)

        // Adjust for country codes that might include a plus sign
        if (number.startsWith('+') && number.length >= 3) {
            countryCode = number.substring(0, 3);
        } else if (number.startsWith('00') && number.length >= 5) {
            // Adjust for country codes that might use international dialing format (e.g., 0091 for India)
            countryCode = '+' + number.substring(2, 5);
        } else {
            isValid = false;
            break;
        }

        if (!validCountryCodes.test(countryCode)) {
            isValid = false;
            break;
        }

        switch (countryCode) {
            case '+1':
                creditsDeduction += 0.022;
                break;
            case '+44':
                creditsDeduction += 0.048;
                break;
            case '+91':
                creditsDeduction += 0.048;
                break;
            case '+61':
                creditsDeduction += 0.070;
                break;
            case '+49':
                creditsDeduction += 0.12;
                break;
            case '+33':
                creditsDeduction += 0.094;
                break;
            case '+48':
                creditsDeduction += 0.054;
                break;
            case '+65':
                creditsDeduction += 0.047;
                break;
            default:
                isValid = false;
                break;
        }
    }

    if (!isValid) {
        alert("Invalid country code found. Allowed codes are: +1, +44, +91, +61, +49, +33, +48, +65");
        return false; // Prevent form submission
    }

    // Get the current user's credits
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            const userId = user.uid;
            const userRef = database.ref('users').child(userId);

            userRef.once('value', function(snapshot) {
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    const currentCredits = userData.credits;

                    // Check if user has enough credits
                    if (currentCredits >= creditsDeduction) {
                        // Update the credits display
                        document.getElementById('credits').textContent = (currentCredits - creditsDeduction).toFixed(3);

                        // Proceed with form submission
                        document.getElementById('sms-form').submit(); // Submit the form
                    } else {
                        alert("Insufficient credits to send SMS.");
                    }
                } else {
                    console.error('User data not found');
                    window.location.href = 'index.html';
                }
            });
        } else {
            console.log('User is not signed in');
            window.location.href = 'index.html';
        }
    });

    return false; // Prevent default form submission until Firebase operations are complete
}
