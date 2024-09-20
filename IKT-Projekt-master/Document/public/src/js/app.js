let enableNotificationsButtons = document.querySelectorAll('.alert');


if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(() => {
            console.log('service worker registriert')
        })
        .catch(
            err => { console.log(err); }
        );
}

function displayConfirmNotification() {
    if('serviceWorker' in navigator) {
        let options = {
            body: 'You successfully subscribed to our Notification service!',
            icon: '/src/images/icons/icons.png',
            image: '/src/images/icon.jpg',
            lang: 'de-DE',
            vibrate: [100, 50, 200],
            badge: '/src/images/icons/icons.png',
            tag: 'confirm-notification',
            renotify: true,
            actions: [
                { action: 'confirm', title: 'Ok', icon: '/src/images/icons/icons.png' },
                { action: 'cancel', title: 'Cancel', icon: '/src/images/icons/icons.png' },
            ]
        };

        navigator.serviceWorker.ready
            .then( sw => {
                sw.showNotification('Successfully subscribed (from SW)!', options);
            });
    }
}

function configurePushSubscription() {
    if(!('serviceWorker' in navigator)) {
        return
    }

    let swReg;
    navigator.serviceWorker.ready
        .then( sw => {
            swReg = sw;
            return sw.pushManager.getSubscription();
        })
        .then( sub => {
            if(sub === null) {
                // create a new subscription
                let vapidPublicKey = 'BJ7j-7q-GU_OYWU2X1EaqhbBwDPtkir2K33GvkfXs96-gIEZPYIudsqKyAYuwRoE1_Gsj57xQQZGs7RRaRZ9hwk';
                let convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
                return swReg.pushManager.subscribe({
                                        userVisibleOnly: true,
                    applicationServerKey: convertedVapidPublicKey,
                });
            }  else {
                // already subscribed
                sub.unsubscribe()
                .then( () => {
                    console.log('unsubscribed()', sub)
                })
            }
        })
        .then( newSub => {
            return fetch('http://localhost:3000/subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(newSub)
            })
            .then( response => {
                if(response.ok) {
                    displayConfirmNotification();
                }
            })
        });
}


function askForNotificationPermission() {
    Notification.requestPermission( result => {
        console.log('User choice', result);
        if(result !== 'granted') {
            console.log('No notification permission granted');
        } else {
            // displayConfirmNotification();
            configurePushSubscription();
        }
    });
}

if('Notification' in window && 'serviceWorker' in navigator) {
    for(let button of enableNotificationsButtons) {
        button.style.display = 'inline-block';
        button.addEventListener('click', askForNotificationPermission);
    }
}
