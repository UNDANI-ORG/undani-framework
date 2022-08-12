(function ($) {
    $.fn.tAccordion = function (options) {
        var self = this;

        self.settings = $.extend({
            validationPanels: null
        }, options);

        self.settings.accordionId = this.attr("id");

        self.initPlugin = function () {
            self.settings = $.extend(self.settings, {
                panels: this.find(".panel")
            });

            $.each(self.settings.panels, function (i, obj) {
                var currentPanelHeader = $(obj).find(".panel-heading");
                var currentPanelBody = $(obj).find(".panel-collapse");

                currentPanelHeader.click(function () {

                    $("html,body").animate({
                        scrollTop: 0
                    }, 0);

                    $(this).find(".panel-title .form-text").removeClass("textoRojo");

                    if (!currentPanelBody.hasClass("in")) // Se encuentra cerrado
                    {
                        $.each(self.settings.panels, function (i, v) {
                            if (v !== obj) {
                                var panelBody = $(v).find(".panel-collapse");
                                var panelHeader = $(v).find(".panel-heading");

                                if (panelBody && panelBody.hasClass("in"))
                                    panelBody.collapse("hide");

                                if (panelHeader) 
                                    panelHeader.find(".collpase-button").addClass("collapsed");
                            }
                        });

                        currentPanelBody.collapse("show");
                        currentPanelHeader.find(".collpase-button").removeClass("collapsed");
                    }
                    else // Se encuentra abierto
                    { 
                        if (currentPanelBody && currentPanelBody.hasClass("in"))
                            currentPanelBody.collapse("hide");

                        if (currentPanelHeader)
                            currentPanelHeader.find(".collpase-button").addClass("collapsed");
                    }

                });
            });
        };

        if (self.settings.accordionId) {
            self.initPlugin();

            self = $.extend(self, {
                validate: function () {
                    var resultVal = true;
                    if (self.settings.validationPanels) {
                        var collapse = true;
                        $.each(self.settings.validationPanels, function (i, v) {
                            var $currentObject = $(`#${v.panelId}`);
                            var currentPanelHeader = $currentObject.find(".panel-heading");
                            var currentPanelBody = $currentObject.find(".panel-collapse");
                            if ($.isFunction(v.funcValidation)) {
                                var result = v.funcValidation.call(v);
                                resultVal = result && resultVal;
                                var cabecera = $(`#${v.panelId}`).find(".panel-title .form-text");

                                if (!result) {
                                    if (collapse) {
                                        collapse = false;
                                        if (!currentPanelBody.hasClass("in"))
                                            currentPanelHeader.click();
                                    }
                                    cabecera.addClass("textoRojo");
                                }
                                else
                                    cabecera.removeClass("textoRojo");
                            }
                        });
                    }
                    if (self.settings.callback) {
                        self.settings.callback();
                    }
                    $(self).trigger("validated", [resultVal]);
                    return resultVal;
                }
            });
        }

        return self;
    };
}(jQuery));