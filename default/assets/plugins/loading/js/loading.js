;(function($, window, undefined){
    "use strict";

    $(document).ready(function()
    {
        var $pageLoadingOverlay = $('.page-loading-overlay');

        // Page Loading Overlay
        if ($pageLoadingOverlay.length) {
            $(window).load(function () {
                $pageLoadingOverlay.addClass('loaded');
            });
        }

        window.onerror = function () {
            // failsafe remove loading overlay
            $pageLoadingOverlay.addClass('loaded');
        }
    });

})(jQuery, window);