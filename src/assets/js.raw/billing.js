if (top.location.pathname === '/billing.html') {
    $(document).ready(function() {
        $("#remove-card-btn").hide();

        $.ajax({
            url: getUrl("/api/get-payment-info"),
            type: "GET",
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                var cardScheme = data.card_scheme.toUpperCase();
                var last4 = data.card_number_last4;
                var status = data.status;

                document.getElementById("payment-method").innerHTML = `<p>Card: </p><p>${cardScheme}</p><p> ****-****-****-${last4} </p> <p>Status: ${status}</p>`;
                $("#remove-card-btn").show();
                $("#add-credit-card-btn").hide();

            }
        }).fail(function (jqXHR, textStatus, error) {
            console.log(jqXHR, error)
            if (error === "Unauthorized") {
                window.location.replace("/sign-in.html");
            }
        });

        $("#remove-card-btn").on("click", function () {
            if (confirm("Are you sure you want to remove this card?")) {
                $.ajax({
                    url: getUrl("/api/remove-payment-info"),
                    type: "DELETE",
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function () {
                        $("#remove-card-btn").hide();
                        $("#add-credit-card-btn").show();
                        document.getElementById("payment-method").innerHTML = "Invoice based billing <p>(No Card details provided)</p>";
                    }
                }).fail(function (jqXHR, textStatus, error) {
                    console.log(jqXHR, error)
                    if (error === "Unauthorized") {
                        window.location.replace("/sign-in.html");
                    }
                });
            }
        })
    })
}