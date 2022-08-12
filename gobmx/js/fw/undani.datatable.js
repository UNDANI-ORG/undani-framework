(function ($) {

    // Textos es español
    var language =
    {
        processing: "Procesando...",
        search: "<span>Buscar:</span> _INPUT_",
        lengthMenu: "<span>Mostrar:</span> _MENU_",
        info: "Mostrando del <b>_START_ al _END_</b> de _TOTAL_ elementos",
        infoEmpty: "Mostrando del 0 al 0 de un total de 0",
        infoFiltered: "(filtrado de un total de _MAX_ registros)",
        infoPostFix: "",
        loadingRecords: "Cargando...",
        zeroRecords: "No se encontraron resultados",
        emptyTable: "No se encontraron resultados",
        paginate: {
            first: "Primero",
            previous: "«",
            next: "»",
            last: "Último"
        },
        aria: {
            sortAscending: ": Activar para ordenar la columna de manera ascendente",
            sortDescending: ": Activar para ordenar la columna de manera descendente"
        }
    };

    // Crear DataTable
    $.fn.uDataTable = function (settings) {

        var id = $(this).attr("id");

        var oLanguage = JSON.parse(JSON.stringify(language));

        oLanguage = $.extend(oLanguage, settings.Lenguaje);

        var oSettingsDefault = {
            searching: false,
            ordering: false,
            lengthChange: false,
            jQueryUI: false,
            autoWidth: true,
            info: false,
            paging: false,
            pagingType: "full_numbers",
            dom: '<"datatable-header"fl><"datatable-scroll"t><"datatable-footer"ip>',
            destroy: true,
            processing: false,
            scrollCollapse: true,
            language: oLanguage,
            serverSide: false,
            drawCallback: function (s) {
                $(`input[name=${id}]`).val(s.aoData.length);
                if ($(`label[for=txt${id}]`).length > 0) {
                    var minRow = $(`input[name=${id}]`).rules().minRows;
                    if (s.aoData.length >= minRow) {
                        $(`label[for=txt${id}]`).hide();
                    }
                }
            }
        };

        oSettingsDefault = $.extend(oSettingsDefault, settings);

        if (typeof settings.paging !== "undefined" && settings.paging)
            oSettingsDefault.info = settings.paging;

        var dt = this.dataTable(oSettingsDefault);

        // Agrega al final una caja de texto oculta para la validación
        $(document.getElementById(id).parentElement).append(`<input id="txt${id}" name="${id}" type="hidden" />`);

        return dt;
    };

    $.fn.extend({
        uDrawDataTable: function (settings) {            
            var id = $(this).attr("id");
            var defaultSettings = {
                tabla: {
                    titulo: $(this).attr("title"),
                    clases: "table table-stripped table-bordered table-hover table-condensed display dth"
                },
                modalLink: {
                    visible: true,
                    texto: "Agrega un registro",
                    leftAlignment: true,
                    iconoHtml: '<i class="glyphicon glyphicon-plus"></i>',
                    id: `lnkCaptura${id}`,
                    visiblePopup: true,
                    popupId: `popupId${id}`
                }
            };

            if (settings === undefined) settings = {};

            var drawCaptionSettings = $.extend(true, {}, defaultSettings, settings);

            var htmlCaption = `<caption class="tituloTabla">${drawCaptionSettings.modalLink.leftAlignment ?
                // Link alineado a la derecha
                (`<span class="textoizquierda">${drawCaptionSettings.modalLink.visible ?
                    '<a id="_modalLink.id_" href="#">_modalLink.iconoHtml_</a> ' : ""}_tabla.titulo_${drawCaptionSettings.modalLink.visible ?
                        '<i id="_modalLink.popupId_" class="fa fa-exclamation-circle popoverCustom" data-container="body" data-placement="auto" data-toggle="tooltip" data-trigger="hover" data-content="De clic en + para agregar registros" title=""></i>'
                        : drawCaptionSettings.modalLink.visiblePopup ? '<i id="_modalLink.popupId_" class="fa fa-exclamation-circle popoverCustom" data-container="body" data-placement="auto" data-toggle="tooltip" data-trigger="hover" data-content="Dar clic en el icono editar para agregar o modificar un archivo." title=""></i>' : ""
                    }</span>`) :
                // Tiene titulo
                '<span class="textoizquierda">_tabla.titulo_</span>'}${!drawCaptionSettings.modalLink.leftAlignment && drawCaptionSettings.modalLink.visible ?
                    ('<span class="textoderecha">_modalLink.texto_ '
                        + '<a id="_modalLink.id_" href="#">_modalLink.iconoHtml_</a>'
                        + "</span>") : ""}</caption>`;

            htmlCaption = htmlCaption.replace("_tabla.titulo_", drawCaptionSettings.tabla.titulo)
                .replace("_modalLink.id_", drawCaptionSettings.modalLink.id)
                .replace("_modalLink.popupId_", drawCaptionSettings.modalLink.popupId)
                .replace("_modalLink.texto_", drawCaptionSettings.modalLink.texto)
                .replace("_modalLink.iconoHtml_", drawCaptionSettings.modalLink.iconoHtml);

            // draw caption
            $(this).addClass(drawCaptionSettings.tabla.clases);
            $(`#${id} thead`).before(htmlCaption);

        }
    });

})(jQuery);
