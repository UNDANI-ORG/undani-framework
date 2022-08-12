"use strict";
$.Portlet = function (elementName) {
    var _self = {};

    var path = "https://wapvekform.azurewebsites.net/images/cargando-datos.gif";

    var element;
    if (!(elementName instanceof jQuery)) {
        element = $(`#${elementName}`).portlet({
            progress: "circle-custom",
            onRefresh: function () { },
            path: path
        });
    }
    else {
        element = elementName.portlet({
            progress: "circle-custom",
            onRefresh: function () { },
            path: path
        });
    }

    _self = $.extend(_self, {
        load: function (refresh) {
            element.portlet({ refresh: refresh });
        },
        show: function () {
            if (!element.find("div.portlet-progress").length)
                element.portlet({ refresh: true });
        },
        hide: function () {
            element.portlet({ refresh: false });
        }

    });

    return _self;
};