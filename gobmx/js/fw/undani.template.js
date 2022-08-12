(function (window, document, undefined) {
    (function ($) {
        "use strict";

        var UTemplate = function (enviromentId, instanceId, activityId, labelbutton) {
            var _id = this.attr("id");
            var _self = this;

            if (enviromentId === null || enviromentId === "" || enviromentId === undefined)
                enviromentId = GlobalSetting.Environment.EnvironmentId;

            var _enviromentId = enviromentId;
            var _instanciaId = instanceId;
            var _activityId = activityId;
            var _instanceVersion;

            var upload = GlobalSetting.UndaniTemplate.Ondemand;
            var uploadByType = GlobalSetting.UndaniTemplate.OndemandDocumentType;
            var download = GlobalSetting.UndaniBox.Download;

            var _labelbutton = "Generar documento";
            if (labelbutton !== undefined) _labelbutton = labelbutton;

            this.addClass("btn-group").attr("style", "margin: 0px;");
            this.append(`<button type="button" class="btn btn-default boton btn-icon-text" data-download="${_id
                }" style="display: none; margin-bottom: 0px;"></button>`);
            this.append(`<button type="button" class="btn btn-primary boton" data-attach="${_id
                }" style="margin-bottom: 0px;"><i class="fa fa-file-o"></i> ${_labelbutton}</button> `);

            // Para hacer compatible con el validate
            this.append(`<br /><input id="txt${_id}" name="${_id}" type="hidden" value="">`);
            this.closest(".form-group").find("label.control-label").attr("for", _id);

            // Atributos de la clase
            $(`#${_id}`).attr("data-original-name", "");
            $(`#${_id}`).attr("data-file-name", "");
            $(`#${_id}`).attr("data-file-hash", "");
            $(`#${_id}`).attr("data-file-toPDF", "");

            var SetFile = function (originalName, fileName, fileHash, toPDF) {
                $(`#${_id}`).attr("data-original-name", originalName);
                $(`#${_id}`).attr("data-file-name", fileName);
                $(`#${_id}`).attr("data-file-hash", fileHash);
                $(`#${_id}`).attr("data-file-toPDF", toPDF);
                var button = $(`[data-download=${_id}]`);

                if (fileName !== "") {
                    button.html('<i class="fa fa-download"></i> Ver el documento');
                    button.removeAttr("disabled");
                    $(`[data-attach=${_id}]`).hide();
                    button.show();
                } else {
                    button.html("");
                    button.hide();
                    $(`[data-attach=${_id}]`).show();
                }
            };

            this.setFile = SetFile;

            $(this).on("setFile", function (e, data) {
                SetFile(data.OriginalName, data.SystemName, data.Hash, data.ToPDF);
            });

            this.getFileInfo = function () {                
                return {
                    OriginalName: $(`#${_id}`).attr("data-original-name"),
                    SystemName: $(`#${_id}`).attr("data-file-name"),
                    Hash: $(`#${_id}`).attr("data-file-hash"),
                    ToPDF: $(`#${_id}`).attr("data-file-toPDF")
                };
            };

            var internalShowError = function (sMessage) {
                var htmlError = `<label for="txt${_id}" class="form-control-error error form-text form-text-error small" style="display: inline-block;">${
                    sMessage}</label>`;
                $(`#${_id}`).closest(".form-group").find("span.form-text").addClass("form-text-error");
                if ($(`label[for="txt${_id}"]`).length)
                    $(`label[for="txt${_id}"]`).html(sMessage);
                else
                    $(htmlError).insertAfter($(`#txt${_id}`));
            };

            this.showError = internalShowError;

            var hidenError = function () {
                $(`#${_id}`).closest(".form-group").find("span.form-text").removeClass("form-text-error");
                if ($(`label[for="txt${_id}"]`).length)
                    $(`label[for="txt${_id}"]`).remove();
            };

            this.readOnlyMode = function () {
                $(`[data-attach=${_id}]`).hide();
            };

            $(`[data-download=${_id}]`).click(function (e) {
                if ($(`#${_id}`).attr("data-file-name") !== "") {
                    var sUrlDownload = download + "?systemName=" + $(`#${_id}`).attr("data-file-name");
                    window.open(sUrlDownload);
                } else {
                    internalShowError("Adjunte un archivo");
                }
            });

            $(`[data-attach=${_id}]`).click(function (e) {
                hidenError();
                $(_self).trigger("createDocumentFormTemplate", [_self]);
            });

            this.createDocument = function (templateId, genericJson, toPDF) {
                hidenError();

                var parametros = {
                    EnviromentId: _enviromentId,
                    ActivityId: _activityId,
                    InstanceId: _instanciaId,
                    TemplateId: templateId,
                    GenericJson: genericJson
                };

                var token = Services.GetToken();

                $.ajax({                    
                    url: upload,
                    type: "POST",
                    data: JSON.stringify(parametros),
                    dataType: "json",
                    contentType: "application/json",
                    headers: {
                        "cache-control": "no-cache",
                        "Authorization": token.responseJSON.token
                    },
                    beforeSend: function () {
                        $(`[data-attach=${_id}]`).html(`<i class="fa fa-refresh fa-spin"></i> ${_labelbutton}`);
                        $(`[data-attach=${_id}]`).attr("disabled", "disabled");
                    },
                    timeout: 2 * 60 * 60 * 1000
                }).done(function (_resultado, textStatus, jqXHR) {
                    var archivo = _resultado[0];
                    if (!archivo.Error) {

                        if (!archivo.SystemName || !archivo.HashCode) {
                            internalShowError("Ocurrio un error al generar el archivo");
                            return;
                        }

                        $(`#${_id}`).attr("data-original-name", archivo.SystemName);
                        $(`#${_id}`).attr("data-file-name", archivo.SystemName);
                        $(`#${_id}`).attr("data-file-hash", archivo.HashCode);
                        $(`#${_id}`).attr("data-file-toPDF", toPDF);

                        $(`[data-download=${_id}]`).html('<i class="fa fa-download"></i> Ver el documento');
                        $(`[data-download=${_id}]`).removeAttr("disabled");
                        $(`[data-download=${_id}]`).show();

                        $(`[data-attach=${_id}]`).hide();

                        $(_self).trigger("createDocumentSuccess", [_self]);
                    }
                    else {
                        for (let i = 0; i < archivo.Errors.length; i++)
                            internalShowError(archivo.Errors[i].replace(".", " ").trim());
                        $(_self).trigger("createDocumentError", [_self]);
                    }
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    internalShowError(errorThrown);
                    $(_self).trigger("createDocumentError", [_self]);
                }).always(function (jqXHR, textStatus, errorThrown) {
                    $(`[data-attach=${_id}]`).html(`<i class="fa fa-file-o"></i> ${_labelbutton}`);
                    $(`[data-attach=${_id}]`).removeAttr("disabled");
                });
            };

            this.createDocumentByType = function (documentType, formId, instanceVersion, genericJson, toPDF) {
                hidenError();

                if (instanceVersion === null || instanceVersion === "" || instanceVersion === undefined)
                    _instanceVersion = 1;
                else
                    _instanceVersion = instanceVersion;

                var parametros = {
                    EnviromentId: _enviromentId,
                    ActivityId: _activityId,
                    InstanceId: _instanciaId,
                    InstanceVersion: _instanceVersion,
                    DocumentType: documentType,
                    FormId: formId,
                    GenericJson: genericJson
                };

                var token = Services.GetToken();

                $.ajax({                    
                    url: uploadByType,
                    type: "POST",
                    data: JSON.stringify(parametros),
                    dataType: "json",
                    contentType: "application/json",
                    headers: {
                        "cache-control": "no-cache",
                        "Authorization": token.responseJSON.token
                    },
                    beforeSend: function () {
                        $(`[data-attach=${_id}]`).html(`<i class="fa fa-refresh fa-spin"></i> ${_labelbutton}`);
                        $(`[data-attach=${_id}]`).attr("disabled", "disabled");
                    },
                    timeout: 2 * 60 * 60 * 1000
                }).done(function (_resultado, textStatus, jqXHR) {
                    var archivo = _resultado[0];
                    if (!archivo.Error) {

                        if (!archivo.SystemName || !archivo.HashCode) {
                            internalShowError("Ocurrio un error al generar el archivo");
                            return;
                        }

                        $(`#${_id}`).attr("data-original-name", archivo.OriginalName);
                        $(`#${_id}`).attr("data-file-name", archivo.SystemName);
                        $(`#${_id}`).attr("data-file-hash", archivo.HashCode);
                        $(`#${_id}`).attr("data-file-toPDF", toPDF);

                        $(`[data-download=${_id}]`).html('<i class="fa fa-download"></i> Ver el documento');
                        $(`[data-download=${_id}]`).removeAttr("disabled");
                        $(`[data-download=${_id}]`).show();

                        $(`[data-attach=${_id}]`).hide();

                        $(_self).trigger("createDocumentSuccess", [_self]);
                    }
                    else {
                        for (let i = 0; i < archivo.Errors.length; i++)
                            internalShowError(archivo.Errors[i].replace(".", " ").trim());
                        $(_self).trigger("createDocumentError", [_self]);
                    }
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    internalShowError(errorThrown);
                    $(_self).trigger("createDocumentError", [_self]);
                }).always(function (jqXHR, textStatus, errorThrown) {
                    $(`[data-attach=${_id}]`).html(`<i class="fa fa-file-o"></i> ${_labelbutton}`);
                    $(`[data-attach=${_id}]`).removeAttr("disabled");
                });
            };

            return this;
        };

        $.fn.uTemplate = UTemplate;

        var UPreview = function (instanceId, docType, labelbutton) {
            var _id = this.attr("id");
            var _self = this;

            var _instanciaId = instanceId || form.instanceid;
            var _docType = docType || "";
            var _labelbutton = labelbutton || "Generar documento";

            var _urlPreview = GlobalSetting.UndaniTemplate.Preview;

            this.addClass("btn-group").attr("style", "margin: 0px;");
            this.append(`<button data-generate="${_id
                }" type="button" class="btn btn-primary boton" style="margin-bottom: 0px;"><i class="fa fa-file-o"></i> ${_labelbutton
                }</button> `);

            // Para hacer compatible con el validate
            this.append(`<br /><input id="txt${_id}" name="${_id}" type="hidden" value="">`);
            this.closest(".form-group").find("label.control-label").attr("for", _id);

            $(`#${_id}`).attr("data-instanceId", _instanciaId);
            $(`#${_id}`).attr("data-docType", _docType);

            $(`[data-generate=${_id}]`).click(function (e) {                
                hidenError();
                var instance = $(`#${_id}`).attr("data-instanceId");
                var type = $(`#${_id}`).attr("data-docType");
                var jsonForm = $("#form").triggerHandler("getJsonForm");

                if (_id === "preview_PlantillaCartaPoder" &&
                    jsonForm.Integration.Solicitante.RepresentanteLegal.Nombre === "") {
                    internalShowError("Debe de llenar los datos del representante legal, para poder generar la carta.");
                    return;
                }


                if (instance !== "" && type !== "" && jsonForm !== null) {
                    Services.Form.UpdateInstance(instance, JSON.stringify(jsonForm), false).done(
                        function (saved) {
                            if (saved) {
                                var sUrlPreview = String.format(_urlPreview, instance, type);
                                window.open(sUrlPreview);
                            }
                            else internalShowError("Ocurrio un error");
                        }).fail(function (textStatus) {
                            internalShowError("Ocurrio un error");
                        }).always(function (jqXhr, textStatus, errorThrown) { });
                } else {
                    internalShowError("Ocurrio un error");
                }
            });

            var internalShowError = function (sMessage) {
                var htmlError = `<label for="txt${_id}" class="form-control-error error form-text form-text-error small" style="display: inline-block;">${
                    sMessage}</label>`;
                $(`#${_id}`).closest(".form-group").find("span.form-text").addClass("form-text-error");
                if ($(`label[for="txt${_id}"]`).length)
                    $(`label[for="txt${_id}"]`).html(sMessage);
                else
                    $(htmlError).insertAfter($(`#txt${_id}`));
            };

            this.showError = internalShowError;

            var hidenError = function () {
                $(`#${_id}`).closest(".form-group").find("span.form-text").removeClass("form-text-error");
                if ($(`label[for="txt${_id}"]`).length)
                    $(`label[for="txt${_id}"]`).remove();
            };

        };

        $.fn.uPreview = UPreview;

    })(jQuery);
}(window, document));