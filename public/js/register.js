/** Activate region */
$('.js--checkbox-active').on('click', function(e) {
    var idActivate = $(this).data('target');

    if($(this).is(':checked')) {
        $('#' + idActivate).show();
    } else {
        $('#' + idActivate).hide();
    }
});

function getCurrentData() {
    var data = {};

    var howMany = parseInt($('.js--how-many-guilds').val());

    $('.js--chose-region').each(function(i, item) {
        if($(item).is(':checked')) {
            var region = $(item).data('region');
            data[region] = howMany;
        }
    });

    return data;
}

/** Submit Form */
var swRegistration = null;
var serviceWorkerEnabled = false;
var isSubscribed = false;

var button = $('.js--submit-button');
console.log(button);

if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log('Service Worker and Push is supported');
    serviceWorkerEnabled = true;

    navigator.serviceWorker.register('sw.js')
        .then(function (swReg) {
            serviceWorkerEnabled = true;
            console.log('Service Worker is registered', swReg);
            swRegistration = swReg;
            initialiseUi();
        })
        .catch(function (error) {
            console.error('Service Worker Error', error);
            serviceWorkerEnabled = 'An error has occurred';
            reloadUi();
        });
} else {
    console.warn('Push messaging is not supported');
    serviceWorkerEnabled = 'Push messaging is not supported';
    reloadUi();
}

function reloadUi() {
    if (serviceWorkerEnabled !== true) {
        button.text(serviceWorkerEnabled);
        button.addClass('btn-danger');
        button.removeClass('btn-success');
        button.attr('disabled', true);
        return;
    }

    button.removeAttr('disabled');
    if (isSubscribed) {
        button.text('Disable notification');
        button.addClass('btn-warning');
        button.removeClass('btn-success');
    } else {
        button.text('Enable notification');
        button.removeClass('btn-warning');
        button.addClass('btn-success');
    }
}

function initialiseUi() {
    button.on('click', function (e) {
        button.attr('disabled', true);
        if (isSubscribed) {
            unsubscribeUser();
        } else {
            subscribeUser();
        }
    });

    // Set the initial subscription value
    swRegistration.pushManager.getSubscription()
        .then(function (subscription) {
            isSubscribed = !(subscription === null);
            reloadUi();
        });
}

function subscribeUser() {
    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
    swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
    }).then(function (subscription) {
        console.log(subscription);
        $.post('/ajax/register', {subscription: subscription.toJSON(), subTo: getCurrentData()}).done(function(data) {
            isSubscribed = true;
            reloadUi();
        });
    }).catch(function (err) {
        console.log('Failed to subscribe the user: ', err);
        serviceWorkerEnabled = 'Failed to subscribe the user';
        reloadUi();
    });
}

function unsubscribeUser() {
    swRegistration.pushManager.getSubscription()
        .then(function (subscription) {
            if (subscription) {
                $.post('/ajax/register', {subscription: subscription.toJSON(), unsubscribe: true})
                    .always(function () {
                        return subscription.unsubscribe();
                    });
            }
        })
        .catch(function (error) {
            console.log('Error unsubscribing', error);
        })
        .then(function () {
            console.log('User is unsubscribed.');
            isSubscribed = false;
            reloadUi();
        });
}

function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}