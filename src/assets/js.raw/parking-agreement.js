if (top.location.pathname === '/parking-agreement.html') {

    $(document).ready(function() {
        $.ajax({
            url: getUrl(`/api/account-data`),
            type: 'GET',
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                var data = JSON.parse(data);
                var address = data.address;
                var company = data.company;
                document.getElementsByName("full-name").forEach(function(item) {
                    item.innerHTML = data.name;
                });
                document.getElementsByName("mobile").forEach(function(item) {
                    item.innerHTML = data.mobile;
                });
                document.getElementsByName("email").forEach(function(item) {
                    item.innerHTML = data.email;
                });
                $("[name='address']").val(address);
            }
        }).fail(function (jqXHR, textStatus, error) {
            console.log(jqXHR, error)
            if (error === "Unauthorized") {
                window.location.replace("/sign-in.html");
            }
        });

        // get the park data
        var parkId = sessionStorage.getItem("parkId");
        //sessionStorage.removeItem("parkId");
        var rate = 0;

        $.ajax({
            url: window.getUrl("/api/park-info"),
            type: "POST",
            data: {
                parkId: parkId
            },
            xhrFields: {
                withCredentials: true
            },
            success: function(data) {
                document.getElementById("park-location").innerHTML = data.street.concat(", ", data.suburb);
                document.getElementById("bay-number").innerHTML = data.bayNumber;
                rate = data.price;
                document.getElementsByName("rate").forEach(function(item) {
                    item.innerHTML = "$".concat(rate);
                });
                document.getElementById("net").innerHTML = "$".concat((data.price * 0.9));
                document.getElementById("gst").innerHTML = "$".concat((data.price * 0.1));
                document.getElementById("net-add-charge").innerHTML = "$".concat(Math.round((rate*0.009) * 100) / 100);
                document.getElementById("gst-add-charge").innerHTML = "$".concat(rate*0.001);
                document.getElementById("total-add-charge").innerHTML = "$".concat(rate*0.01);
                document.getElementById("rate-extra").innerHTML = "$".concat(rate*1.01);
                document.getElementById("total").innerHTML = "$".concat(rate*1.01 + 30);
            }
        }).fail(function (jqXHR, textStatus, error) {
            console.log(jqXHR, error);
        });

        // get the date
        var date = new Date();
        var dateString = String(date.getDate()) + "/" + String(date.getMonth() + 1) + "/" + String(date.getFullYear());
        document.getElementsByName("date").forEach(function(item) {
            item.innerHTML = dateString;
        });

        $("#btn-pay-method").click(function() {
            var title = document.getElementById("pay-method");
            var helpText = document.getElementById("account-style");
            var netAddCharge = document.getElementById("net-add-charge");
            var gstAddCharge = document.getElementById("gst-add-charge");
            var totalAddCharge = document.getElementById("total-add-charge");
            var rateExtra = document.getElementById("rate-extra");
            var total = document.getElementById("total");
            if (title.innerHTML == "Credit Card surcharge") {
                title.innerHTML = "Account Keeping Fee";
                this.innerHTML = "Switch to Automatic";
                $(this).removeClass("btn-success");
                $(this).addClass("btn-info");
                helpText.innerHTML = "I would like to be charged by credit card automatically";
                netAddCharge.innerHTML = "$".concat(13.5);
                gstAddCharge.innerHTML = "$".concat(1.5);
                totalAddCharge.innerHTML = "$".concat(15);
                rateExtra.innerHTML = "$".concat(rate + 15);
                total.innerHTML = "$".concat(rate + 45);
            } else {
                title.innerHTML = "Credit Card surcharge";
                this.innerHTML = "Switch to Manual";
                $(this).removeClass("btn-info");
                $(this).addClass("btn-success");
                helpText.innerHTML = "I would like to have manual account keeping";
                netAddCharge.innerHTML = "$".concat(Math.round((rate*0.009) * 100) / 100);
                gstAddCharge.innerHTML = "$".concat(rate*0.001);
                totalAddCharge.innerHTML = "$".concat(rate*0.01);
                rateExtra.innerHTML = "$".concat(rate*1.01);
                total.innerHTML = "$".concat(rate*1.01 + 30);
            }
            
        });

        $("#btn-agree").click(function(){
            if (!document.getElementById("terms-and-conditions").checked) {
                window.alert("You must accept the terms and conditions to book a park"); 
                return;   
            } 

            $.ajax({
                url: window.getUrl("/api/book-park"),
                type: "POST",
                data: {
                    parkId: parkId
                },
                xhrFields: {
                    withCredentials: true
                },
                success: function(data) {
                    if (data === "OK") {
                        window.location.replace('/carparks.html');
                    } else {
                        window.alert("This park is not available");
                    }
                }
            }).fail(function (jqXHR, textStatus, error) {
                console.log(jqXHR, error);
                if (error === "Unauthorized") {
                    window.location.replace("/sign-in.html");
                }
			})
        });

        $("#btn-back").click(function(){
            window.location.replace('/carparks.html');
        });
    });

    
};