(function (window, document, undefined) {
    (function ($) {
        "use strict";

        var UBox2 = function (formId, enviroment, metaData, help, accept, extensions) {
            var portlet = $.Portlet($("body"));
            var _id = this.attr("id");
            var _instanceId = formId;
            var _enviroment = enviroment;
            var _metaData = metaData;
            var _accept = accept;
            var _extensions = typeof extensions !== "undefined" ? extensions : "";
            var _help = (typeof help !== "undefined") ?
                `<i class="glyphicon glyphicon-question-sign popoverCustom" data-container="body" data-placement="auto" data-toggle="popover" data-trigger="hover" data-content="${
                help}" title="" style="padding-top: 7px;"></i>` : "";

            var upload = GlobalSetting.UndaniBox.Upload;
            var download = GlobalSetting.UndaniBox.Download;

            this.append(`<input class="form-control" type="text" placeholder="Seleccionar archivo" data-text=${_id
                } disabled/><button type="button" class="btn btn-default boton btn-icon-text" data-download="${_id
                }" style="display: none; margin-bottom: 0px;">Adjuntar</button>`);
            this.append(`<button type="button" class="btn btn-primary boton" data-attach="${_id
                }" style="margin-bottom: 0px;"><i class="fa fa-paperclip"></i></button>`);
            this.append(_help);

            // Para hacer compatible con el validate
            this.append(`<br /><input id="txt${_id}" name="${_id}" type="hidden" value="">`);
            this.closest(".form-group").find("label.control-label").attr("for", _id);

            // Atributos de la clase
            $(`#${_id}`).attr("data-original-name", "");
            $(`#${_id}`).attr("data-file-name", "");
            $(`#${_id}`).attr("data-file-hash", "");
            $(`#${_id}`).attr("data-file-toPDF", false);

            var SetFile = function (originalName, fileName, fileHash) {
                $(`#${_id}`).attr("data-original-name", originalName);
                $(`#${_id}`).attr("data-file-name", fileName);
                $(`#${_id}`).attr("data-file-hash", fileHash);

                var button = $(`[data-download=${_id}]`);

                if (fileName !== "") {
                    $(`[data-text=${_id}]`).val(originalName);
                    button.html('<i class="fa fa-download"></i> Ver el documento');
                    button.removeAttr("disabled");
                    button.show();
                } else {
                    button.html("");
                    button.hide();
                }
            };

            var SetSignature = function (on) {
                $(`#${_id}`).attr("data-file-toPDF", on);
            };

            this.getFileInfo = function () {
                return {
                    OriginalName: $(`#${_id}`).attr("data-original-name"),
                    SystemName: $(`#${_id}`).attr("data-file-name"),
                    Hash: $(`#${_id}`).attr("data-file-hash"),
                    ToPDF: $(`#${_id}`).attr("data-file-toPDF")
                };
            };

            this.setFile = SetFile;

            this.onSignature = SetSignature;

            $(this).on("setFile", function (e, data) {
                SetFile(data.OriginalName, data.SystemName, data.Hash);
            });

            $(this).on("setSignature", function (e, data) {
                SetSignature(data);
            });

            var showError = function (sMessage) {
                portlet.hide();
                var htmlError = `<label for="txt${_id}" class="form-control-error error form-text form-text-error small" style="display: inline-block;">${
                    sMessage}</label>`;
                $(`#${_id}`).closest(".form-group").find("span.form-text").addClass("form-text-error");
                if ($(`label[for="txt${_id}"]`).length) {
                    $(`label[for="txt${_id}"]`).html(sMessage);
                    $(`label[for="txt${_id}"]`).show();
                }
                else
                    $(htmlError).insertAfter($(`#txt${_id}`));
            };

            var hidenError = function () {
                $(`#${_id}`).closest(".form-group").find("span.form-text").removeClass("form-text-error");
                if ($(`label[for="txt${_id}"]`).length)
                    $(`label[for="txt${_id}"]`).remove();
            };

            var checkExtensions = function (fileName) {
                if (_extensions === undefined) return true;

                var aExtensions = _extensions.split(",");
                var aFileName = fileName.split(".");
                var fileExtension = `.${aFileName[aFileName.length - 1]}`;

                var index = $.inArray(fileExtension, aExtensions);

                return index !== -1;
            };

            this.readOnlyMode = function () {
                $(`[data-attach=${_id}]`).hide();
            };

            $(`[data-download=${_id}]`).click(function (e) {
                if ($(`#${_id}`).attr("data-file-name") !== "") {
                    var sRutaDocumento = download + "?systemName=" + $(`#${_id}`).attr("data-file-name");
                    window.open(sRutaDocumento);
                } else {
                    showError("Adjunte un archivo");
                }
            });

            var forma = `<div id="dlg_${_id}" role="document" style="display: none;"><form id="frm_${_id}" action="${upload
                }" enctype="multipart/form-data" method="post"><input name="file" type="file" accept="${typeof _accept !== "undefined" ? _accept : ""}"/></form></div>`;

            $("body").append(forma);

            $(`#frm_${_id}`).submit(function (e) {                
                portlet.show();
                hidenError();
                $(`#txt${_id}`).val("");

                var _FileName = $(`#frm_${_id} input[type=file]`).val();

                var rightExtension = checkExtensions(_FileName);

                if (!rightExtension) {
                    showError("El tipo de archivo seleccionado no esta permitido");
                    return false;
                }

                // Llama a la función para la carga
                var formData = new FormData(this);
                var formURL = $(this).attr("action");

                formData.append("instanceId", _instanceId);
                formData.append("extensiones", _extensions);
                formData.append("enviroment", _enviroment);
                formData.append("metaData", _metaData);

                _FileName = _FileName.substring(_FileName.lastIndexOf("\\") + 1);

                var token = Services.GetToken();

                $.ajax({                    
                    url: formURL,
                    type: "POST",
                    data: formData,
                    dataType: "json",
                    mimeType: "multipart/form-data",
                    contentType: false,
                    cache: false,
                    processData: false,
                    timeout: 2 * 60 * 60 * 1000,
                    headers: {
                        "cache-control": "no-cache",
                        "Authorization": token.responseJSON.token
                    },
                    beforeSend: function () {
                        $(`[data-attach=${_id}]`).html('<i class="fa fa-refresh fa-spin"></i>');
                        $(`[data-attach=${_id}]`).attr("disabled", "disabled");
                    }
                }).done(function (_result, textStatus, jqXHR) {
                    if (_result.Error === true) {
                        for (var i = 0; i < _result.Errors.length; i++) {
                            showError(_result.Errors[i].replace(".", " ").trim());
                        }
                        return;
                    }

                    if (!_result.SystemName || !_result.HashCode) {
                        showError("Ocurrio un error al cargar el archivo");
                        return;
                    }

                    $(`#${_id}`).attr("data-original-name", _FileName);
                    $(`#${_id}`).attr("data-file-name", _result.SystemName);
                    $(`#${_id}`).attr("data-file-hash", _result.HashCode);

                    $(`[data-text=${_id}]`).val(_FileName);
                    $(`[data-download=${_id}]`).html('<i class="fa fa-download"></i>   Ver el documento');
                    $(`[data-download=${_id}]`).removeAttr("disabled");
                    $(`[data-download=${_id}]`).show();
                    if (_result.Valor !== "") {
                        hidenError();
                    }

                }).fail(function (jqXHR, textStatus, errorThrown) {
                    showError(errorThrown);
                }).always(function (jqXHR, textStatus, errorThrown) {
                    $(`[data-attach=${_id}]`).html('<i class="fa fa-paperclip"></i>');
                    $(`[data-attach=${_id}]`).removeAttr("disabled");
                    portlet.hide();
                });

                // Cancela el submit
                e.preventDefault();
                return false;
            });

            $(`#frm_${_id} input[type=file]`).change(function (e) {
                $(`#frm_${_id}`).submit();
            });

            $(`#frm_${_id} input[type=file]`)[0].onclick = function () { this.value = null; };

            // al hacer clic para abrir la modal que ya no existira
            $(`[data-attach=${_id}]`).click(function (e) {
                $(`#frm_${_id}`).attr("data-id", _id);
                $(`#frm_${_id} input[type=file]`).click();
            });

            return this;
        };

        $.fn.uBox2 = UBox2;

    })(jQuery);
}(window, document));