if (top.location.pathname === '/credit-card-details.html') {
    $(document).ready(function() {
        console.log("Hello!")

        $('#creditCardForm').on('submit', function(e) {
			e.preventDefault();  //prevent form from submitting
			$("input").css("border", "none");
            var data = $("#creditCardForm :input").serializeArray();
			const body = {
				cardName: data[0].value,
                cardNum: data[1].value,
				expiryMonth: "mm",
				expiryYear: "yy",
				cardCCV: data[3].value,
				// addressLine1: data[4].value,
				// city: data[5].value,
				// state: data[6].value,
				// postcode: data[7].value,
			}

			if (!body.cardName) {
				alert('Please enter a name')
				return
			} else if (!body.cardNum) {
				alert('Please enter a card number')
				return
			} else if (!data[2].value) {
                alert('Please enter an expiry date')
                return
            } else if (!body.cardCCV) {
                alert('Please enter a ccv number')
                return
            } //else if (!body.addressLine1) {
            //     alert('Please enter an address')
            //     return
            // } else if (!body.city) {
            //     alert('Please enter a city')
            //     return
            // } else if (!body.state) {
            //     alert('Please enter a state')
            //     return
            // } else if (!body.postcode) {
            //     alert('Please enter a postcode')
            //     return
			// }
			
			// get month and year from expiry
			var split = data[2].value.split("/");
			if (data[2].value.length !== 5 || split.length !== 2 || split[0].length !== 2 || split[1].length !== 2) {
				alert('Card expiry must be in the correct format: MM/YY');
                return;
			}
			body.expireMonth = split[0];
			body.expireYear = split[1];

			$.ajax({
				url: getUrl(`/api/add-payment-info`),
				type: 'POST',
				data: body,
				xhrFields: {
					withCredentials: true
				},
				success: function (data) {
					console.log(data[0])
					window.location.replace("/billing.html");
				}
			}).fail(function (jqXHR, textStatus, error) {
				console.log(jqXHR, error)
				if (jqXHR.status === 401) {
					window.location.replace("/sign-in.html");
				}

				$("input").css("border", "2px solid red");
				$("span").css("color", "red");
				$("span").css("visibility", "visible");
			})
        });

    });
}