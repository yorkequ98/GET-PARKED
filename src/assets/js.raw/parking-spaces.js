if (top.location.pathname === '/carparks.html') {

    function getClientCarParks(callback) {

        // Pull JSON object of all the locations to display on the parking spaces page...
        // Getting Parks Available
        $.ajax({
            url: window.getUrl(`/api/map-data-detailed`),
            type: 'GET',
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                console.log("map data results:", data);

                var mapMarkers = [];
                var localCarparkNo = 1;
                if(data) {
                    $.each(data, function(key, val) {

                        // Create Carparks Table List View...
                        var address = val.street + ",<br>" + val.suburb + " " + val.state;
                        $('#carparksAvailable').append('<div class = "availableParkCard"><div class = "parkAddress"><a data-localCarparkNo="' + localCarparkNo + '" class="carpark-marker" href="#">' + address + '</a></div><div class = "parkActions"><Button class="details-btn" data-localCarparkNo="' + localCarparkNo +'">Details  ></Button><Button class="book-btn" data-localCarparkNo="' + localCarparkNo +'">Book  ></Button></div>');
                        console.log("got park:", val);
                        mapMarkers.push({
                            "geo": {
                                "latitude": val.latitude,
                                "longitude": val.longitude
                            },
                            "address": val.street + " " + val.suburb + " " + val.state + " " + val.postcode,
                            "street": val.street,
                            "suburb": val.suburb,
                            "region": val.region,
                            "state": val.state,
                            "postcode": val.postcode,
                            "bayNumber": val.bayNumber,
                            "price" : val.price,
                            "type" : val.type,
                            "localCarparkNo": localCarparkNo,
                            "accessHours" : val.accessHours,
                            "suitableFor" : val.suitableFor,
                            "carparkType" : val.carparkType,                    
                            "wheelchairAccess" : (val.wheelchairAccess ? "Yes" : "No"),     // wheelchairAccess is Boolean
                            "isBooked": false,
                            "additionalComments" : val.additionalComments
                        })
                        localCarparkNo++;

                    });
                }

                // Getting My Parks
                $.ajax({
                    url: window.getUrl(`/api/my-parks`),
                    type: 'GET',
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function (myData) {
                        console.log("map data results:", myData);
        
                        if(myData) {
                            $.each(myData, function(key, val) {
        
                                // Create Carparks Table List View...
                                var address = val.street + ",<br>" + val.suburb + " " + val.state;
                                var parkId = val.id;
                                //$('#myCarparks').append('<div class = "availableParkCard"><div class = "parkAddress"><a data-localCarparkNo="' + localCarparkNo + '" class="carpark-marker" href="#">' + address + '</a></div><div class = "parkActions"><Button class="details-btn" style="border-radius: 0px 0px 5px 5px;" data-localCarparkNo="' + localCarparkNo +'">Details  ></Button></div>');
                                $('#myCarparks').append('<div class = "availableParkCard"><div class = "parkAddress"><a data-localCarparkNo="' + localCarparkNo + '" class="carpark-marker" href="#">' + address + '</a></div><div class = "parkActions"><Button class="details-btn" style="border-radius: 0px 0px 5px 5px;" data-localCarparkNo="' + localCarparkNo +'">Details  ></Button><Button class="cancel-booking-btn" style="border-radius: 0px 0px 5px 5px;" data-parkId="' + parkId +'">Cancel Booking ></Button></div>');
                                console.log("got one of my parks:", val);
                                console.log("ParkId:", parkId);

                                mapMarkers.push({
                                    "geo": {
                                        "latitude": val.latitude,
                                        "longitude": val.longitude
                                    },
                                    "parkId": parkId,
                                    "address": val.street + " " + val.suburb + " " + val.state + " " + val.postcode,
                                    "street": val.street,
                                    "suburb": val.suburb,
                                    "region": val.region,
                                    "state": val.state,
                                    "postcode": val.postcode,
                                    "bayNumber": val.bayNumber,
                                    "price" : val.price,
                                    "type" : val.type,
                                    "localCarparkNo": localCarparkNo,
                                    "accessHours" : val.accessHours,
                                    "suitableFor" : val.suitableFor,
                                    "carparkType" : val.carparkType,                    
                                    "wheelchairAccess" : (val.wheelchairAccess ? "Yes" : "No"),     // wheelchairAccess is Boolean
                                    "isBooked": true,
                                    "additionalComments" : val.additionalComments
                                })
                                localCarparkNo++;
        
                            });

                            // Handler for cancelling a park
                            $(".cancel-booking-btn").on("click", function () {
                                var parkId = $(this).attr("data-parkId");
                                console.log("parkId to cancel:", parkId);
                    
                                if (confirm("Are you sure you want to terminate this booking?")) {
                                    $.ajax({
                                        url: window.getUrl(`/api/cancel-booking`),
                                        type: "POST",
                                        data: {
                                            parkId: parkId
                                        },
                                        xhrFields: {
                                            withCredentials: true
                                        },
                                        success: function(response) {
                                            console.log("cancel booking query response:", response)

                                            /* not ideal, will not longer be under my parks tab, 
                                                but it's the easiest way to update the park info on the page */
                                            location.reload(); 
                                        }
                                    }).fail(function (jqXHR, textStatus, error) {
                                        console.log(jqXHR, error)
                                        if (error === "Unauthorized") {
                                            window.location.replace("/sign-in.html");
                                        }
                                    });

                                } 
                                
                            })
                        }

                        // Once we've got the items, we can print them on the Google Map...
                        //console.log("mapMarkers", mapMarkers);
                        callback(mapMarkers);
                    }
                }).fail(function (jqXHR, textStatus, error) {
                    console.log(jqXHR, error)
                    if (error === "Unauthorized") {
                        window.location.replace("/sign-in.html");
                        return;
                    }

                    //console.log("mapMarkers", mapMarkers);
                    callback(mapMarkers);
                });

                
            }
        }).fail(function (jqXHR, textStatus, error) {
            console.log(jqXHR, error)
            if (error === "Unauthorized") {
                window.location.replace("/sign-in.html");
            }
        });
    }

    var renderedMarkers = {};
    function initMap(markers) {
        //console.log("markers to initMap", markers);
        
        // By default just center Australia, until we have obtained the location using the browser's Geo API...
        var uluru = {lat: -25.363, lng: 131.044};
        var mapObject = new google.maps.Map(document.getElementById('map'), {
            zoom: 4
        });

        // Add the marker onto map one by one...
        $.each(markers, function(key, val) {
            //console.log(key)
            //console.log(val)

            // Content for each marker (a marker is a carpark location)
            var contentString = '<div class="infoWindowWrapper"><div class="address">' + val.address
            //+'<hr><div class="address"><b>Listing Type: </b>'+ val.type + '</div>'
            +'<hr><div class="address"><b>$'+ val.price + '/Month</b></div>'
            +'<hr><div class="info"><b>Region: </b>'+ val.region + '</div>'
            +'<div class="info"><b>Suitable For: </b>'+ val.suitableFor + '</div>'
            +'<div class="info"><b>Access Hours: </b>'+ val.accessHours + '</div>'
            +'<div class="info"><b>Term: </b>'+ val.carparkType + '</div>'
            +'<div class="info"><b>Access Hours: </b>'+ val.accessHours + '</div>'
            +'<div class="info"><b>Wheelchair Access: </b>'+ val.wheelchairAccess + '</div>'
            +'<div class="links"><a target="_blank" href="https://www.google.com/maps/place/' + val.geo.latitude + ',' + val.geo.longitude + '/@' + val.geo.latitude + ',' + val.geo.longitude + '">Open in Google Maps</a></div></div>';

            var infoWindow = new google.maps.InfoWindow({
                content: contentString
            });

            // Location of carpark (lat/lng)
            var latLng = new google.maps.LatLng(val.geo.latitude, val.geo.longitude); 

            var carparkItem = new google.maps.Marker({
                position: latLng,
                map: mapObject,
                title: val.address,
                infoWindow: infoWindow,
                isBooked: val.isBooked
            });

            // Link carpark items into object (so we can reference them outside of function - when we click the hyperlinks)...
            renderedMarkers[val.localCarparkNo] = carparkItem;
            // hide markers for booked parks initially
            if (val.isBooked) {
                carparkItem.setVisible(false);
            }

            // Add listener for when clicking on a marker within the map.
            carparkItem.addListener('click', function() {
                hideAllInfoWindows(mapObject);
                infoWindow.open(mapObject, carparkItem);
            });

            //console.log("renderedMarkers", renderedMarkers);
        });

        function hideAllInfoWindows(mapObject) {
            $.each(renderedMarkers, function(key, val) {
                val.infoWindow.close(mapObject);
            });
        }

        // Use the Geo location service to show the current location on the map...
        var GeoMarker = new GeolocationMarker(mapObject);

        // Zoom in once we've got the user's location....
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {

                initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                mapObject.setCenter(initialLocation);
                mapObject.setZoom(10); 
                $("#mapLoading").hide();
            
            }, function(error) {

                // If the user denied access to their location, just show a map of Australia...
                $("#mapLoading").hide();
                mapObject.setCenter(uluru);

            });
        }

        $('#my-park-btn').on('click', function () {
            $.each(renderedMarkers, function(key, val) {
                //console.log("my parks clicked. val is booked", val.isBooked)
                val.setVisible(val.isBooked);
            })
        })

        $('#available-park-btn').on('click', function () {
            $.each(renderedMarkers, function(key, val) {
                //console.log("my parks clicked. val is booked", val.isBooked)
                val.setVisible(!val.isBooked);
            })
        })

        // Bind click event for carpark hyperlinks after the map has rendered.
        $('.carpark-marker').on('click', function () {
            var markerToClick = renderedMarkers[$(this).attr("data-localCarparkNo")];
            hideAllInfoWindows(mapObject);

            // Set the map center to the lat/lng of the marker that was just clicked...
            var markerPosition = markerToClick.getPosition();
            mapObject.panTo(markerPosition);

            mapObject.setZoom(13); 
            new google.maps.event.trigger( markerToClick, 'click' );

        });

        // Bind click event for carpark hyperlinks after the map has rendered.
        $('.details-btn').on('click', function () {
            var markerToClick = renderedMarkers[$(this).attr("data-localCarparkNo")];
            hideAllInfoWindows(mapObject);
            console.log(markerToClick);

            // Set the map center to the lat/lng of the marker that was just clicked...
            var markerPosition = markerToClick.getPosition();
            mapObject.panTo(markerPosition);

            mapObject.setZoom(13); 
            new google.maps.event.trigger( markerToClick, 'click' );

        });

        // Bind click event for the book buttons
        $('.book-btn').on('click', function() {

            var localParkNum = $(this).attr("data-localCarparkNo");
            console.log("book button num:", localParkNum);

            var markerToBook = markers[localParkNum-1];
            console.log(markerToBook);
            const {street, type, suburb, postcode} = markerToBook;

            console.log("Street:", street);
            console.log("type:", type);
            console.log("Suburb:", suburb);
            console.log("Postcode:", postcode);

            $.ajax({
                url: window.getUrl(`/api/get-available-park`),
                type: "POST",
                data: {
                    street: street,
                    suburb: suburb,
                    postcode: postcode,
                    type: type
                },
                xhrFields: {
                    withCredentials: true
                },
                success: function(data) {
                    console.log("can-book-park response:", data);
                    console.log(typeof data)

                    if (data.parkId) {
                        sessionStorage.setItem("parkId", data.parkId);
                        window.location.replace('/parking-agreement.html');
                    } else {
                        window.alert("No parks available at that location");
                    }
                }
            }).fail(function (jqXHR, textStatus, error) {
                console.log(jqXHR, error);
                if (error === "Unauthorized") {
                    window.location.replace("/sign-in.html");
                }
			})
        })

        

        // Bind to click event of actual map, and close any infoWindows that may be open...
        mapObject.addListener('click', function() {
            hideAllInfoWindows(mapObject);
        });

    }
    
    $(document).ready(function() {
        getClientCarParks(function(markers) {
            initMap(markers);
        })
    });
};