importScripts("https://www.gstatic.com/firebasejs/11.0.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.0.2/firebase-messaging-compat.js");


firebase.initializeApp({

    apiKey: "AIzaSyCFhiGq4dQqcUuuSLMuRq8VjTthB7WBStY",
    authDomain: "nivers-31888.firebaseapp.com",
    projectId: "nivers-31888",
    storageBucket: "nivers-31888.firebasestorage.app",
    messagingSenderId: "499784849117",
    appId: "1:499784849117:web:155ebd61d7f00174ee6d34"

});


const messaging = firebase.messaging();


messaging.onBackgroundMessage((payload) => {
    console.log(
        "Mensagem recebida em segundo plano:",
        payload
    );

    const notificationTitle = payload.notification.title;
    const notificationOptions = {

        body: payload.notification.body,
        icon: "/image/icon-nivers.png"

    };

    self.registration.showNotification(
        notificationTitle,
        notificationOptions
    );
});