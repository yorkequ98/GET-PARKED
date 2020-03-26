(function() {
    var BASE_URL = 'http://127.0.0.1:8080';

    // PRODUCTION URL
    //var BASE_URL = 'https://deco3801-yorke-sons.uqcloud.net'

    window.getUrl = function(url) {
        return BASE_URL.concat(url);
    }
})();

$(document).ready(function () {
    "use strict";
    var body = $("body");

    $(function () {
        $(".preloader").fadeOut();
        $('#side-menu').metisMenu();
    });

    // Load Gravatar Icon...
    //var email = "dnedved@gmail.com";
    // Modify current gravatar placeholder image with the correct one...
    //$('#profileGravatar').attr('src', 'http://www.gravatar.com/avatar/' + md5(email));

    // ---------------------------------------------------------------------------------------------------------------

    $(".open-close").on("click", function () {
        body.toggleClass("show-sidebar").toggleClass("hide-sidebar");
        $(".sidebar-head .open-close i").toggleClass("ti-menu");
    });

    /* ===========================================================
     Loads the correct sidebar on window load.
     collapses the sidebar on window resize.
     Sets the min-height of #page-wrapper to window size.
    =========================================================== */

    $(function () {
        var set = function () {
            var topOffset = 60,
                width = (window.innerWidth > 0) ? window.innerWidth : this.screen.width,
                height = ((window.innerHeight > 0) ? window.innerHeight : this.screen.height) - 1;
            if (width < 768) {
                $('div.navbar-collapse').addClass('collapse');
                topOffset = 100; /* 2-row-menu */
            } else {
                $('div.navbar-collapse').removeClass('collapse');
            }

            /* ===== This is for resizing window ===== */

            if (width < 1170) {
                body.addClass('content-wrapper');
                $(".sidebar-nav, .slimScrollDiv").css("overflow-x", "visible").parent().css("overflow", "visible");
            } else {
                body.removeClass('content-wrapper');
            }

            height = height - topOffset;
            if (height < 1) {
                height = 1;
            }
            if (height > topOffset) {
                $("#page-wrapper").css("min-height", (height) + "px");
            }
        }

        $(window).ready(set);
        $(window).bind("resize", set);
    });


    /* ===== Tooltip Initialization ===== */

    $(function () {
        $('[data-toggle="tooltip"]').tooltip();
    });


    /* ===== Sidebar ===== */

    $('.slimscrollright').slimScroll({
        height: '100%',
        position: 'right',
        size: "5px",
        color: '#dcdcdc'
    });
    $('.slimscrollsidebar').slimScroll({
        height: '100%',
        position: 'right',
        size: "6px",
        color: 'rgba(0,0,0,0.3)'
    });
    $('.chat-list').slimScroll({
        height: '100%',
        position: 'right',
        size: "0px",
        color: '#dcdcdc'
    });

    /* ===== Resize all elements ===== */

    body.trigger("resize");

    /* ===== Visited ul li ===== */

    $('.visited li a').on("click", function (e) {
        $('.visited li').removeClass('active');
        var $parent = $(this).parent();
        if (!$parent.hasClass('active')) {
            $parent.addClass('active');
        }
        e.preventDefault();
    });

    $(".navbar-toggle").on("click", function () {
        $(".navbar-toggle i").toggleClass("ti-menu").addClass("ti-close");
    });

    $("#logout-btn").on("click", function (event) {
        event.preventDefault();
        $.ajax({
            url: getUrl(`/api/logout`),
            type: 'GET',
            xhrFields: {
                withCredentials: true
            },
            success: function (response) {
                window.location.replace("/sign-in.html");
            }
        }).fail(function (jqXHR, textStatus, error) {
            console.log(jqXHR, error);
        });
    });

    $.ajax({
        url: getUrl(`/api/account-data`),
        type: 'GET',
        xhrFields: {
            withCredentials: true
        },
        success: function (data) {
            var data = JSON.parse(data);
            console.log(data);
            var name = data.name;
            if (name) {
                $("#logoname").html(name);
            } else {
                console.log("Carpark page could not get user's name");
            }
        }
    })
});
