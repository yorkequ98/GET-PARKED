const RegisteredCars = {};

if (top.location.pathname === '/profile.html') {
    
    function readFile(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $("#img01").attr('src', e.target.result);
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    var filepath;
    var globalEmail;
    $(document).ready(function() {
        $("input").attr("disabled", true);
        $("#fileinput").attr("disabled", false);
        $("#numberplate").attr("disabled", false);
        $("input").css("cursor", "text");
        $("#savebutton").hide();
        //$("#add-new-car").hide();
        //$("#removebtn").hide();
        $(".remove-vehicle").remove();
        $("#editbutton").click(function(){
            $(this).hide();
            $("#savebutton").show();
            $("input").attr("disabled", false);
            //$("#add-new-car").show();
        });
        $("#img01").css("display", "block");
        $("#img01").css("margin-left", "auto");
        $("#img01").css("margin-right", "auto");
        $("#img01").css("width", "80%");
        $("#img01").css("max-width", "200px");
        $.ajax({
            url: getUrl(`/api/account-data`),
            type: 'GET',
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                var data = JSON.parse(data);
                var email = data.email;
                globalEmail = email;
                var address = data.address;
                var mobile = data.mobile;
                var name = data.name;
                var company = data.company;
                var fileData = data.fileData;
                filepath = data.filename;
                var extension = data.extension;
                //$("#logoname").html(name); // this is already done on core.js
                $("[name='name']").val(name);
                $("[name='company']").val(company);
                $("[name='phone']").val(mobile);
                $("[name='address']").val(address);
                $("[name='email']").val(email);
                if (fileData != null && extension != null) {
                    $("#img01").attr("src", "data:image/"+extension+";base64,"+fileData);
                }
            }
        }).fail(function (jqXHR, textStatus, error) {
            console.log(jqXHR, error)
            if (jqXHR.status === 401) {
                window.location.replace("/sign-in.html");
            }
        });


        $.ajax({
            url: getUrl(`/api/get-cars`),
            type: 'GET',
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                $.each(data, function(index) {
                    var car = data[index];
                    var model = {
                        "Make" : car.brand,
                        "Model" : car.model
                    };
                    RegisteredCars[car.plate] = model;
                });
                renderAuthorisedCars();
            }
        }).fail(function (jqXHR, textStatus, error) {
            console.log(jqXHR, error)
            if (jqXHR.status === 401) {
                window.location.replace("/sign-in.html");
            }
        });



        $("#fileinput").change(function() {
            console.log(this.files);
        });

        $("#profileForm").on('submit', function(e){            
            var data = $("#profileForm :input").serializeArray();
            var fd = new FormData();
            var file = $("#fileinput").get(0).files[0];
            var fileName;
            var extension;
            if (file != null) {
                fileName = file.name;
                extension = fileName.split(".")[1];
                fd.append('license', file);
                fd.append('image', fileName);
            }
            fd.append('name', data[0].value);
            fd.append('company', data[1].value);
            fd.append('mobile', data[2].value);
            fd.append('email', data[3].value);
            fd.append('address', data[4].value);
            var valid = false;
            if (extension == null || extension.toUpperCase() == "PNG" || extension.toUpperCase() == "JPG" || 
            extension.toUpperCase() == "JPEG") {
                valid = true;
            }
            e.preventDefault();
            if (valid) {
                $.ajax({
                    url: getUrl(`/api/update`),
                    type: 'POST',
                    headers: {"email": fd.get("email")},
                    data: fd,
                    processData: false,
                    contentType: false,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function (response) {
                        $("input").attr("disabled", true);
                        $("#savebutton").hide();
                        $("#editbutton").show();
                        $("#add-new-car").hide();
                        
                    }
                }).fail(function (jqXHR, textStatus, error) {
                    console.log("update request failed:", jqXHR, error)
                    if (jqXHR.status === 401) {
                        window.location.replace("/sign-in.html");
                    }
                })
            }
        });

        // Used for the address autocomplete (provided by Google)
        function initializeAutocomplete(id) {
            var element = document.getElementById(id);
            if (element) {
                var autocomplete = new google.maps.places.Autocomplete(element, { types: ['geocode'] });
                google.maps.event.addListener(autocomplete, 'place_changed', onPlaceChanged);
            }
        }

        function onPlaceChanged() {
            var place = this.getPlace();

            console.log(place); // Uncomment this line to view the full object returned by Google API.

            for (var i in place.address_components) {
                var component = place.address_components[i];
                for (var j in component.types) { // Some types are ["country", "political"]
                    var type_element = document.getElementById(component.types[j]);
                    if (type_element) {
                        type_element.value = component.long_name;
                    }
                }
            }
        }

        function renderAuthorisedCars() {

            var authorisedCarsList = "";
            console.log(RegisteredCars);
            $.each(RegisteredCars, function(key, value){
                authorisedCarsList += '<div class="row">'
                authorisedCarsList += '    <div class="col-xs-5">' + value.Make + ': ' + value.Model + '</div>'
                authorisedCarsList += '    <div class="col-xs-4">' + key + '</div>'
                authorisedCarsList += '    <div class="col-xs-1"><a data-plate="' + key + '" class="btn btn-default btn-sm remove-vehicle" type="button" href="#"> <i aria-hidden="true" class="fa fa-times"></i> Remove</a></div>'
                authorisedCarsList += '</div>'
            });

            $(".authorised-cars").html(authorisedCarsList);
            $(".remove-vehicle").on('click', function(event) {
                confirmRemoveRegisteredVehicle(event, this);
            })
        }
        //renderAuthorisedCars();

        function updateAuthorisedCars(callback) {
            // TODO: Write function to hit Podio API.
            callback(true);
        }

        function confirmRemoveRegisteredVehicle(event, target) {

            $('#confirmRemoveVehicle').find('.modal-body').html("Are you sure you want to remove the vehicle: <b>[" + $(target).data("plate") + "]</b>?")

            event.preventDefault();
            $('#confirmRemoveVehicle').modal({
                backdrop: 'static',
                keyboard: false
            })
            .one('click', '#delete', function(e) {
                const form = {
                    "plate" : $(target).data("plate") 
                };
                console.log(form);
                $.ajax({
                    url: getUrl(`/api/remove-cars`),
                    type: 'POST',
                    data: form,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function (response) {
                        removeVehicle($(target).data("plate"));
                    }
                }).fail(function (jqXHR, textStatus, error) {
                    console.log("update request failed:", jqXHR, error)
                    if (jqXHR.status === 401) {
                        window.location.replace("/sign-in.html");
                    }
                })
                
            });

        }

        function removeVehicle(PlateNumber) {

            $.each(RegisteredCars, function(key,value){
                if(PlateNumber == key) {
                    delete RegisteredCars[PlateNumber]
                    // TODO: Fire off event to Podio API.
                }
            });

            console.dir(RegisteredCars);
            renderAuthorisedCars();
        }

        function resetCarDropdowns() {

            $("#numberplate").val('');

            $("#car1Make").val('default');
            $("#car1Make").selectpicker("refresh");

            $("#car1Model").html("");
            $("#car1Model").val('default');
            $("#car1Model").selectpicker("refresh");

            $("#car1Make").next().removeClass("no-value-warning");
            $("#car1Model").next().removeClass("no-value-warning");
            $("#numberplate").removeClass("no-value-warning");

        }

        function addNewCar(callback) {
            
            var carMake = $("#car1Make").find("option:selected").data('tokens');
            var carModel = $("#car1Model").find("option:selected").data('tokens');
            var carLicensePlate = $("#numberplate").val();

            if(!carMake||!carModel||!carLicensePlate) {

                if(!carMake) { $("#car1Make").next().addClass("no-value-warning"); } else { $("#car1Make").next().removeClass("no-value-warning"); }
                if(!carModel) { $("#car1Model").next().addClass("no-value-warning"); } else { $("#car1Model").next().removeClass("no-value-warning"); }
                if(!carLicensePlate) { $("#numberplate").addClass("no-value-warning"); } else { $("#numberplate").removeClass("no-value-warning"); }
                callback(false);

            } else {
                RegisteredCars[carLicensePlate] = {
                    "Make": carMake,
                    "Model": carModel
                }
                updateAuthorisedCars(function(response) {
                    if(response == true) {
                        const data = {
                            "brand" : carMake,
                            "model" : carModel,
                            "plate" : carLicensePlate,
                            "email" : globalEmail
                        }
                        $.ajax({
                            url: getUrl(`/api/add-cars`),
                            type: 'POST',
                            data: data,
                            xhrFields: {
                                withCredentials: true
                            },
                            success: function (response) {
                                if (response == "OK") {
                                    renderAuthorisedCars();
                                    callback(true);
                                }
                                
                            }
                        }).fail(function (jqXHR, textStatus, error) {
                            console.log("update request failed:", jqXHR, error)
                            if (error === "Unauthorized") {
                                window.location.replace("/sign-in.html");
                            }
                        })

                    } else {
                        // TODO: Write failure code in UI.
                    }
                });

                
            }
        }

        // Pop down section to add a new vehicle to this user's authorised list...
        $("#add-new-car").click(function() {
            $("#add-car-title").html("Add New Vehicle:")
            $(".your-cars-list").slideUp("fast");
            $(".add-new-car").slideDown("fast");
        })

        function closeAddNewCarPopdown() {
            $("#add-car-title").html("Your Vehicles:")
            $(".your-cars-list").slideDown("fast");
            $(".add-new-car").slideUp("fast");
            resetCarDropdowns();
        }

        // Cancel the add vehicle to list screen...
        $("#cancel-add-car").click(function() {
            closeAddNewCarPopdown();
        });

        // Actual function that adds the new car to list.
        $("#add-to-list").click(function() {

            addNewCar(function(response) {
                if(response == true) {
                    // Looks like it's been added OK...
                    closeAddNewCarPopdown();
                }
            });

        });

        google.maps.event.addDomListener(window, 'load', function() {
            initializeAutocomplete('user_input_autocomplete_address');
        });
        

        // ------------------------------------------------------------------------------------------

        // Used for the car make/model dropdown (data provided by eBay:)
        // https://pages.ebay.com.au/help/sell/contextual/master-vehicle-list-manually.html

        var makeModels = {};

        var getURL = "/assets/json/car-makes.json";
        $.ajax({
            url: getURL,
            type: 'GET',
            success: function (data) {
                console.dir(data);

                // Push makes into object first...
                $.each(data, function(key,value){
                    makeModels[value.make] = [];
                });

                // Then push individual models into each make...
                $.each(data, function(key,value){
                    makeModels[value.make].push(value.model);
                });

                loadMakeDropdown();
            }
        }).fail(function (jqXHR, textStatus, error) {
            console.log(jqXHR, error)
        });

        function loadMakeDropdown() {

            $('#car1Make').empty();
            $.each(makeModels, function(key, val) {
                $("#car1Make").append('<option data-tokens="' + key + '">' + key + '</option>');
            });
            $('.selectpicker').selectpicker('refresh');


        }
        function loadModelDropdown(model, target, callback) {

            $(target).empty();
            $.each(makeModels[model], function(key, val) {
                $(target).append('<option data-tokens="' + val + '">' + val + '</option>');
            });
            $('.selectpicker').selectpicker('refresh');

            callback(true);

        }

        $('#car1Make').on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
            var selectedMake = $(e.currentTarget).val();
            loadModelDropdown(selectedMake, '#car1Model', function() {
                // Seems to be an issue with bootstrap select when you hit toggle immediately, even with a callback (after it's rendered)...
                setTimeout(function() {$('#car1Model').selectpicker('toggle');}, 50);
            });
        });

        $('#car1Model').on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
            $("#numberplate").focus();
        });

    });
};