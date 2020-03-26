if (top.location.pathname === '/dashboard.html') {
    $(document).ready(function() {
        $.ajax({
            url: getUrl(`/api/info`),
            type: 'POST',
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                console.log(JSON.stringify(data))
                var email = data[0].email;
                var address= data[0].address;
                var mobile = data[0].mobile;
                var name = data[0].fullName;
                var company = data[0].businessName;
                $("#name").html(name);
                $("#company").html(company);
                $("#mobile").html(mobile);
                $("#address").html(address);
                $("#email").html(email);
                //window.location.replace("/profile.html");
            }
        }).fail(function (jqXHR, textStatus, error) {
            console.log(jqXHR, error)
        });
    });
}