(function () {
    $(document).ready(function () {
        var form = $("#form").uForm();
        var win = window;
        $(form).trigger("loaded", form.initialize);
        var fakeForm = win.form;
        var formProperties = Object.getOwnPropertyNames(fakeForm);
        var consola = win.console;
        var settimeout = win.setTimeout;

        formProperties.forEach(function (prop) {
            if (typeof fakeForm[prop] === "function") {
                fakeForm[prop] = function () {
                    var sUsrAg = navigator.userAgent;
                    var css = "font-family:helvetica; font-size:20px; font-size:50px; font-weight:bold; color:red; -webkit-text-stroke:1px black;";
                    var userMessage = "¡Atención!";
                    if ((sUsrAg.indexOf("Chrome") !== -1 || sUsrAg.indexOf("Safari") !== -1 || sUsrAg.indexOf("Firefox") !== -1) && sUsrAg.indexOf("Edge") === -1) {
                        settimeout(consola.log.bind(consola, `\n%c${userMessage}`, css));
                        userMessage = "Estimado usuario/permisionario, usted está tratando de hacer un mal uso de este formulario y puede ser sancionado";
                        css = "font-family:helvetica; font-size:20px; ";
                        settimeout(consola.log.bind(consola, `\n%c${userMessage}`, css));
                    }
                    else {
                        settimeout(consola.log.bind(consola, `\n${userMessage}`));
                        userMessage = "Estimado usuario/permisionario, usted está tratando de hacer un mal uso de este formulario y puede ser sancionado";
                        settimeout(consola.log.bind(consola, `\n${userMessage}`));
                    }
                };
                $.fn.uForm = fakeForm[prop];
            }
        });
    });
})();