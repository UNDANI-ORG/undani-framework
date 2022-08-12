(function ($) {
    var portlet = $.Portlet($("body"));
    var portletModal = $.Portlet($(".modal.fade"));

    $(document).ajaxSend(function (event, jqxhr, settings) {
        if ($(".modal.fade.in").length)
            portletModal.show();
        else
            portlet.show();

        $(".portlet-progress").attr("style", function (i, s) {
            return s + "position: fixed !important;";
        });
    });

    $(document).ajaxStop(function () {
        var err;
        if ($(".modal.fade.in").length) {
            try {
                portletModal.hide();
            } catch (err) {
                debugger;
                if (err.message === "Cannot read property 'fadeOut' of null")
                    portlet.hide();
            }
        } else {
            try {
                portlet.hide();
            }
            catch (err) {
                debugger;
                if (err.message === "Cannot read property 'fadeOut' of null")
                    portletModal.hide();
            }
        }
        setTimeout(function () {
            if ($(".portlet-progress").length)
                $(".portlet-progress").remove();
        }, 7000);
    });

})(jQuery)