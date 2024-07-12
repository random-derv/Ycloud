// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBKMUT1Mvums9TZYQSvs2mwaRBg5qFuiz4",
    authDomain: "sms-sender-c293c.firebaseapp.com",
    projectId: "sms-sender-c293c",
    storageBucket: "sms-sender-c293c.appspot.com",
    messagingSenderId: "962610219948",
    appId: "1:962610219948:web:fade71761e059af1e68809"
};

firebase.initializeApp(firebaseConfig);

const database = firebase.database();

function fetchAndDisplayUserInfo() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            console.log('User is signed in. UID:', user.uid);

            const userId = user.uid;
            const userRef = database.ref('users').child(userId);

            // Fetch user data
            userRef.once('value', function (snapshot) {
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    // bellow it is using for get current credit
                    // console.log('User data retrieved:', userData);

                    // Display user information on the page
                    displayUserInfo(userData);
                    // Display user credits
                    displayUserCredits(userData);

                    // Start polling for credit changes
                    startCreditPolling(userId);

                    // Hide loader once data is available
                    document.getElementById('loaderContainer').style.display = 'none';
                } else {
                    //here bellow if user data is not found
                    window.location.href = 'index.html';
                }
            });
        } else {
            // User is not signed in, redirect to login page
            console.log('User is not signed in');
            window.location.href = 'index.html';
        }
    });
}

// Function to display user information
function displayUserInfo(userData) {
    console.log('Displaying user information:', userData);

    const userInfoContainer = document.getElementById('user-info-container');

    // Create elements to display user information
    const userInfoElement = document.createElement('div');
    userInfoElement.classList.add('user-info');
    userInfoElement.innerHTML = `
        <strong>Welcome,</strong> ${userData.username}!
    `;

    // Append the user information element to the container
    userInfoContainer.innerHTML = ''; // Clear previous content
    userInfoContainer.appendChild(userInfoElement);
}

// Function to display user credits
function displayUserCredits(userData) {
    const userCreditsContainer = document.getElementById('user-credits-container');

    const userCreditsElement = document.createElement('div');
    userCreditsElement.classList.add('user-credits');
    userCreditsElement.innerHTML = `
        <strong>Credits:</strong> $${userData.credits}
    `;

    userCreditsContainer.innerHTML = ''; // Clear previous content
    userCreditsContainer.appendChild(userCreditsElement);
}

function startCreditPolling(userId) {
    setInterval(() => {
        const userRef = database.ref('users').child(userId);
        userRef.once('value', function (snapshot) {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                const userCreditsContainer = document.querySelector('.user-credits');
                userCreditsContainer.innerHTML = `
                    <strong>Credits:</strong> $${userData.credits}
                `;
            } else {
                console.error('User data not found');
            }
        });
    }, 1000); 
}

document.getElementById('logoutBtn').addEventListener('click', function () {
    firebase.auth().signOut().then(function () {
        window.location.href = 'index.html';
    }).catch(function (error) {
        console.error('Error signing out');
    });
});

document.getElementById('sendBtn').addEventListener('click', function () {
    const userCreditsContainer = document.querySelector('.user-credits');
    const creditsText = userCreditsContainer.textContent;
    const credits = parseFloat(creditsText.replace('Credits: $', ''));

    if (credits > 0) {
        // Redirect to sms.html
        window.location.href = 'sms.html';
    } else {
        // Show low credits dialog
        document.getElementById('lowCreditsDialog').showModal();
    }
});

document.getElementById('pricingLink').addEventListener('click', function (event) {
    event.preventDefault();  
    document.getElementById('pricingDialog').showModal();
});

// Close pricing dialog when the Close button is clicked
document.getElementById('closeDialogBtn').addEventListener('click', function () {
    document.getElementById('pricingDialog').close();
});

document.getElementById('telegramLink').addEventListener('click', function (event) {
    event.preventDefault();
    window.open('https://t.me/nabarup_dev', '_blank');
});

// Low Credits Dialog buttons
document.getElementById('closeLowCreditsDialogBtn').addEventListener('click', function () {
    document.getElementById('lowCreditsDialog').close();
});

document.getElementById('contactAdminBtn').addEventListener('click', function () {
    window.open('https://t.me/nabarup_dev', '_blank');
});

// Show loader when the page loads
document.getElementById('loaderContainer').style.display = 'flex';

fetchAndDisplayUserInfo();
