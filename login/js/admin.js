// Firebase configuration (replace with your own config)
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

// Show loader
function showLoader() {
    document.getElementById('loader-container').style.display = 'flex';
}

// Hide loader
function hideLoader() {
    document.getElementById('loader-container').style.display = 'none';
}

// Load users and populate table
function loadUsers(users) {
    const userTableBody = document.getElementById('user-table').getElementsByTagName('tbody')[0];
    userTableBody.innerHTML = ''; // Clear existing rows

    // Convert users object to an array and sort by email
    const sortedUsers = Object.keys(users)
        .filter(userId => !userId.startsWith('admin')) // Exclude admin users
        .map(userId => ({ userId, ...users[userId] }))
        .sort((a, b) => a.email.localeCompare(b.email));

    // Get the search query
    const searchQuery = document.getElementById('search-input').value.toLowerCase();

    // Filter and display users based on the search query
    sortedUsers.forEach(user => {
        if (user.email.toLowerCase().includes(searchQuery) || user.username.toLowerCase().includes(searchQuery)) {
            const row = userTableBody.insertRow();
            row.insertCell(0).textContent = user.email;
            row.insertCell(1).textContent = user.username;
            const creditsCell = row.insertCell(2);
            creditsCell.textContent = user.credits;

            const actionsCell = row.insertCell(3);
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.setAttribute('data-user-id', user.userId);
            editButton.setAttribute('data-credits', user.credits);
            editButton.classList.add('edit-button'); // Add edit button class
            editButton.addEventListener('click', openEditCredits);
            actionsCell.appendChild(editButton);

            const editContainer = document.createElement('div');
            editContainer.classList.add('edit-container');
            editContainer.style.display = 'none';

            const creditsInput = document.createElement('input');
            creditsInput.type = 'number';
            creditsInput.value = user.credits;
            creditsInput.classList.add('credits-input');
            editContainer.appendChild(creditsInput);

            const updateButton = document.createElement('button');
            updateButton.textContent = 'Update';
            updateButton.classList.add('update-button');
            updateButton.addEventListener('click', updateCredits);
            editContainer.appendChild(updateButton);

            const cancelButton = document.createElement('button');
            cancelButton.textContent = 'Cancel';
            cancelButton.classList.add('cancel-button');
            cancelButton.addEventListener('click', cancelEdit);
            editContainer.appendChild(cancelButton);

            actionsCell.appendChild(editContainer);
        }
    });

    hideLoader(); // Hide the loader once the users are loaded
}

function openEditCredits(event) {
    const editContainer = event.target.nextElementSibling;
    event.target.style.display = 'none';
    editContainer.style.display = 'flex';
}

function updateCredits(event) {
    const editContainer = event.target.parentNode;
    const userId = editContainer.previousElementSibling.getAttribute('data-user-id');
    const newCredits = editContainer.querySelector('.credits-input').value;
    const userRef = database.ref('users/' + userId);
    userRef.update({ credits: newCredits })
        .then(() => {
            alert('Credits updated successfully');
        })
        .catch((error) => {
            //console.error('Error updating credits:', error);
            alert('Error updating credits');
        });
}

function cancelEdit(event) {
    const editContainer = event.target.parentNode;
    const editButton = editContainer.previousElementSibling;
    editButton.style.display = 'block';
    editContainer.style.display = 'none';
}

function displayAdminUsername() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            console.log("Logged in user details:", user); // Log current user details
            const adminRef = database.ref('users/admin/' + user.uid);
            adminRef.once('value', (snapshot) => {
                const adminData = snapshot.val();
                if (adminData) {
                    document.getElementById('admin-username-span').textContent = adminData.username;
                }
            });
        } else {
            // Redirect to admin login if the user is not authenticated
            window.location.href = 'admin-login.html';
        }
    });
}

window.onload = function() {
    showLoader(); // Show the loader when the page is loaded
    displayAdminUsername();
};

// Listen for changes in the users data
database.ref('users').on('value', (snapshot) => {
    const users = snapshot.val();
    loadUsers(users);
});

// Add event listener for search input
document.getElementById('search-input').addEventListener('input', () => {
    const usersRef = database.ref('users');
    usersRef.once('value', (snapshot) => {
        const users = snapshot.val();
        loadUsers(users);
    });
});

document.getElementById('logout-button').addEventListener('click', function () {
    firebase.auth().signOut().then(function () {
        window.location.href = 'admin-login.html';
    }).catch(function (error) {
        console.error('Error signing out');
    });
});
