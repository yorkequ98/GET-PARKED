if (top.location.pathname === '/change-password.html') {
    $(document).ready(function() {
        
        $("#save-new-password").on('click', function() {
            var oldPassword = document.getElementById("old-password").value;
            var newPassword = document.getElementById("new-password").value;
            var newPassRepeat = document.getElementById("new-password-2").value;

            $.ajax({
                url: getUrl("/api/change-password"),
                type: "POST",
                data: {
                    oldPass: oldPassword,
                    newPass: newPassword,
                    newPassRepeat: newPassRepeat
                },
                xhrFields: {
                    withCredentials: true
                },
                success: function(result) {
                    if (result === "OK") {
                        window.location.replace('/profile.html');
                    }
                }
            }).fail(function (jqXHR, textStatus, error) {
                console.log(jqXHR);
                console.log(error);
                console.log(textStatus);

                if (jqXHR.status === 401) {
                    window.location.replace("/sign-in.html");
                } else {
                    window.alert(jqXHR.responseText);
                }
			})
        });

    })
}