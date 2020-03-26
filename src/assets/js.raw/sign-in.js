if (top.location.pathname === '/sign-in.html') {
    $(document).ready(function() {
        console.log("Hello!")
		$("span").css("visibility", "hidden");

        $('#loginForm').on('submit', function(e) {
			e.preventDefault();  //prevent form from submitting
			$("input").css("border", "none");
			$("span").css("color", "red");
			$("span").css("visibility", "hiden");
            var data = $("#loginForm :input").serializeArray();
			const body = {
				email: data[0].value,
				password: data[1].value
			}

			if (!body.email) {
				alert('Please enter an email')
				return
			} else if (!body.password) {
				alert('Please enter a password')
				return
			}

			$.ajax({
				url: getUrl(`/api/login`),
				type: 'POST',
				data: body,
				xhrFields: {
					withCredentials: true
				},
				success: function (data) {
					console.log(data[0])
					window.location.replace("/carparks.html");
				}
			}).fail(function (jqXHR, textStatus, error) {
				console.log("jqXHR: ", jqXHR, "Error:" , error);
				console.log("text status: ",textStatus);
				if (jqXHR.status === 401) {
					$("input").css("border", "2px solid red");
					$("span").css("color", "red");
					$("span").css("visibility", "visible");
				}
			})
        });

    });
}