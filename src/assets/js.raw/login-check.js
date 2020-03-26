const privatePages = ["/profile.html", "/carparks.html", "/billing.html", 
        "/change-password.html", "/account-legal.html", "/parking-agreement.html", 
        "/credit-card-details.html"];

function loggedInCheck() {
    console.log(`${top.location.pathname} is checking if logged in`);
    $.ajax({
        url: getUrl(`/api/is-logged-in`),
        type: 'GET',
        xhrFields: {
            withCredentials: true
        },
        success: function (response) {
            console.log("logged in!");
        }

    }).fail(function (jqXHR, textStatus, error) {
        console.log(jqXHR, error)
        if (jqXHR.status === 401) {
            window.location.replace("/sign-in.html");
        }
    });
}

if (privatePages.includes(top.location.pathname)) {
    $(document).ready(function() {
        loggedInCheck();
    })
}