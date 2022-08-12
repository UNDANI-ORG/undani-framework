(function (window, document, undefined) {
    (function ($) {
        "use strict";

        var UInit = function (isSearch) {

            var _id = this.attr("id");

            var reset = function () {
                $(`#${_id}`).attr("data-entidad-id", "");
                $(`#${_id}`).attr("data-entidad-nombre", "");
                $(`.data-endidad-${_id}`).val("");

                $(`#${_id}`).attr("data-municipio-id", "");
                $(`#${_id}`).attr("data-municipio-nombre", "");
                $(`.data-municipio-${_id}`).val("");

                $(`#${_id}`).attr("data-localidades-id", "");
                $(`#${_id}`).attr("data-localidades-nombre", "");

                $(`#${_id}`).attr("data-colonia-id", "");
                $(`#${_id}`).attr("data-colonia-nombre", "");
                $(`.data-colonia-${_id}`).val("");

                $(`.data-localidades-${_id}`).empty();
                $(`.data-entidades-${_id}`).empty();
                $(`.data-municipios-${_id}`).empty();

                $(`.data-localidades-${_id}`).html('<option value=\"\">Selecciona una colonia</option>');
                $(`#cp-alert-${_id}`).html("");
            };

            $.ajaxSetup({
                timeout: 3000,      // 3 segundos de tiempo de espera
                retryAfter: 7000    //reintenta despues de 7 segundos
            });

            var search = function (cp) {
                var portlet = $.Portlet($("body"));

                if (cp === "") {
                    $(`#cp-alert-${_id}`).addClass("alert alert-warning");
                    $(`#cp-alert-${_id}`).html("<strong>Captura un código postal</strong>");
                    $(`.data-localidades-${_id}`).prop("disabled", true);
                    return;
                }

                portlet.show();
                $.ajax({
                    "async": false,
                    "crossDomain": true,
                    "url": GlobalSetting.SepomexApi.Rute + "?zip_code=" + cp,
                    "method": "GET",
                    "headers": {
                        "cache-control": "no-cache"
                    },
                    beforeSend: function () {
                        $(`#${_id}`).attr("disabled", "disabled");
                    }
                }).done(function (_resultado, textStatus, jqXHR) {
                    setValues(_resultado.zip_codes);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    if (jqXHR.status === 408) {//408 es el status de time out  para hacer el reintento hasta que se conecte
                        setTimeout(function () { search(cp) }, $.ajaxSetup().retryAfter);
                    } else {
                        $(`#${_id}`).attr("data.cp.error", true);
                        $(`#cp-alert-${_id}`).addClass("alert alert-warning");
                        $(`#cp-alert-${_id}`).html("<strong>Tenemos problemas de conexion</strong>");
                    }

                }).always(function (jqXHR, textStatus, errorThrown) {
                    $(`#${_id}`).removeAttr("disabled");
                    portlet.hide();
                });

            };

            var setValues = function (datalist) {
                if (datalist.length !== 0) {                    
                    var firstdata = datalist[0];                    

                    //Atributos en caso de ser un control de domicilio.
                    $(`#${_id}`).attr("data-entidad-id", firstdata.c_estado);
                    $(`#${_id}`).attr("data-entidad-nombre", firstdata.d_estado);                    
                    $(`#${_id}`).attr("data-municipio-id", firstdata.c_mnpio);
                    $(`#${_id}`).attr(`data-municipio-nombre${_id}`, firstdata.d_mnpio);

                    //Atributos en caso de tener varios controles de domicilio.
                    $(`.data-entidad-id-${_id}`).val(firstdata.c_estado);
                    $(`.data-endidad-${_id}`).val(firstdata.d_estado);
                    $(`.data-municipio-id-${_id}`).val(firstdata.c_mnpio);
                    $(`.data-municipio-${_id}`).val(firstdata.d_mnpio);


                    //Atributos en caso de tener select/ select2 / varios controles de domicilio.
                    $(`.data-entidades-${_id}`).append(`<option value="${firstdata.c_estado}">${firstdata.d_estado}</option>`);
                    $(`.data-municipios-${_id}`).append(`<option value="${firstdata.c_mnpio}">${firstdata.d_mnpio}</option>`);
                    
                    //TODO:add set colonia                
                    $.each(datalist, function (id, item) {                        
                        $(`.data-localidades-${_id}`).append(`<option value="${item.id_asenta_cpcons}">${item.d_asenta}</option>`);
                    });
                    $(`.data-localidades-${_id}`).prop("disabled", false);
                    $(`.data-localidades-${_id}`).trigger("loadedSettlement");

                } else {
                    $(`#${_id}`).attr("data.cp.error", true);
                    $(`#cp-alert-${_id}`).addClass("alert alert-danger");
                    $(`#cp-alert-${_id}`).html("<strong>Error!</strong> Código postal no existe");
                }
            };


            $(`.data-localidades-${_id}`).change(function () {                
                var idLocalidad = $(`.data-localidades-${_id} option:selected`).val();
                var nombreLocalidad = $(`.data-localidades-${_id} option:selected`).text();

                $(`#${_id}`).attr("data-localidades-id", idLocalidad);
                $(`#${_id}`).attr("data-localidades-nombre", nombreLocalidad);
            });

            $(`#${_id}`).blur(function () {
                $(`#cp-alert-${_id}`).removeClass();
                reset();
                var cpToSearch = $(`#${_id}`).val();
                search(cpToSearch);
            });

            if (isSearch) {
                var cpToSearch = $(`#${_id}`).val();
                $(`.data-localidades-${_id}`).empty();
                if (cpToSearch !== "") {
                    search(cpToSearch);
                }
            } else
                reset();

            return this;
        };

        $.fn.uInit = UInit;

    })(jQuery);
}(window, document));