
"use strict";
(function ($) {
    $.fn.uForm = function () {

        var form = $(this);
        var formData = form.data();
        var instanceid = formData.instanceId;
        var jsonPreload;
        var isPreload;
        var instanceReadOnly = false;

        form = $.extend(form, {
            instanceid: instanceid,

            send: function () {
                form.trigger("send_started");
            },

            initialize: function (parameters) {
                $(form).trigger("initialize", parameters);
            },

            get: function (parameters) {
                if (parameters.Preload === 0)
                    isPreload = false;
                else
                    isPreload = true;

                addGenericListeners();
                form.trigger("get_started");

                formData = globalSetting(formData, parameters.configurationForm);

                Services.Form.GetFormInstance(formData.instanceId).done(
                    function (object, textStatus, jqXhr) {
                        if (object !== null)
                            formData.objectJSON = object.Json;
                        else
                            formData.objectJSON = null;

                        formData.Support = {
                            FormId: object.FormId,
                            InstanceId: object.Id,
                            Version: object.Version,
                            SubVersion: object.SubVersion,
                            EnvironmentId: object.EnvironmentId,
                            ParentInstanceId: object.ParentInstanceId,
                            InstanceProcess: object.InstanceProcess
                        };

                        instanceReadOnly = object.ReadOnly;
                        form.trigger("get_completed", [JSON.parse(formData.objectJSON), instanceReadOnly, isPreload, textStatus, jqXhr]);
                    }).fail(function (jqXhr, textStatus, errorThrown) {
                        form.trigger("form_alert",
                            [{
                                responseText: "No fue posible cargar los datos del trámite.",
                                status: textStatus,
                                responseClass: "alert alert-danger"
                            }]);
                    }).always(function (jqXhr, textStatus, errorThrown) {
                        form.trigger("get_finished", [jqXhr, textStatus, errorThrown]);
                    });
            },

            save: function () {
                form.trigger("save_started");
            },

            saveFinalize: function (object) {
                var oJson = {
                    Support: formData.Support,
                    Integration: object,
                    Preload: jsonPreload
                };
                var json = JSON.stringify(oJson);
                formData.objectJSON = object;

                Services.Form.UpdateInstance(formData.instanceId, json, false).done(
                    function (saved, textStatus, jqXhr) {
                        formData.objectJSON = object;
                        if (saved)
                            form.trigger("save_completed", [saved, textStatus, jqXhr]);
                        else
                            form.trigger("form_alert",
                                [
                                    {
                                        responseText: "No fue posible guardar los datos del trámite.",
                                        status: textStatus,
                                        responseClass: "alert alert-danger"
                                    }
                                ]);
                    }).fail(function (textStatus) {
                        form.trigger("form_alert",
                            [
                                {
                                    responseText: "No fue posible guardar los datos del trámite.",
                                    status: textStatus,
                                    responseClass: "alert alert-danger"
                                }
                            ]);
                    }).always(function (jqXhr, textStatus, errorThrown) {
                        form.trigger("save_finished", [jqXhr, textStatus, errorThrown]);
                    });
            },

            sendFinalize: function (object) {
                if (object === undefined || object === null || object === {}) {
                    form.trigger("form_alert",
                        [{
                            responseText: "No se pudo enviar el formulario, guarde y vuelva a intentar.",
                            status: textStatus,
                            responseClass: "alert alert-danger"
                        }]);
                }

                //Actualizamos JSON y marcamos Firmado                
                formData.objectJSON = object;

                var oJson = {
                    Support: formData.Support,
                    Integration: object,
                    Preload: jsonPreload

                };
                var json = JSON.stringify(oJson);

                Services.Form.UpdateInstance(formData.instanceId, json, false).done(
                    function (sent, textStatus, jqXhr) {
                        if (formData.Support.ParentInstanceId !== "00000000-0000-0000-0000-000000000000" || sent) {
                            console.log("Se actualiza correctamente el form para firma");
                            form.trigger("send_completed", [sent, textStatus, jqXhr]);
                            form.trigger("save_completed", [sent, textStatus, jqXhr]);
                        }
                        else
                            form.trigger("form_alert", [
                                {
                                    responseText: "No se pudo enviar el formulario, guarde y vuelva a intentar.",
                                    status: textStatus,
                                    responseClass: "alert alert-danger"
                                }
                            ]);
                    }).fail(function (textStatus) {
                        form.trigger("form_alert",
                            [
                                {
                                    responseText: "No se pudo enviar el formulario, guarde y vuelva a intentar.",
                                    status: textStatus,
                                    responseClass: "alert alert-danger"
                                }
                            ]);
                }).always(function (jqXhr, textStatus, errorThrown) {
                        form.trigger("send_finished", [jqXhr, textStatus, errorThrown]);
                });
            },

            delete: function () {
                form.trigger("delete_started");
                Services.Form.DeleteInstance(formData.instanceId).done(function (removed, textStatus, jqXhr) {
                    if (removed)
                        form.trigger("delete_completed", [removed, textStatus, jqXhr]);
                    else
                        form.trigger("form_alert",
                            [
                                {
                                    responseText: "No fue posible eliminar el trámite.",
                                    status: textStatus,
                                    responseClass: "alert alert-danger"
                                }
                            ]);
                }).fail(function (textStatus) {
                    form.trigger("form_alert",
                        [{
                            responseText: "No fue posible eliminar el trámite.",
                            status: textStatus,
                            responseClass: "alert alert-danger"
                        }]);
                }).always(function (jqXhr, textStatus, errorThrown) {
                    form.trigger("delete_finished", [jqXhr, textStatus, errorThrown]);
                });
            },

            //Sync de Documentos para Box
            syncDocuments: function (documents) {
                Services.UndaniBox.Synchronize(formData.instanceId, documents).done(function (saved, textStatus) {
                    if (!saved.Error)
                        console.log("Sincronización de documentos correctamente");
                    else
                        form.trigger("form_alert",
                            [{
                                responseText: "Error al sincronizar documentos del trámite.",
                                status: textStatus,
                                responseClass: "alert alert-danger"
                            }]);
                }).fail(function (textStatus) {
                    form.trigger("form_alert",
                        [{
                            responseText: "Error al sincronizar documentos del trámite.",
                            status: textStatus,
                            responseClass: "alert alert-danger"
                        }]);
                }).always(function () { });
            },

            getJSON: function () {
                return formData.objectJSON;
            },

            validate: function () {
                form.trigger("validate");
            },

            getPreloadData: function (activityId) {
            }
        });

        var sincronizarDocumentos = function (result) {
            if (result) {
                var listDocumentsJson = [];
                var formJson = form.getJSON();
                Utils.getObjectByParameter(formJson, "hash", listDocumentsJson);

                if (listDocumentsJson.length > 0) {
                    var documents = Utils.getListNamesDocuments(listDocumentsJson);
                    if (documents.error) {
                        form.trigger("form_alert",
                            [
                                {
                                    responseText: "Error al sincronizar documentos del trámite.",
                                    status: textStatus,
                                    responseClass: "alert alert-danger"
                                }
                            ]);
                    } else form.syncDocuments(documents.listNamesDocuments);

                }
            }
        };

        var addGenericListeners = function () {
            //Mensaje de Guardado con éxito
            $(form).on("save_completed", function () {
                $("#divGeneral").hide();
                $("#divAlert").hide();
                $("#divErrorPreload").hide();
                $("#divSaved").fadeIn("slow", function () {
                    window.setTimeout(function () { $("#divSaved").hide("slow"); }, 8000);
                });
                $("html, body").animate({ scrollTop: 0 }, "slow");
            });

            //Error de datos de precarga
            $(form).on("form_error_preload", function () {
                $("#divGeneral").hide();
                $("#divAlert").hide();
                $("#divSaved").hide();
                $("#divErrorPreload").fadeIn("slow", function () { });
                $("html, body").animate({ scrollTop: 0 }, "slow");

                //Se inabilita el formulario
                $(form.public).trigger("showSections", [false]);
                $("#cbxtxt_Instrucciones").prop("disabled", true);
                $("#cmdGuardar").hide();
                $("#cmdEliminar").hide();
                $("#cmdEnviar").hide();
            });

            //Mensajes de alerta configurable
            $(form).on("form_alert", function (e, result) {
                $("#divGeneral").hide();
                $("#divSaved").hide();
                $("#divErrorPreload").hide();
                var ms = result.length > 0 ? result[0] : result;
                var messageHtml = `<strong>¡Alerta de sistema! </strong> ${(ms.responseText !== "") ? (ms.responseText) : (ms.status + " - " + ms.statusText)
                    }<br /> Para cualquier aclaración contactar al correo <span><a href=mailto:afiliacionct@fonacot.gob.mx>afiliacionct@fonacot.gob.mx</a></span> o al teléfono (+52.55) 0000.0109.`;
                $("#divAlert").addClass(ms.responseClass);
                $("#divAlert").html(messageHtml);
                $("#divAlert").fadeIn("slow", function () {
                    window.setTimeout(function () { $("#divAlert").hide("slow"); }, 8000);
                });
                $("html, body").animate({ scrollTop: 0 }, "slow");
            });

            //TODO: Mejorar este cófigo
            //Sincronizar Documentos
            $(form).on("save_completed", function (e, result) {
                sincronizarDocumentos(result);
            });

            $(form).on("send_completed", function (e, result) {
                sincronizarDocumentos(result);
            });
        };

        return form;
    };
})(jQuery);


var globalSetting = function (formData, configurationForm) {
    formData.GlobalSetting = {
        UndaniBox: {
            Upload: configurationForm.ApiBox + "/Execution/Box/Upload",
            Download: configurationForm.ApiBox + "/Execution/Box/Download",
            Synchronize: configurationForm.ApiBox + "/Execution/Box/AssertCore",
            SharePointDownload: configurationForm.ApiBox + "/Execution/Box/SharePointDownload"
        },
        UndaniTemplate: {
            Ondemand: configurationForm.ApiTemplate + "/Excecution/Template/OnDemand",
            TemplateMixed: configurationForm.ApiTemplate + "/Excecution/Template/TemplateMixed",
            OndemandDocumentType: configurationForm.ApiTemplate + "/Excecution/Template/OnDemandDocumentType",
            Preview: configurationForm.WebVerify + "/PreViewer?InstanceId={0}&docType={1}",
            MailNotification: configurationForm.ApiTemplate + "/Execution/Template/FormRequest"
        },
        UndaniTracking: {
            Rute: configurationForm.ApiTracking
        },
        Environment: {
            EnvironmentId: "74E7E4D5-6439-4B59-BB19-B84458375D88"
        },
        Content: {
            Resources: configurationForm.WebForm
        },
        FormApi: {
            Rute: configurationForm.ApiForm
        },
        Integration: {
            Rute: configurationForm.ApiIntegration,
            Catalogos: configurationForm.ApiIntegration + "/Tools",
            WsFonacot: configurationForm.ApiIntegration + "/Integration"
        },
        GoogleApi: {
            Rute: configurationForm.ApiGoogleMaps + "/maps/api/js?key=AIzaSyDaDLmzkeSXkntekM_90EDqg1ysz_wZlYU&region=MX",
            RuteStatic: configurationForm.ApiGoogleMaps + "/maps/api/staticmap?key=AIzaSyC3CAxexf3pnlbJSUgSLiMfE-sBCwv_KFs"
        },
        SepomexApi: {
            Rute: configurationForm.ApiSepomex + "/sepomex/v1v/colonia",
            Key: configurationForm.KeySepomex
        },
        UrlForm: {
            Rute: configurationForm.WebForm
        }
    };

    return formData;
};