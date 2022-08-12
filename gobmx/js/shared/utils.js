"use strict";
$.Utils = function () {
    var _self = {};

    // #region Componente CST.
    var esFechaAplicacionValida = function (date1, date2) {
        var a = dateParseFechaFormateada(date1).getTime(),
            b = new Date(date2).getTime(),
            diff = {};
        diff.milliseconds = a > b ? a % b : -1 * (b % a);
        diff.seconds = diff.milliseconds / 1000;
        diff.minutes = diff.seconds / 60;
        diff.hours = diff.minutes / 60;
        diff.days = diff.hours / 24;
        diff.weeks = diff.days / 7;

        return diff.minutes > 0;
    };

    var esTiempoValido = function (date1, date2, menor) {
        var a = dateParseFechaFormateada(date1).getTime(),
            b = new Date(date2).getTime(),
            diff = {};
        diff.milliseconds = a > b ? a % b : -1 * (b % a);
        diff.seconds = diff.milliseconds / 1000;
        diff.minutes = diff.seconds / 60;
        diff.hours = diff.minutes / 60;
        diff.days = diff.hours / 24;
        diff.weeks = diff.days / 7;

        if (menor)
            return diff.minutes >= 0 && diff.minutes <= CONFIGURACION_GLOBAL.TiempoMaximoSugerido.Valor;

        return diff.minutes > CONFIGURACION_GLOBAL.TiempoMaximoSugerido.Valor;
    };

    var tiempoSugerido = function (minutes) {
        var fecha = new Date(new Date().getTime() + minutes * 60000);
        return fecha.toLocaleDateString() + " " + fecha.toLocaleTimeString("es-mx", { hour: "2-digit", minute: "2-digit" });
    };

    var formatearHoraAplicacion = function (horaAplicacion) {
        if (horaAplicacion === "")
            return "";

        var hora = horaAplicacion.split(":");
        var hh = hora[0];
        var mm = hora[1];
        return hh.padLeft(2) + ":" + mm.padLeft(2);
    };

    var obtenerFechaControl = function () {
        $(".embed-clock-copyright").remove();
        if ($(".thetimenow-embeddable-clock").text().trim().length > 0) {
            var dtControl = $($(".thetimenow-embeddable-clock")[0]).text();
            var dtFiSplit = dtControl.split(",");
            var year = dtFiSplit[1] != undefined ? dtFiSplit[1].toString().trim().substring(0, 4) : "0000";
            var dtTSplit = dtFiSplit[0].split(":");
            var hh = dtTSplit[0];
            var mm = dtTSplit[1];
            var dtSubStr = dtTSplit[2].toString().substring(2, dtTSplit[2].length);
            var dtFoSplit = dtSubStr.split(" ");
            var month = dtFoSplit[0];
            var day = dtFoSplit[1];
            let mes = -1;
            switch (month) {
                case "Ene":
                case "Jan":
                    mes = 0;
                    break;
                case "Feb":
                    mes = 1;
                    break;
                case "Mar":
                    mes = 2;
                    break;
                case "Abr":
                case "Apr":
                    mes = 3;
                    break;
                case "May":
                    mes = 4;
                    break;
                case "Jun":
                    mes = 5;
                    break;
                case "Jul":
                    mes = 6;
                    break;
                case "Ago":
                case "Aug":
                    mes = 7;
                    break;
                case "Sep":
                    mes = 8;
                    break;
                case "Oct":
                    mes = 9;
                    break;
                case "Nov":
                    mes = 10;
                    break;
                case "Dec":
                    mes = 11;
                    break;
                default:
            }
            return new Date(year, mes, day, hh, mm);
        }
        return new Date();
    };

    function dateParseFechaFormateada(date1) {
        var fecha = date1.indexOf("-") > -1 ? date1.split("-") : date1.split("T");
        var fechaTime = date1.indexOf("-") > -1 ? fecha[2].split(" ") : fecha[1];
        var fechaTimeSplit = date1.indexOf("-") > -1 ? fechaTime[1].split(":") : fechaTime.split(":");
        var anio = date1.indexOf("-") > -1 ? fechaTime[0] : fecha[0].split("-")[0];
        var mes = date1.indexOf("-") > -1 ? fecha[1] - 1 : fecha[0].split("-")[1];
        var dia = date1.indexOf("-") > -1 ? fecha[0] : fecha[0].split("-")[2];
        var hh = fechaTimeSplit[0];
        var mm = fechaTimeSplit[1];
        return new Date(anio, mes, dia, hh, mm);
    }

    var formatoFecha = function (date) {
        return moment.tz(date, "America/Mexico_City").format("DD-MM-YYYY HH:mm");
    };
    // #endregion

    //#region Funcionalidad para Datepicker
    var habilitarDiasInhabiles = function (date) {
        var dmy = (date.getMonth() + 1);
        if (date.getMonth() < 9)
            dmy = `0${dmy}`;
        dmy += "-";

        if (date.getDate() < 10) dmy += "0";
        dmy += date.getDate() + "-" + date.getFullYear();        

        var today = new Date();
        if (today.toDateString() === date.toDateString()) {
            return [true, "", ""];
        }
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        today.setMilliseconds(0);

        var timeDiff = today.getTime() - date.getTime();
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        if (diffDays === 1)
            return [true, "", ""];

        if ((date.getDay() === 0 || date.getDay() === 5 || date.getDay() === 6) && today.getDay() === 1) {
            timeDiff = Math.abs(timeDiff);
            diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            if (diffDays <= 3) {
                return [true, "", ""];
            }
            else {
                return [false, "", ""];
            }
        }

        var availableDates = ["10-13-2017", "10-14-2017", "10-15-2017", "10-16-2017", "10-17-2017", "10-18-2017", "10-19-2017"];
        //Funcionalidad para cuando se tengan los días que se tienen que habilitar
        if ($.inArray(dmy, availableDates) !== -1) {
            return [true, "", ""];
        } else {
            return [false, "", ""];
        }
    };
    // #endregion

    // #region Funcionalidad para Datatable
    var formatoColumnaMiles = function (data, type, full, numeroDecimales, simbolo, direction) {
        var simboloFinal = simbolo === undefined ? "" : simbolo + " ";
        var decimalesFinal = numeroDecimales === undefined ? 2 : numeroDecimales;
        var directionFinal = direction === undefined ? true : false;
        var val = data.toString();
        var punto = val != undefined && val !== "" ? val.indexOf(".") : -1;
        var entero, decimal, enteroProvicional, decimalProvicional;

        if (punto !== -1) {
            entero = val.substring(0, punto);
            decimalProvicional = val.substring(punto + 1);
            decimal = `.${(decimalProvicional).padRight(decimalesFinal)}`;
            enteroProvicional = parseFloat(entero);
            entero = parseFloat(entero.replace(/,/g, ""))
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        } else {
            enteroProvicional = parseFloat(val);
            entero = val != undefined && val !== "" ? parseFloat(val.replace(/,/g, "")).toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0;
            decimal = `.${("").padRight(decimalesFinal)}`;
        }
        if (directionFinal)
            return simboloFinal + (isNaN(enteroProvicional) ? 0 : entero) + (isNaN(decimal) ? 0 : decimal);
        else
            return (isNaN(enteroProvicional) ? 0 : entero) + (isNaN(decimal) ? 0 : decimal) + " " + simboloFinal;
    };

    var UpdateFooterTable = function (api, numColumna, numeroDecimales, simbolo, direction, render) {
        render = render === undefined ? true : render;
        var simboloFinal = simbolo === undefined ? "" : simbolo + " ";
        var directionFinal = direction === undefined ? true : direction;
        var decimalesFinal = numeroDecimales === undefined ? 2 : numeroDecimales;
        var total = 0.0;
        var totalFinal = "";
        var entero, decimal, enteroProvicional;
        if (api.data().length > 0) {
            var totalTemp = api
                .column(numColumna)
                .data()
                .reduce(function (a, b) {
                    var pfa = parseFloat(a);
                    var pfb = parseFloat(b);
                    var ra = isNaN(pfa) ? 0 : pfa;
                    var rb = isNaN(pfb) ? 0 : pfb;
                    return ra + rb;
                });
            if (totalTemp.toString().indexOf(".") !== -1) {
                var parteEntera = totalTemp.toString().split(".")[0];
                var parteDecimal = totalTemp.toString().split(".")[1];
                var parteDecimalFormateada = parteDecimal.substring(0, Math.min(parteDecimal.length, 6));
                enteroProvicional = parseFloat(parteEntera);
                decimal = `.${parteDecimalFormateada.padRight(decimalesFinal)}`;
                entero = parseFloat(parteEntera.replace(/,/g, ""))
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            } else {
                total = totalTemp;
                enteroProvicional = parseFloat(totalTemp);
                entero = totalTemp != undefined && totalTemp !== "" ? parseFloat(totalTemp.toString().replace(/,/g, "")).toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0;
                decimal = `.${("").padRight(decimalesFinal)}`;
            }
        }
        if (directionFinal)
            totalFinal = simboloFinal + (isNaN(enteroProvicional) ? 0 : entero) + (isNaN(decimal) ? 0 : decimal);
        else
            totalFinal = (isNaN(enteroProvicional) ? 0 : entero) + (isNaN(decimal) ? 0 : decimal) + " " + simboloFinal;
        if (parseFloat(totalFinal) === 0)
            totalFinal = 0;
        // Update footer
        if (render) {
            $(api.column(numColumna).footer()).html(
                totalFinal
            );
        }
        return totalFinal;
    };
    // #endregion

    // #region Funcionalidades de utilidad FORM
    var MilesFormat = function (amount, numberDecimals) {
        amount = amount || "";
        amount = amount.toString();
        numberDecimals = numberDecimals || 2;

        var dot = amount != undefined && amount !== "" ? amount.indexOf(".") : -1;
        var integer, decimal, integerTemp, decimalTemp;

        if (dot !== -1) {
            integer = amount.substring(0, dot);
            decimalTemp = amount.substring(dot + 1);
            decimal = `.${(decimalTemp).padRight(numberDecimals)}`;
            integerTemp = parseFloat(integer);
            integer = parseFloat(integer.replace(/,/g, ""))
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        } else {
            integerTemp = parseFloat(amount);
            integer = amount != undefined && amount !== "" ? parseFloat(amount.replace(/,/g, "")).toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0;
            decimal = `.${("").padRight(numberDecimals)}`;
        }
        return (isNaN(integerTemp) ? 0 : integer) + (isNaN(decimal) ? 0 : decimal);
    };

    var loadGenericSelect = function (element, dataArray, key, value, removeRepeated, isSelect2) {
        element.empty();
        element.append("<option value=\"\">Selecciona un valor...</option>");
        if (isSelect2) element.empty();
        for (let i = 0; i < dataArray.length; i++) {
            element.append($("<option/>").val(dataArray[i][key]).text(dataArray[i][value]));
        }
        //Remueve los productos agregados repetidos
        if (removeRepeated) {
            var map = {};
            $(`#${element.prop("id")} option`).each(function () {
                if (map[this.value]) {
                    $(this).remove();
                }
                map[this.value] = true;
            });
        }
    };

    var loadGenericSelects = function (elementArray, dataArray, key, value, removeRepeated, isSelect2) {
        for (let i = 0; i < elementArray.length; i++) {
            loadGenericSelect(elementArray[i], dataArray, key, value, removeRepeated, isSelect2);
        }
    };

    var uniqueArrayObjects = function (list) {
        var result = [];
        var agregar = false;
        $.each(list, function (i, object) {
            for (let j = 0; j < result.length; j++) {
                if (JSON.stringify(object) !== JSON.stringify(result[j])) {
                    agregar = true;
                } else {
                    agregar = false;
                    break;
                }
            }
            if (agregar)
                result.push(object);

            if (i === 0)
                result.push(object);
        });
        return result;
    };

    function searchRepeatedOnArray(data, filters, parent) {
        var repeatedData = [];
        if (!filters || !filters.length) {
            filters = [];
            for (let key in data[0]) {
                if (key !== parent)
                    filters.push(key);
            }
        }
        var repeated = searchRepeated(data, filters);
        $.each(repeated[1], function (i, object) {
            repeatedData = $.merge(repeatedData, [object[parent]]);
        });
        return repeatedData;
    }

    function searchRepeated(data, filters) {
        if (!filters || !filters.length) {
            filters = Object.getOwnPropertyNames(data);
        }
        var oRepeatedData = {};
        var repeatedData = [];
        var childrenArrayType = [];
        var childrenObjectType = [];
        $.each(filters, function (i, filter) {
            oRepeatedData[filter] = [];
        });
        $.each(filters, function (iFilter, filter) {
            var originalFilter = filter;
            var complexFilter = [];
            childrenArrayType = [];
            childrenObjectType = [];
            $.each(data, function (dataIndex, object) {
                if (filter.indexOf(".") !== -1) {
                    complexFilter = filter.split(".");
                    filter = complexFilter[0];
                    complexFilter.shift();
                }

                var child;
                if ($.type(object[filter]) === "array") {
                    child = $.extend(true, [], object[filter]);
                    for (let i = 0; i < child.length; i++) {
                        child[i].Parent = object;
                    }
                    childrenArrayType = $.merge(childrenArrayType, child);
                }
                else if ($.type(object[filter]) === "object") {
                    child = $.extend(true, {}, object[filter]);
                    child.Parent = object;
                    childrenObjectType = $.merge(childrenObjectType, [child]);
                }
                else { //Primitive value
                    var repeated = $.grep(data, function (element, elementIndex) {
                        return elementIndex !== dataIndex && element[filter] === object[filter];
                    });
                    if (repeated.length) {
                        repeatedData = $.merge(repeatedData, repeated);
                        oRepeatedData[filter] = $.merge(oRepeatedData[filter], repeated);
                    }
                }
            });
            var childrenFilter = originalFilter === filter ? null : complexFilter;

            //ArrayType
            if (childrenArrayType.length) {
                repeatedData = $.merge(repeatedData, searchRepeatedOnArray(childrenArrayType, childrenFilter, "Parent"));
                oRepeatedData[originalFilter] = $.merge(oRepeatedData[originalFilter],
                    searchRepeatedOnArray(childrenArrayType, childrenFilter, "Parent"));
            }
            //ObjectType
            if (childrenObjectType.length) {
                repeatedData = $.merge(repeatedData, searchRepeatedOnArray(childrenObjectType, childrenFilter, "Parent"));
                oRepeatedData[originalFilter] = $.merge(oRepeatedData[originalFilter],
                    searchRepeatedOnArray(childrenObjectType, childrenFilter, "Parent"));
            }
        });
        for (let key in oRepeatedData) {
            if (oRepeatedData.hasOwnProperty(key)) {
                oRepeatedData[key] = uniqueArrayObjects(oRepeatedData[key]);
                if (!oRepeatedData[key].length)
                    delete oRepeatedData[key];
            }
        }
        repeatedData = uniqueArrayObjects(repeatedData);
        return [oRepeatedData, repeatedData];
    }

    var DeleteItemsObjecArray = function (originalObjectArray, toDeleteObjecArray, jsonPathArray) {
        var resultArray = [];

        $.each(originalObjectArray, function (i, item) {
            var toDelete = false;
            $.each(toDeleteObjecArray, function (i, objToDelete) {
                if (_self.objEquals(item, objToDelete, jsonPathArray))
                    toDelete = true;
            });
            if (!toDelete) resultArray.push(item);
        });

        return resultArray;
    };

    var roundToX = function (num, X) {
        var decimalFormateado = "0.", totalDecimales = "", numeroDecimal;
        if (num.toString().indexOf("e") > -1) {
            totalDecimales = num.toString().substring(num.toString().indexOf("-") + 1, num.toString().length);
            numeroDecimal = num.toString().substring(0, num.toString().indexOf("e"));
            decimalFormateado += numeroDecimal.toString().padLeft(totalDecimales);
            return +(Math.round(decimalFormateado + "e+" + X) + "e-" + X);
        }
        return +(Math.round(num + "e+" + X) + "e-" + X);
        //return Math.round(num * X) / X;
    };

    var select2DelimiterSeparatedString = function (element, delimiter) {
        if (element.hasClass("select2-hidden-accessible")) {
            let cadena = "";
            var data = element.select2("data");
            if (data.length) {
                var total = data.length;
                for (let i = 0; i < total - 1; i++) {
                    cadena += data[i].text + delimiter + " ";
                }
                cadena += data[total - 1].text;
            }
            return cadena;
        }
        throw console.log("Este elemento no es de tipo select2");
    };

    var clockUTC = function (element, utc) {
        var timeZone;
        switch (utc.toUpperCase()) {
            case "TS":
            case "TCFF":
                timeZone = "America/Cancun";
                break;
            case "TC":
            case "TPFF":
                timeZone = "America/Mexico_City";
                break;
            case "TP":
            case "TNFF":
                timeZone = "America/Chihuahua";
                break;
            case "TN":
                timeZone = "America/Tijuana";
                break;
            default:
        }
        element.uClock(timeZone);
    };

    var getData = function (array, object) {
        var result = $.grep(array, function (data) {
            var compare = true;
            for (let parameter in object) {
                if (object.hasOwnProperty(parameter)) {
                    if (object[parameter] !== data[parameter]) {
                        compare = false;
                        break;
                    }
                }
            }
            return compare;
        });

        if (result.length === 0) return undefined;
        else return result[0].valor;
    };

    var getDataJson = function (array, object) {
        var result = $.grep(array, function (data) {
            var compare = true;
            for (let parameter in object) {
                if (object.hasOwnProperty(parameter)) {
                    if (object[parameter] !== data[parameter]) {
                        compare = false;
                        break;
                    }
                }
            }
            return compare;
        });

        if (result.length === 0) return {};
        else if (result[0].valor === undefined || result[0].valor === null || result[0].valor === "") return {};
        else {
            let text = result[0].valor.replace(/\\/g, "");
            if (text[0] === '"')
                text = text.substring(1, text.length - 1);

            var textPase = JSON.parse(text, function (k, v) {
                return v;
            });

            return textPase;

        }
    };

    function removeDuplicates(originalArray, prop) {
        var newArray = [];
        var lookupObject = {};

        var i;
        for (i = 0; i < originalArray.length; i++) {
            lookupObject[originalArray[i][prop]] = originalArray[i];
        }

        for (i in lookupObject) {
            if (lookupObject.hasOwnProperty(i)) {
                newArray.push(lookupObject[i]);
            }
        }
        return newArray;
    }

    var GetObjectByParameter = function (objectParent, parameterName, result) {
        for (let nameObjectChild in objectParent) {
            if (objectParent.hasOwnProperty(nameObjectChild)) {
                var objectChild = objectParent[nameObjectChild];
                if (nameObjectChild.toLowerCase().indexOf(parameterName) >= 0 && objectChild !== "") {
                    result.push(objectParent);
                    break;
                }
                var typeObject = $.type(objectChild);
                if (typeObject === "object" || (typeObject === "array" && objectChild.length > 0))
                    GetObjectByParameter(objectChild, parameterName, result);
            }
        }
    };

    var GetListNamesDocuments = function (documents) {
        var result = {
            error: false,
            listNamesDocuments: []
        };

        for (let d = 0; d < documents.length; d++) {
            if (documents[d].SystemName !== undefined) {
                result.listNamesDocuments.push(documents[d].SystemName);
            } else { result.error = true };
        }

        return result;
    };

    var obtenerValorCampo = function (array, typeList) {        
        var long_name = "";
        $.each(array, function (index, l) {
            if ($.inArray(typeList, l.types) !== -1) {
                long_name = l.long_name;
            }
        });
        return long_name;
    };
    // #endregion

    // #region Extensiones de clases de JS
    String.prototype.padLeft = function (size) {
        var s = String(this);
        while (s.length < (size || 2)) {
            s = `0${s}`;
        }
        return s;
    };
    String.prototype.padRight = function (size) {
        var s = String(this);
        while (s.length < (size || 2)) {
            s = s + "0";
        }
        return s;
    };
    String.prototype.Decode = function () {
        return $("<div/>").html(this).text();
    };
    Date.prototype.formatDMYYYY = function () {
        return this.getDate() +
            "/" + (this.getMonth() + 1) +
            "/" + this.getFullYear();
    };
    Date.prototype.formatDDMMYYYY = function () {
        return (`0${this.getDate()}`).slice(-2) +
            "/" + (`0${this.getMonth() + 1}`).slice(-2) +
            "/" + this.getFullYear();
    };
    Date.prototype.format = function (stringFormat) {

    };
    jQuery.fn.extend({
        select2String: function (delimiter) {
            return select2DelimiterSeparatedString($(this), delimiter || ",");
        },

        clockUTC: function (type) {
            return clockUTC($(this), type);
        }
    });
    jQuery.fn.dataTable.Api.register("page.jumpToPage()", function (data, column, nameColumn) {
        var page = -1, firstPage = -1, currentPage = -1;
        for (let i = 0; i < data.length; i++) {
            var pos = this.column(column, { order: "index" }).data().indexOf(data[i][nameColumn]);
            currentPage = this.column(column, { order: "current" }).data().indexOf(data[i][nameColumn]);
            if (pos >= 0) {
                var page = Math.floor(currentPage / this.page.info().length);
                if (i === 0)
                    firstPage = page;
                $(this.row(pos).nodes()).addClass("wrongRecord");
            }
        }
        this.page(firstPage).draw(false);
        return this;
    });
    jQuery.fn.dataTable.Api.register("data.repeated()", function (filters) {
        var thisTable = this;
        var thisData = thisTable.data();
        if (!thisData.length)
            return [{}, []];

        return searchRepeated(thisData, filters);
    });
    // #endregion

    // #region Funcionalidades para clases CSS
    $(".removeComma").change(function () {
        var valorOriginal = $(this).val();
        var valor = valorOriginal.replace(/,/g, "");
        $(this).val(valor);
    });

    $(".check-seguridad").strength({
        templates: {
            toggle: '<span class="input-group-addon"><span class="glyphicon glyphicon-eye-open {toggleClass}"></span></span>'

        },
        scoreLables: {
            empty: "Vacío",
            invalid: "Invalido",
            weak: "Débil",
            good: "Bueno",
            strong: "Fuerte"
        },
        scoreClasses: {
            empty: "",
            invalid: "label-danger",
            weak: "label-warning",
            good: "label-info",
            strong: "label-success"
        }

    });
    // #endregion

    // #region Métodos públicos
    _self = $.extend(_self, {
        formatoFecha: function () {
            return formatoFecha();
        },
        esTiempoValido: function (date1, date2, menor) {
            return esTiempoValido(date1, date2, menor);
        },
        esFechaAplicacionValida: function (date1, date2) {
            return esFechaAplicacionValida(date1, date2);
        },
        obtenerTiempoValido: function () {
            return tiempoSugerido(CONFIGURACION_GLOBAL.TiempoMaximoSugerido.Valor);
        },
        obtenerHoraAplicacionFormateada: function (horaAplicacion) {
            return formatearHoraAplicacion(horaAplicacion);
        },
        obtenerFechaControl: function (fecha) {
            return obtenerFechaControl(fecha);
        },
        habilitarDiasInhabiles: function (date, a) {
            return habilitarDiasInhabiles(date, a);
        },
        formatoColumnaMiles: function (data, type, full, numeroDecimales, simbolo, direction) {
            return formatoColumnaMiles(data, type, full, numeroDecimales, simbolo, direction);
        },
        updateFooterTable: UpdateFooterTable,
        loadGenericSelect: function (element, dataArray, key, value, removeElements, isSelect2) {
            return loadGenericSelect(element, dataArray, key, value, removeElements, isSelect2 || false);
        },
        loadGenericSelects: function (elementsArray, dataArray, key, value, removeElements, isSelect2) {
            return loadGenericSelects(elementsArray, dataArray, key, value, removeElements || false, isSelect2 || false);
        },
        milesFormat: MilesFormat,
        uniqueArrayObjects: function (list) {
            return uniqueArrayObjects(list);
        },
        roundToX: function (num, X) {
            return roundToX(num, X);
        },
        objEquals: function (a, b, aJsonPath) {
            var equal = true;

            if (aJsonPath) {
                var values2Compare = aJsonPath;

                for (let e = 0; e < values2Compare.length; e++) {
                    if (this.objValue(a, values2Compare[e]) !== this.objValue(b, values2Compare[e])) {
                        equal = false;
                        break;
                    }
                }
            } else {
                equal = JSON.stringify(a) === JSON.stringify(b);
            }

            return equal;
        },
        deleteItemsObjecArray: DeleteItemsObjecArray,
        objValue: function (object, sPath) {
            var parameters = sPath.split(".");
            var value = object || {};

            for (let p = 0; p < parameters.length; p++) {
                if ($.isFunction(value[parameters[p]])) {
                    value = value[parameters[p]]();
                } else
                    value = value[parameters[p]];
                if (value === undefined) break;
            }
            return value;
        },
        getObjectByParameter: GetObjectByParameter,
        getListNamesDocuments: GetListNamesDocuments,
        ObtenerValorCampo: obtenerValorCampo
        //SoloNumeros: function (b, largo) {
        //    return soloNumeros (b, largo);
        //},
        //MaxLong: function (b, largo) {
        //    return maxLong (b, largo);
        //}
    });
    // #endregion

    return _self;
};

var Utils = $.Utils();