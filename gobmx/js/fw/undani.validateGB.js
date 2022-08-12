"use strict";
(function ($) {

    $.fn.uValidate = function (oSettings) {
        var bMensaje = (typeof oSettings.bMensaje) !== "undefined" ? oSettings.bMensaje : true;
        var sOrigen = (typeof oSettings.sOrigen) !== "undefined" ? oSettings.sOrigen : "Validación";

        this.attr("data-validate", 1);

        // Crea el objeto de validación
        var oValidate = this.validate({
            rules: oSettings.rules,
            messages: oSettings.messages,
            errorClass: "form-control-error",
            ignore: "select[type=hidden]",
            highlight: function (element, errorClass, validClass) {                
                //console.log(element.id);
                $(element.form).find(`.error label[for=${element.id}]`).fadeIn("slow");

                // Marca los bordes de los elementos en rojow
                if ($(element).is(".select2-hidden-accessible")) { //Si es un select2
                    $(element).parent().find(".select2-selection").css("border-color", "#D0021B");
                }
                else if ($(element).attr("data-role") === "tagsinput") {
                    $(element).parent().find(".bootstrap-tagsinput").css("border-color", "#D0021B");
                }
                else {
                    $(element).addClass("form-control-error");
                }

                // Marca los asteriscos en rojo
                $(element).closest(".form-group").find("span.form-text").addClass("form-text-error");
            },
            unhighlight: function (element, errorClass, validClass) {
                //console.log("limpiando" + element.id);
                $(element.form).find(`.error label[for=${element.id}] `).fadeOut("slow");

                // Desmarca los bordes de los elementos en rojo
                if ($(element).is(".select2-hidden-accessible")) { //Si es un select2
                    $(element).parent().find(".select2-selection").css("border-color", "");
                }
                else if ($(element).attr("data-role") === "tagsinput") { // Si es un Bootsrap Tags Input
                    $(element).parent().find(".bootstrap-tagsinput").css("border-color", "");
                }
                else {
                    $(element).removeClass("form-control-error");
                }

                // Desmarca los asteriscos en rojo
                $(element).closest(".form-group").find("span.form-text").removeClass("form-text-error");
            },
            errorPlacement: function (error, element) {
                $(error).addClass("error form-text form-text-error small");
                if (element.parent(".input-group").length) {
                    error.insertAfter(element.parent()).hide().fadeIn("slow");
                } else {
                    if (element.is(":checkbox")) {
                        error.css("margin-left", "15px");
                        error.insertAfter(element.parent().parent()).hide().fadeIn("slow");
                    }
                    else if (element.is(":radio")) {
                        error.insertAfter(element.parent().parent()).hide().fadeIn("slow");
                    }
                    else if (element.is(".select2-hidden-accessible")) {
                        error.insertAfter(element.parent().find(".select2")).hide().fadeIn("slow");
                    }
                    else if (element.attr("data-role") === "tagsinput") {
                        error.insertAfter(element.parent().find(".bootstrap-tagsinput"));
                    }
                    else {
                        error.insertAfter(element).hide().fadeIn("slow");
                    }
                }
            },
            submitHandler: function (form) {
                $(this).trigger("submitHandler", form);
            }
        });

        if (oValidate === null || oValidate === undefined) return oValidate;

        oValidate.tResetForm = function () {
            this.resetForm();
            $(`#divAlert${this.currentForm.id}`).html("");
            $(`#divAlert${this.currentForm.id}`).hide();
            this.setAsterisks();
            this.elements().parent().find(".select2-selection").css("border-color", "");
        };

        oValidate.showAlert = function (oMessage) {            
            var div = $(`#divAlert${this.currentForm.id}`);

            if (oMessage.isListed === undefined || oMessage.isListed === null)
                oMessage.isListed = false;

            if (!oMessage.isListed) {
                div.css("text-align", "center");
                div.html(oMessage.sMessage);
            } else {
                div.css("text-align", "left");
                var sOriginal = div.html();
                var sNueva = `<ul>${sOriginal.replace("<ul>", "").replace("</ul>", "")}<li>${oMessage.sMessage}</li></ul>`;
                div.html(sNueva);
            }

            if (oMessage.isScroll) {
                // Para modal
                if ($(`#${this.currentForm.id}`).parents(".modal").length > 0)
                    $(`#${this.currentForm.id}`).parents(".modal").animate({ scrollTop: 0 });
                else // para seccion
                    $(window).scrollTop($(`#${this.currentForm.id}`).offset().top - 160);
            }

            if (oMessage.iSeconds === undefined || oMessage.iSeconds === null)
                div.fadeIn("slow");
            else
                div.fadeIn("slow", function () { window.setTimeout(function () { div.hide("slow"); }, (oMessage.iSeconds * 1000)); });
        };

        oValidate.setAsterisks = function () {            
            var arReglas = this.settings.rules;
            for (let i in arReglas) {
                if (arReglas.hasOwnProperty(i)) {
                    var requiredPropertyList = $.grep(Object.getOwnPropertyNames(arReglas[i]),
                        function (property) { return property.indexOf("required") !== -1; });
                    if (requiredPropertyList.length < 1) continue;

                    var requiredProperty = requiredPropertyList[0];

                    var sOriginal = $(`label[for='${i}'], span[for='${i}']`).html() === undefined
                        ? undefined
                        : $(`label[for='${i}'], span[for='${i}']`).html().toString().trim();
                    if (sOriginal == undefined) continue;

                    var sDosPuntos = sOriginal.substr(sOriginal.length - 1) === ":" ? ":" : "";
                    sOriginal = sOriginal.toString()
                        .replace('<span class="form-text form-text-error">*</span>', "")
                        .replace('<span class="form-text">*</span>', "")
                        .replace(":", "");

                    var bResult = $.isFunction(arReglas[i][requiredProperty])
                        ? arReglas[i][requiredProperty]()
                        : arReglas[i][requiredProperty];

                    if (bResult) // Agregamos el asterisco
                        sOriginal = sOriginal + '<span class="form-text">*</span>' + sDosPuntos;
                    else // eliminamos el asterisco
                        sOriginal = sOriginal + sDosPuntos;

                    // guardando clic
                    var oLink = $($(`label[for='${i}'], span[for='${i}']`).find("a"));
                    var lEventos, mClick;
                    if (oLink.length > 0) {
                        lEventos = $._data(oLink[0], "events");
                        if (lEventos != undefined)
                            mClick = lEventos.click[0].handler;
                    }

                    // remplazando etiqueta
                    $(`label[for='${i}'], span[for='${i}']`).html(sOriginal);

                    // agregando clic
                    if (oLink.length > 0)
                        $(`#${oLink[0].id}`).on("click", mClick);
                }
            }
        };

        // Métodos privados
        var inicializar = function () {            
            var oForm = oValidate.currentForm;
            var arReglas = oValidate.settings.rules;
            var bLeyenda = false, sLeyenda = '<div class="pull-left text-muted text-vertical-align-button">* Campos obligatorios</div>';
            var sAlert = `<div id="divAlert${oForm.id}" class="alert alert-danger" hidden></div>`;
            var element;

            // Agregando la propiedad for            
            for (element in arReglas) {
                if (arReglas.hasOwnProperty(element)) {
                    $(`[name='${element}']`).closest(".form-group")
                        .find("label.control-label, span.textoizquierda, span.titulosubseccion").attr("for", element);
                }
            }

            // Verificando elementos requeridos
            for (element in arReglas) {
                if (arReglas.hasOwnProperty(element)) {
                    var elementRequiredTrue = $.grep(Object.getOwnPropertyNames(arReglas[element]),
                        function (rule) {
                            var bResult = false;
                            if (rule.indexOf("required") !== -1) {
                                bResult = $.isFunction(arReglas[element][rule])
                                    ? arReglas[element][rule]()
                                    : arReglas[element][rule];
                            }
                            return bResult;
                        });
                    if (elementRequiredTrue.length > 0) {
                        bLeyenda = true;
                        break;
                    }
                }
            }

            // Agregamos leyenda de campos requeridos y asterisco al titulo
            if (bLeyenda) {
                var oModal = $(`#${oForm.id}`).parent().parent().find(".modal-footer");
                if (oModal.length) {
                    if (!(oModal.html().toString().indexOf(sLeyenda) > -1))
                        oModal.append(sLeyenda);
                }
                else if (oForm.id !== "frmEncabezado") {
                    $(`#${oForm.id}`).append(sLeyenda);
                    var sTitulo = $(`#${oForm.id}`).parent().parent().parent().find(".panel-title a").html() + '<span class="form-text">*</span>';
                    $(`#${oForm.id}`).parent().parent().parent().find(".panel-title a").html(sTitulo);
                }
            }

            // Agregamos alert a la sección
            $(`#${oForm.id}`).before(sAlert);
        };

        inicializar();
        oValidate.tResetForm();

        return oValidate;
    };

    // Agrega la validacion de datatables
    $.validator.addMethod("requiredTable", function (value, element, param) {
        return true;
    });

    $.validator.addMethod("requiredFile", function (value, element, param) {
        if (param)
            return $(`#${element.name}`).attr("data-file-name") !== "";
        else
            return true;
    }, "Ingresa un documento");

    $.validator.addMethod("minRows", function (value, element, param) {
        if (value === "" || value == undefined) value = "0";
        return parseFloat(value) >= param;
    });

    $.validator.addMethod("maxRows", function (value, element, param) {
        if (value === "" || value == undefined) value = "0";
        return parseFloat(value) <= param;
    });

    $.validator.addMethod("minRowsDocs", function (value, element, param) {
        if (value === "" || value == undefined) value = "0";
        return parseFloat(value) >= param;
    });

    $.validator.addMethod("integer", function (value, element, param) {

        if (param) {
            if (value.length === 1) {
                return value >= "0" && value <= "9";
            }

            if (value[0] < "1" || value[0] > "9")
                return false;

            for (var i = 1; i < value.length; ++i)
                if (value[i] < "0" || value[i] > "9")
                    return false;
        }

        return true;
    });

    $.validator.addMethod("lettersAndSigns", function (value, element, param) {

        var map = {};
        var newString = "", char;
        var regex = /^[a-z .\-A-Z]+$/;

        map["á"] = "a"; map["Á"] = "A";
        map["é"] = "e"; map["É"] = "E";
        map["í"] = "i"; map["Í"] = "I";
        map["ó"] = "o"; map["Ó"] = "O";
        map["ú"] = "u"; map["Ú"] = "U";
        map["ñ"] = "n"; map["Ñ"] = "N";
        map["ü"] = "u"; map["Ü"] = "U";

        if (typeof param === "object")
            map = $.extend(map, param);

        for (var i = 0; i < value.length; ++i) {
            if (typeof map[value[i]] != "undefined")
                char = map[value[i]];
            else
                char = value[i];

            newString += char;
        }

        if (newString === "")
            return true;

        return regex.test(newString);
    });

    $.validator.addMethod("lettersSignsAndNumbers", function (value, element, param) {

        var map = {};
        var newString = "", char;
        var regex = /^[a-z.0-9 \-A-Z]+$/;

        map["á"] = "a"; map["Á"] = "A";
        map["é"] = "e"; map["É"] = "E";
        map["í"] = "i"; map["Í"] = "I";
        map["ó"] = "o"; map["Ó"] = "O";
        map["ú"] = "u"; map["Ú"] = "U";
        map["ñ"] = "n"; map["Ñ"] = "N";
        map["ü"] = "u"; map["Ü"] = "U";

        if (typeof param === "object")
            map = $.extend(map, param);

        for (var i = 0; i < value.length; ++i) {
            if (typeof map[value[i]] != "undefined")
                char = map[value[i]];
            else
                char = value[i];

            newString += char;
        }

        if (newString === "")
            return true;

        return regex.test(newString);
    });

    $.validator.addMethod("phoneNumber", function (value, element, param) {
        if (!element.required && value === "") return true;
        var regex = /^(\([0-9]{2}\)\s*|[0-9]{2}\-)[0-9]{4}-[0-9]{4}$/;
        //var regex = /^([+]?[0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[0-9])+$/;        
        return !param || regex.test(value);
    });

    $.validator.addMethod("codigoPostal", function (value, element, param) {
        var regex = /^[0-9]+$/;

        return value.length === 5 && regex.test(value);
    });

    $.validator.addMethod("minStrict", function (value, element, param) {
        if (!element.required && value === "")
            return true;

        return value.replace(/,/g, "") > param;
    });

    $.validator.addMethod("maxStrict", function (value, element, param) {
        if (!element.required && value === "")
            return true;

        return value.replace(/,/g, "") < param;
    });

    $.validator.addMethod("rfc", function (value, element, param) {
        if (!element.required && value === "") {
            return true;
        }
        //r regex = /^([A-ZÑ&]{3,4})?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01]))?(?:-?)?([A-Z-0-9\d]{3})$/;
        var regex = /^[A-Z&\u00D1]{3}([A-Z&\u00D1]| )?\d{2}([0][1-9]|[1][0-2])([0][1-9]|[12][0-9]|3[01])[A-Z0-9]{3}$/;
        var Meses = [0, 31, 28, 31, 30, 31, 30, 31, 30, 30, 31, 30, 31];
        var resultRegex = regex.test(value.toUpperCase());

        if (resultRegex === true) {
            var pos = 4;
            if (value.length === 12) {
                pos = 3;
            }
            var Anio = parseInt(value.substr(pos, 2));
            var Mes = parseInt(value.substr(pos + 2, 2));
            var Dia = parseInt(value.substr(pos + 4, 2));
            var Residuo = Anio % 4;   // Si Residuo === 0, trae 29;

            if (Residuo === 0) {
                Meses[2] = 29;
            }

            if (Dia > Meses[Mes]) {
                return false;
            }

            if (typeof param === "string") {
                if (param.trim().toUpperCase() === "FISICA") {
                    return value.length === 13 && resultRegex;
                }
                else {
                    return value.length === 12 && resultRegex;
                }
            } else if (param === true) {
                return (value.length === 12 || value.length === 13) && resultRegex;
            } else if (param === false) {
                return true;
            }
        }

        return false;
    });

    $.validator.addMethod("curp", function (value, element, param) {
        if (!element.required && value === "") {
            return true;
        }
        var regex = /^[A-Z&\u00D1]{4}\d{2}([0][1-9]|[1][0-2])([0][1-9]|[12][0-9]|3[01])[HM](AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NE|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TL|TS|VZ|YN|ZS)[A-Z]{3}[A-Z0-9][0-9]$/;
        var Meses = [0, 31, 28, 31, 30, 31, 30, 31, 30, 30, 31, 30, 31];
        var resultRegex = regex.test(value.toUpperCase());

        if (resultRegex === true) {
            var Anio = parseInt(value.substr(4, 2));
            var Mes = parseInt(value.substr(6, 2));
            var Dia = parseInt(value.substr(8, 2));
            var Residuo = Anio % 4;   // Si Residuo === 0, trae 29;

            if (Residuo === 0) {
                Meses[2] = 29;
            }

            if (Dia > Meses[Mes]) {
                return false;
            }
        }

        return resultRegex;
    });

    $.validator.addMethod("validdate", function (value, element, param) {
        if (typeof value !== "string") {
            return false;
        }

        if (!element.required && value === "")
            return true;

        var s = String(value).split(/[-\/., ]/);

        var dd = parseInt(s[0]);
        var mm = parseInt(s[1]);
        var yyyy = parseInt(s[2]);

        var dateStr = mm + "/" + dd + "/" + yyyy;

        var dt = new Date(dateStr);

        return dt.getDate() === dd && dt.getMonth() + 1 === mm && dt.getFullYear() === yyyy;
    });

    $.validator.addMethod("nDecimals", function (value, element, param) {
        if (!element.required && value === "")
            return true;

        var regexp = new RegExp(`^\\-{0,1}[0-9]+(\\.[0-9]{1,${param}})?$`);
        return value.length > 0 ? regexp.test(value.replace(/,/g, "")) : true;
    });

    $.validator.addMethod("nIntegers", function (value, element, param) {
        if (!element.required && value === "")
            return true;

        var regexp = new RegExp(`^\\-{0,1}[0-9]{1,${param}}?(\\.[0-9]+?)?$`);
        return value.length > 0 ? regexp.test(value.replace(/,/g, "")) : true;
    });

    $.validator.addMethod("regex", function (value, element, param) {
        var regex = new RegExp(param);
        return value.length > 0 ? regex.test(value) : true;
    });

    //Sobreescritura de métodos
    $.validator.methods.min = function (value, element, param) {
        return this.optional(element) || value.replace(/,/g, "") >= param;
    };

    $.validator.methods.max = function (value, element, param) {
        return this.optional(element) || value.replace(/,/g, "") <= param;
    };

    $.extend($.validator.messages, {
        required: "Este campo es obligatorio",
        remote: "Rellena este campo",
        email: "Escriba una dirección de correo válida.",
        url: "Escriba una URL válida",
        date: "Escriba una fecha válida",
        validdate: "Escriba una fecha válida",
        dateISO: "Escriba una fecha (ISO) válida",
        number: "Escriba un número válido",
        digits: "Escriba sólo dígitos",
        nDecimals: $.validator.format("Solo se permiten hasta {0} decimales"),
        nIntegers: $.validator.format("Solo se permiten hasta {0} enteros"),
        creditcard: "Escriba un número de tarjeta válido",
        equalTo: "Escriba el mismo valor de nuevo",
        accept: "Escriba un valor con una extensión válida",
        maxlength: $.validator.format("No escriba más de {0} caracteres"),
        minlength: $.validator.format("No escriba menos de {0} caracteres"),
        rangelength: $.validator.format("Escriba un valor entre {0} y {1} caracteres"),
        range: $.validator.format("Escriba un valor entre {0} y {1}"),
        max: $.validator.format("Escriba un valor menor o igual a {0}"),
        min: $.validator.format("Escriba un valor mayor o igual a {0}"),
        maxStrict: $.validator.format("Escriba un valor menor a {0}"),
        minStrict: $.validator.format("Escriba un valor mayor a {0}"),
        minRows: function (params, element) {
            var sMess = "";
            if (params === 1) sMess = "Agrega al menos un registro";
            else if (params > 1) sMess = `Agrega al menos ${params}  registros`;
            return sMess;
        },
        maxRows: function (params, element) {
            var sMess = "";
            if (params === 1) sMess = "Debe haber máximo un registro";
            else if (params > 1) sMess = `Debe haber máximo ${params} registros`;
            return sMess;
        },
        minRowsDocs: function (params, element) {
            var sMess = "";
            if (params === 1) sMess = "Agrega todos los documentos requeridos";
            else if (params > 1) sMess = `Agrega los ${params} requeridos`;
            return sMess;
        },
        integer: "Escriba un número entero sin valor decimal",
        lettersAndSigns: "Este campo sólo acepta letras, espacios y puntos",
        lettersSignsAndNumbers: "Este campo sólo acepta letras, espacios, números y puntos",
        phoneNumber: "El número telefónico sólo acepta dígitos y guiones. Formato; Tel. fijo: 55-2345-6789.",
        codigoPostal: "Código postal incorrecto",
        rfc: "El formato del RFC no es valido",
        regex: "Este campos sólo acepta ciertos caracteres",
        curp: "El formato CURP no es valido"
    });
})(jQuery);