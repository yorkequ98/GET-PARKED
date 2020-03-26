if (top.location.pathname === '/new-account.html') {

    function scroll_to_class(element_class, removed_height) {
        var scroll_to = $(element_class).offset().top - removed_height;
        if ($(window).scrollTop() != scroll_to) {
            $('html, body').stop().animate({ scrollTop: scroll_to }, 0);
        }
    }

    function bar_progress(progress_line_object, direction) {
        var number_of_steps = progress_line_object.data('number-of-steps');
        var now_value = progress_line_object.data('now-value');
        var new_value = 0;
        if (direction == 'right') {
            new_value = now_value + (100 / number_of_steps);
        } else if (direction == 'left') {
            new_value = now_value - (100 / number_of_steps);
        }
        progress_line_object.attr('style', 'width: ' + new_value + '%;').data('now-value', new_value);
    }

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

    jQuery(document).ready(function() {

        google.maps.event.addDomListener(window, 'load', function() {
            initializeAutocomplete('f1-address');
        });

        // Fade in 'step' when we're loaded
        $('.f1 fieldset:first').fadeIn('slow');

        $('.f1 input[type="text"], .f1 input[type="password"], .f1 textarea').on('focus', function() {
            $(this).removeClass('input-error');
        });

        // next step
        $('.f1 .btn-next').on('click', function() {

            var parent_fieldset = $(this).parents('fieldset');
            var next_step = true;

            // navigation steps / progress steps
            var current_active_step = $(this).parents('.f1').find('.f1-step.active');
            var progress_line = $(this).parents('.f1').find('.f1-progress-line');

            // check fields are non-empty
            parent_fieldset.find('input[type="text"], input[type="password"], select').each(function() {
                if($(this).parent().attr('class') != 'bs-searchbox') {
                    if ($(this).val() == "") {
                        $(this).addClass('input-error');
                        next_step = false;
                    } else {
                        $(this).removeClass('input-error');
                    }
                }
            });

            switch($(parent_fieldset).attr('id')) {
                case "name-mobile":
                    var input = parent_fieldset.find('input[name="f1-full-name"], select');
                    $.ajax({
                        url: getUrl(`/api/check-full-name`),
                        type: 'POST',
                        async: false,
                        data: { "fullName" : input.val()},
                        xhrFields: {
                            withCredentials: true
                        },
                        success: function (data) {
                            console.log("Valid name");
                            input.removeClass("input-error");
                            document.getElementById("error-response-1").innerHTML = "";
                        }
                    }).fail(function (jqXHR, textStatus, error) {
                        console.log("Bad name");
                        input.addClass("input-error");
                        document.getElementById("error-response-1").innerHTML = "Sorry, names can only contain letters from the standard English alphabet";
                        next_step = false;
                    })
                    if(!next_step) break;

                    input = parent_fieldset.find('input[name="f1-phone"], select')
                    $.ajax({
                        url: getUrl(`/api/check-mobile`),
                        type: 'POST',
                        async: false,
                        data: { "mobile" : input.val()},
                        xhrFields: {
                            withCredentials: true
                        },
                        success: function (data) {
                            console.log("Valid mobile");
                            input.removeClass("input-error");
                            document.getElementById("error-response-1").innerHTML = "";
                        }
                    }).fail(function (jqXHR, textStatus, error) {
                        console.log("Bad mobile");
                        input.addClass("input-error");
                        document.getElementById("error-response-1").innerHTML = "Mobile number does not appear to be correct";
                        next_step = false;
                    })
                    break;
                
                case "email-password":
                    var input = parent_fieldset.find('input[name="f1-email"], select');
                    $.ajax({
                        url: getUrl(`/api/check-email-format`),
                        type: 'POST',
                        async: false,
                        data: { "email" : input.val()},
                        xhrFields: {
                            withCredentials: true
                        },
                        success: function (data) {
                            console.log("Valid email format");
                            input.removeClass("input-error");
                            document.getElementById("error-response-2").innerHTML = "";
                        }
                    }).fail(function (jqXHR, textStatus, error) {
                        console.log("Bad email format");
                        input.addClass("input-error");
                        document.getElementById("error-response-2").innerHTML = "Email doesn't seem to be correct";
                        next_step = false;
                    })
                    if(!next_step) break;

                    $.ajax({
                        url: getUrl(`/api/check-email-unique`),
                        type: 'POST',
                        async: false,
                        data: { "email" : input.val() },
                        xhrFields: {
                            withCredentials: true
                        },
                        success: function (data) {
                            console.log("Valid unique email");
                            input.removeClass("input-error");
                            document.getElementById("error-response-2").innerHTML = "";
                        }
                    }).fail(function (jqXHR, textStatus, error) {
                        console.log("Bad unique email");
                        next_step = false;
                        input.addClass("input-error");
                        document.getElementById("error-response-2").innerHTML = "Email already exists, have you forgotten you password?";
                    })
                    if(!next_step) break;
                    
                    var input = parent_fieldset.find('input[name="f1-password"], select');
                    var input2 = parent_fieldset.find('input[name="f1-password2"], select');
                    $.ajax({
                        url: getUrl(`/api/check-password`),
                        type: 'POST',
                        async: false,
                        data: { "password" : input.val(), "passwordRepeat" : input2.val() },
                        xhrFields: {
                            withCredentials: true
                        },
                        success: function (data) {
                            console.log("Valid password");
                            input.removeClass("input-error");
                            input2.removeClass("input-error");
                            document.getElementById("error-response-2").innerHTML = "";
                        }
                    }).fail(function (jqXHR, textStatus, error) {
                        console.log("Bad password");
                        input.addClass("input-error");
                        input2.addClass("input-error");
                        document.getElementById("error-response-2").innerHTML = "Passwords need to have both letters and numbers, and be longer than 8 but less than 20 characters long";
                        next_step = false;
                    })
                    break;
            }

            // verify passwords match
            var password = parent_fieldset.find('input[name="f1-password"], select').val();
            var password_repeat = parent_fieldset.find('input[name="f1-password2"], select').val();
            if (password != password_repeat) {
                next_step = false;
                parent_fieldset.find('input[type="password"], select').each(function() {
                    $(this).addClass('input-error');
                });
            }

            // fields validation
            if (next_step) {
                parent_fieldset.fadeOut(400, function() {
                    // change icons
                    current_active_step.removeClass('active').addClass('activated').next().addClass('active');
                    // progress bar
                    bar_progress(progress_line, 'right');
                    // show next step
                    $(this).next().fadeIn();
                    // scroll window to beginning of the form
                    scroll_to_class($('.f1'), 20);
                });
            }

        });

        // previous step
        $('.f1 .btn-previous').on('click', function() {

            // navigation steps / progress steps
            var current_active_step = $(this).parents('.f1').find('.f1-step.active');
            var progress_line = $(this).parents('.f1').find('.f1-progress-line');

            $(this).parents('fieldset').fadeOut(400, function() {
                // change icons
                current_active_step.removeClass('active').prev().removeClass('activated').addClass('active');
                // progress bar
                bar_progress(progress_line, 'left');
                // show previous step
                $(this).prev().fadeIn();
                // scroll window to beginning of the form
                scroll_to_class($('.f1'), 20);
            });
        });

        // submit
        $('.f1').on('submit', function(e) {
			const fieldIdValue = {
				'f1-full-name': 'fullName',
				'f1-phone-number': 'mobile',
				'f1-email': 'email',
				'f1-password': 'password',
				'f1-repeat-password': 'passwordRepeat' 
			}
            const inputs = {}
            var empty_field = false;

            // fields validation
            $(this).find('input[type="text"], input[type="password"]').each(function() {
                if($(this).parent().attr('class') != 'bs-searchbox') {
                    const value = $(this).val();
                    if (value == "") {
                        e.preventDefault();
                        $(this).addClass('input-error');
                        empty_field = true;
                    } else {
						const id = $(this).attr('id');
						inputs[fieldIdValue[id]] = value;
                        $(this).removeClass('input-error');
                    }
				};
            });   
            
            if (empty_field) return;

			console.log(inputs)
            e.preventDefault();
			$.ajax({
				url: getUrl(`/api/new-account`),
				type: 'POST',
                data: inputs,
                xhrFields: {
                    withCredentials: true
                },
				success: function (data) {
                    console.log(data)
					window.location.replace('/carparks.html');
				}
			}).fail(function (jqXHR, textStatus, error) {
                console.log(jqXHR, textStatus, error)
                console.log(jqXHR.responseJSON)
            })
        });
    });
}