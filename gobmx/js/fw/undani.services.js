"use strict";
$.Services = function () {
    var self = {};

    $.ajaxSetup({
        timeout: 3000,      // 3 segundos de tiempo de espera
        retryAfter: 7000    //reintenta despues de 7 segundos
    });

    //#region SERVICES CONTROLLER

    // Obtiene el token anónimo.
    function getToken() {
        const url = "/Account/GetToken";
        return $.ajax({
            url: url,
            method: "GET",
            async: false
        }).done(function (data) {
            return data.token;
        }).fail(function () {
            return null;
        });
    };

    //Obtiene los metadatos de una actividad
    function getMetadata(a) {
        const url = form.data().GlobalSetting.UrlForm.Rute + "/Form/ObtenerMetadatos";
        return $.ajax({
            url: url,
            dataType: "json",
            method: "GET",
            async: false,
            data: {
                "n": a
            }
        }).done(function (n) {
            return n;
        }).fail(function (jqXHR) {
            if (jqXHR.status === 408) {
                setTimeout(function () { getMetadata(a) }, $.ajaxSetup().retryAfter);
            }
            console.log("Servicio no disponible");
            return null;
        });
    };
    //#endregion

    //#region SERVICES FORM
    function getFormInstance(instanceId) {
        const token = getToken();
        return $.ajax({
            async: false,
            crossDomain: true,
            url: form.data().GlobalSetting.FormApi.Rute + "/Execution/GetInstance?instanceId=" + instanceId,
            method: "GET",
            headers: {
                "cache-control": "no-cache",
                "Authorization": token.responseJSON.token
            },
            processData: false
        });
    };

    function getFormJson(instanceId) {
        const token = getToken();
        return $.ajax({
            async: false,
            crossDomain: true,
            url: form.data().GlobalSetting.FormApi.Rute + "/Execution/GetJsonInstance?instanceId" + instanceId,
            method: "GET",
            headers: {
                "cache-control": "no-cache",
                "Authorization": token.responseJSON.token
            },
            processData: false
        });
    };

    function updateInstance(instanceId, json, readOnly) {
        const token = getToken();
        return $.ajax({
            async: false,
            crossDomain: true,
            url: form.data().GlobalSetting.FormApi.Rute +
                "/Execution/UpdateInstance?instaceId=" +
                instanceId +
                "&readOnly=" +
                readOnly,
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "cache-control": "no-cache",
                "Authorization": token.responseJSON.token
            },
            processData: true,
            data: {
                "json": json
            }
        });
    };

    function deleteInstance(instanceId) {
        const token = getToken();
        return $.ajax({
            async: false,
            crossDomain: true,
            url: form.data().GlobalSetting.FormApi.Rute + "/Execution/DeleteInstance?instaceId=" + instanceId,
            method: "POST",
            headers: {
                "cache-control": "no-cache",
                "Authorization": token.responseJSON.token
            },
            processData: true
        });
    };
    //#endregion

    //#region SERVICES TEMPLATE
    function generateTemplates(parameters) {
        return $.ajax({
            async: false,
            crossDomain: true,
            url: form.data().GlobalSetting.UndaniTemplate.TemplateMixed,
            method: "POST",
            contentType: "application/json",
            processData: false,
            dataType: "json",
            data: JSON.stringify(parameters)
        });
    };
    //#endregion

    //#region SERVICES BOX
    function synchronize(instanceId, documents) {
        const token = getToken();
        const oJson = { InstanceId: instanceId, Files: documents };

        return $.ajax({
            async: false,
            crossDomain: true,
            url: form.data().GlobalSetting.UndaniBox.Synchronize,
            type: "POST",
            dataType: "json",
            traditional: true,
            headers: {
                "Content-Type": "application/json",
                "cache-control": "no-cache",
                "Authorization": token.responseJSON.token
            },
            data: JSON.stringify(oJson)
        });
    };
    //#endregion

    //#region SERVICES MAIL NOTIFICATION
    function sendMailNotification(environmentId, systemActionId, instanceId) {
        const oJson = { EnvironmentId: environmentId, SystemActionId: systemActionId, InstanceId: instanceId };
        return $.ajax({
            async: false,
            crossDomain: true,
            url: form.data().GlobalSetting.UndaniTemplate.MailNotification,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "cache-control": "no-cache"
            },
            processData: false,
            data: JSON.stringify(oJson)
        });
    };

    function updateNotificationMail(tramitnumber, ctRFC, rlRFC, eMail) {
        return $.ajax({
            async: false,
            crossDomain: true,
            url: form.data().GlobalSetting.Integration.Rute +
                "/Integration/UpdateNotificationMail?tramitNumber=" +
                tramitnumber +
                "&cTRFC=" +
                ctRFC +
                "&rLRFC=" +
                rlRFC +
                "&email=" +
                eMail,
            method: "POST",
            headers: {
                "cache-control": "no-cache"
            }
        });
    };

    function notificationStatus(tramitNumber, eMail) {
        return $.ajax({
            async: false,
            crossDomain: true,
            url: form.data().GlobalSetting.Integration.Rute +
                "/Integration/NotificationStatus?tramitNumber=" +
                tramitNumber +
                "&email=" +
                eMail,
            method: "GET",
            headers: {
                "cache-control": "no-cache"
            }
        });
    };
    //#endregion

    //#region SEPOMEX SERVICES OF FONACOT
    function getEntidades() {
        return $.ajax({
            async: false,
            crossDomain: true,
            url: form.data().GlobalSetting.Integration.WsFonacot + "/GetCatalogDetalle?tipoCatalogId=2",
            method: "GET",
            headers: {
                "cache-control": "no-cache"
            }
        });
    };

    function getMunicipios(idEntidad) {
        return $.ajax({
            async: false,
            crossDomain: true,
            url: form.data().GlobalSetting.Integration.WsFonacot + "/GetMunicipios?eFederativaId=" + idEntidad,
            method: "GET",
            headers: {
                "cache-control": "no-cache"
            }
        });
    };

    //#endregion

    //#region CATALOGS OF TOOLS SERVICES
    function getSector(addother) {
        return $.ajax({
            async: false,
            crossDomain: true,
            url: form.data().GlobalSetting.Integration.Catalogos + "/GetSector?addOther=" + addother,
            method: "GET",
            headers: {
                "cache-control": "no-cache"
            }
        });
    };

    function getFormaPago(addother) {
        return $.ajax({
            async: false,
            crossDomain: true,
            url: form.data().GlobalSetting.Integration.Catalogos + "/GetFormaPago?addOther=" + addother,
            method: "GET",
            headers: {
                "cache-control": "no-cache"
            }
        });
    };

    function getFedatario(addother) {
        return $.ajax({
            async: false,
            crossDomain: true,
            url: form.data().GlobalSetting.Integration.Catalogos + "/GetFedatario?addOther=" + addother,
            method: "GET",
            headers: {
                "cache-control": "no-cache"
            }
        });
    };

    function getNotario(addother) {
        return $.ajax({
            async: false,
            crossDomain: true,
            url: form.data().GlobalSetting.Integration.Catalogos + "/GetNotario?addOther=" + addother,
            method: "GET",
            headers: {
                "cache-control": "no-cache"
            }
        });
    };

    function getGiroByScian(indicador) {
        return $.ajax({
            async: false,
            crossDomain: true,
            url: form.data().GlobalSetting.Integration.Catalogos + "/GetGiroByScian?indicaScian=" + indicador,
            method: "GET",
            headers: {
                "cache-control": "no-cache"
            }
        });
    };

    function getZonaEconomica(addother) {
        return $.ajax({
            async: false,
            crossDomain: true,
            url: form.data().GlobalSetting.Integration.Catalogos + "/GetZonaEconomica?addOther=" + addother,
            method: "GET",
            headers: {
                "cache-control": "no-cache"
            }
        });
    };
    //#endregion

    //#region FONACOT SERVICES
    function getTipoPersona() {
        return $.ajax({
            async: false,
            crossDomain: true,
            url: form.data().GlobalSetting.Integration.WsFonacot + "/GetCatalogDetalle?tipoCatalogId=5",
            method: "GET",
            headers: {
                "cache-control": "no-cache"
            }
        });
    };

    function getTipoSeguridadSocial() {
        return $.ajax({
            async: false,
            crossDomain: true,
            url: form.data().GlobalSetting.Integration.WsFonacot + "/GetCatalogDetalle?tipoCatalogId=4",
            method: "GET",
            headers: {
                "cache-control": "no-cache"
            }
        });
    };

    function getCasaMatriz(numerocliente) {
        return $.ajax({
            async: false,
            crossDomain: true,
            url: form.data().GlobalSetting.Integration.WsFonacot + "/GetCasaMatriz?numeroCliente=" + numerocliente,
            method: "GET",
            headers: {
                "cache-control": "no-cache"
            }
        });
    };

    function getSucursalesEstado(id) {
        return $.ajax({
            async: false,
            crossDomain: true,
            url: form.data().GlobalSetting.Integration.WsFonacot + "/GetCentroAfiliacionFonacot?idEstado=" + id,
            method: "GET",
            headers: {
                "cache-control": "no-cache"
            }
        });
    };

    function getSucursalesMatriz(id) {
        return $.ajax({
            async: false,
            crossDomain: true,
            url: form.data().GlobalSetting.Integration.WsFonacot + "/GetSucursalesPorCasaMatriz?idCasaMatriz=" + id,
            method: "GET",
            headers: {
                "cache-control": "no-cache"
            }
        });
    };

    function getDataCt(regPatronal, ctRfc) {
        return $.ajax({
            async: false,
            crossDomain: true,
            url: form.data().GlobalSetting.Integration.WsFonacot +
                "/ConsultarDatosCT?reg=" +
                regPatronal +
                "&rfc=" +
                ctRfc,
            method: "GET",
            headers: {
                "cache-control": "no-cache"
            }
        });
    };

    function getSectorByGiro(idGiroImss) {
        return $.ajax({
            async: false,
            crossDomain: true,
            url: form.data().GlobalSetting.Integration.WsFonacot + "/GetSector?idGiroImss=" + idGiroImss,
            method: "GET",
            headers: {
                "cache-control": "no-cache"
            }
        });
    };

    function getConsultaBuroPF(idcliente, idcentrotrabajo, preafiliacion, usuario, sucursal) {
        //const token = getToken();
        const oJson = {
            "idCliente": idcliente,
            "idCentroTrabajo": idcentrotrabajo,
            "existePreafiliacion": preafiliacion,
            "usuario": usuario,
            "sucursal": sucursal
        };

        return $.ajax({
            async: false,
            crossDomain: true,
            url: "https://servicios.fonacot.gob.mx/consultaBuroCreditoPF",
            type: "GET",
            dataType: "json",
            traditional: true,
            headers: {
                "Content-Type": "application/json",
                "cache-control": "no-cache"
                //"Authorization": token.responseJSON.token
            },
            data: JSON.stringify(oJson)
        });
    };

    function getConsultaBuroPM(rfc, nombre, primerapellido, segundoapellido, direccion, cp, colonia, ciudad, estado, sucursal, usuario, estatus, idcliente, clasif, firma) {
        //const token = getToken();
        const oJson = {
            "rfc": rfc,
            "nombre": nombre,
            "segundoNombre": "",
            "apellidoPaterno": primerapellido,
            "apellidoMaterno": segundoapellido,
            "direccion": direccion,
            "codigoPostal": cp,
            "colonia": colonia,
            "ciudad": ciudad,
            "nombreEstado": estado,
            "sucursal": sucursal,
            "usuario": usuario,
            "estatusCliente": estatus,
            "idCliente": idcliente,
            "clasifAdmon": clasif,
            "firmaAutografa": firma
        };

        return $.ajax({
            async: false,
            crossDomain: true,
            url: "https://servicios.fonacot.gob.mx/consultaBuroCreditoPM",
            type: "GET",
            dataType: "json",
            traditional: true,
            headers: {
                "Content-Type": "application/json",
                "cache-control": "no-cache"
                //"Authorization": token.responseJSON.token
            },
            data: JSON.stringify(oJson)
        });
    };
    //#endregion

    //#region SERVICES TRACKING
    function getDesistimiento(refId) {
        return $.ajax({
            cache: false,
            dataType: "json",
            type: "GET",
            data: {
                procedureInstanceRefId:
                    refId //$.jsonPreload.Activity.flowInstanceSummary.procedureInstanceSummary.refId
            },
            url: "/Tracking/ProcedureInstance/IsDesist"
        });
    };
    //#endregion

    // Métodos publicos
    self = $.extend(self,
        {
            GetToken: getToken,
            GetMetadata: getMetadata,
            Form: {
                GetFormInstance: getFormInstance,
                GetFormJson: getFormJson,
                UpdateInstance: updateInstance,
                DeleteInstance: deleteInstance,
                SendMailNotification: sendMailNotification,
                UpdateNotificationMail: updateNotificationMail,
                NotificationStatus: notificationStatus,
                GetSector: getSector,
                GetFormaPago: getFormaPago,
                GetFedatario: getFedatario,
                GetNotario: getNotario,
                GetDesistimiento: getDesistimiento,
                GetGiroByScian: getGiroByScian,
                GetZonaEconomica: getZonaEconomica
            },
            UndaniTemplate: {
                GenerateTemplates: generateTemplates
            },
            UndaniBox: {
                Synchronize: synchronize
            },
            CatalogsFonacot: {
                GetTipoPersona: getTipoPersona,
                GetTipoSeguridadSocial: getTipoSeguridadSocial,
                GetCasaMatriz: getCasaMatriz,
                GetSucursalesEstado: getSucursalesEstado,
                GetSucursalesMatriz: getSucursalesMatriz,
                GetDataCT: getDataCt,
                GetEntidades: getEntidades,
                GetMunicipios: getMunicipios,
                GetSectorByGiro: getSectorByGiro,
                GetConsultaBuroPF: getConsultaBuroPF,
                GetConsultaBuroPM: getConsultaBuroPM
            }
        });
    return self;
};

var Services = $.Services();