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

// Handle form submission
document.getElementById('register-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            // Add user details to Firebase Realtime Database
            firebase.database().ref('users/admin/' + user.uid).set({
                username: username,
                email: email
            });

            //alert('Admin registered successfully!');
        })
        .catch((error) => {
            //console.error('Error registering admin:', error);
            alert('Something went wrong');
        });
});
