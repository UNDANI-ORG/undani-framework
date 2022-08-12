// Clases base
$.Base = function() {
    var _self = {
        initialize: function() {},
        preload: function() {},
        load: function() {},
        get: function() {},
        validate: function() {},
        readOnly: function() {}
    };
    return _self;
};

$.SectionBase = function(id) {
    var _self = {};
    var _id = id;

    _self = $.extend(true,
        {},
        $.Base(),
        {
            form: $(`#${_id}`),
            openTab: function() {
                var currentPanelHeader = this.form.closest("div.panel-default").find("div.panel-heading");
                var currentPanelBody = this.form.closest("div.panel-default").find(".panel-collapse");

                if (!currentPanelBody.hasClass("in"))
                    currentPanelHeader.click();
            },
            id: _id
        });

    return _self;
};

$.TableBase = function(id) {
    var _self = {};
    var _id = id;
    var _dtTable = $(`#${id}`).DataTable();

    _self = $.extend(true,
        {},
        $.Base(),
        {
            load: function(aoTabla) {
                _dtTable.rows.add(aoTabla).draw();
                $(this).trigger("loaded", [aoTabla]);
            },
            get: function() {
                return _dtTable.data().toArray();
            },
            clear: function() {
                _dtTable.clear().draw();
            },
            showModal: function() {},
            dtTable: _dtTable,
            id: _id
        });

    return _self;
};

$.ModalBase = function() {
    var _self = $.Base();

    _self = $.extend(true,
        {},
        _self,
        {
            show: function() {}
        });

    return _self;
};

// Manejadores
$.SectionHandler = function(parameters, form, settings) {
    var _settings = $.extend(true,
        {
            acordeon: true,
            subscribeEvents: true,
            subscribe: {
                get_completed: true,
                preload_started: true,
                save_started: true,
                send_started: true,
                validate: true
            }
        },
        settings || {});

    var _acordeon;
    var _sections = [];
    var _originalJson = {};

    var _self = {
        addSections: function(descSection) {
            for (let s = 0; s < descSection.length; s++) {
                var section = descSection[s].section;
                section.panelId = `pan${descSection[s].jsonParameterName}`;
                section.jsonParameterName = descSection[s].jsonParameterName;

                _sections.push(section);
            }
        },
        addSection: function(descSection) {
            var section = descSection.section;
            section.panelId = descSection.panelId;
            section.jsonParameterName = descSection.jsonParameterName;

            _sections.push(section);
        },
        initialize: function() {
            $.each(_sections,
                function(index, section) {
                    section.initialize();
                });
        },
        load: function(jsonIntegration) {
            $.each(_sections,
                function(index, section) {
                    var jsonSection = jsonIntegration[section.jsonParameterName];
                    if (jsonSection)
                        section.load(jsonIntegration[section.jsonParameterName]);
                });
        },
        preload: function(jsonPreload) {
            $.each(_sections,
                function(index, section) {
                    section.preload(jsonPreload);
                });
        },
        readOnly: function() {
            $.each(_sections,
                function(index, section) {
                    section.readOnly();
                    $(".panel-collapse").removeClass("in");
                });
        },
        getValidationPanel: function() {
            var result = [];
            $.each(_sections,
                function(index, section) {
                    result.push({
                        panelId: section.panelId,
                        funcValidation: function() { return section.validate(); }
                    });
                });
            return result;
        },
        getJsonForm: function() {
            var jsonResult = {};
            $.each(_sections,
                function(index, section) {
                    jsonResult[section.jsonParameterName] = section.get();
                });
            return jsonResult;
        },
        validate: function() { return _acordeon.validate(); }
    };

    // esto despues de haber cargado las secciones
    if (_settings.acordeon) {
        $(form).on("get_completed",
            function(event, json, readOnly, textStatus, jqXhr) {
                _acordeon = $("#accordion").tAccordion({
                    validationPanels: _self.getValidationPanel()
                });
                $(_acordeon).on("validated",
                    function(e, result) {
                        if (result)
                            $("#divGeneral").fadeOut("slow");
                        else {
                            $("#divGeneral").fadeIn("slow",
                                function() {
                                    window.setTimeout(function() { $("#divGeneral").hide("slow"); }, 8000);
                                });
                            $("html, body").animate({ scrollTop: 0 }, "slow");
                        }

                    });
            });
    }

    if (_settings.subscribeEvents) {
        if (_settings.subscribe.get_completed) {
            //Obtener
            $(form).on("get_completed",
                function(event, json, readOnly, isPreload, textStatus, jqXhr) {
                    _self.initialize();

                    // Carga                           
                    if (!$.isEmptyObject(json)) {
                        _originalJson = json;
                        _self.load(json.Integration, null);
                    }
                    // Precarga
                    else if (parameters !== undefined && !isPreload || !readOnly) {
                        if (parameters.ObjectJson.Configuration.ProcedureId !== "00000000-0000-0000-0000-000000000000")
                            form.getPreloadData();
                    }

                    // Modo lectura 
                    if (readOnly) {
                        _self.readOnly();
                    }

                    $(_self).trigger("get_completed", [json]);
                });
        }
        if (_settings.subscribe.preload_started) {
            $(form).on("preload_started",
                function(e, jsonPreload, textStatus, jqXhr) {
                    _self.preload(jsonPreload);
                });
        }
        if (_settings.subscribe.save_started) {
            //Guardar
            $(form).on("save_started",
                function() {
                    var object = _self.getJsonForm();
                    form.saveFinalize(object);
                });
        }
        if (_settings.subscribe.send_started) {
            //Enviar Firma
            $(form).on("send_started",
                function() {
                    if (_acordeon.validate()) {
                        var object = _self.getJsonForm();
                        form.sendFinalize(object);
                    } else {
                        $("html, body").animate({ scrollTop: 0 }, "slow");
                        $(form).trigger("validate_result", _acordeon.validate());
                    }
                });
        }
        if (_settings.subscribe.validate) {
            //Validate
            $(form).on("validate",
                function(e) {
                    $(form).trigger("validate_result", _acordeon.validate());
                });
        }
    }

    // Propiedades
    Object.defineProperty(_self,
        "originalJson",
        {
            get: function() { return _originalJson; },
            enumerable: false
        });

    return _self;
};

$.AttachedFilesHandler = function(sIdFrm) {
    var _self = $.Base();
    var formData = form.data();

    var IdsAttachedFiles = [];
    var attachedFiles = [];

    var _CustomSettings = undefined;

    _self = $.extend(true,
        {},
        _self,
        {
            setCustomSettings: function(oSettings) { _CustomSettings = oSettings },
            // globales
            initialize: function() {
                IdsAttachedFiles = getIds(sIdFrm, "file");

                if (_CustomSettings === undefined)
                    $.each(IdsAttachedFiles,
                        function(i, v) {
                            attachedFiles[v] = $(`#${v}`).uBox(formData.Support.InstanceId,
                                formData.Support.EnvironmentId,
                                true);
                        });
                else
                    $.each(IdsAttachedFiles,
                        function(i, v) {
                            attachedFiles[v] = $(`#${v}`).uBox2(formData.Support.InstanceId,
                                formData.Support.EnvironmentId,
                                true,
                                _CustomSettings[v].help,
                                _CustomSettings[v].accept,
                                _CustomSettings[v].extensions);
                        });
            },
            readOnly: function() {
                $.each(IdsAttachedFiles,
                    function(i, v) {
                        attachedFiles[v].readOnlyMode();
                    });
            },
            resetAll: function() {
                $.each(IdsAttachedFiles,
                    function(i, v) {
                        attachedFiles[v].setFile("", "", "");
                    });
            }
        });

    // Métodos privados
    var getIds = function(frmId, prefix) {
        var ids = [];

        $.each($(`#${frmId} div .dth`),
            function(i, elemento) {
                var aids = elemento.id.split("_");
                if (aids.length > 0)
                    if (aids[0] === prefix)
                        ids.push(elemento.id);
            });

        return ids;
    };

    return _self;
};

$.TemplateHandler = function(sIdFrm) {
    var _self = $.Base();
    var formData = form.data();

    var IdsTemplateFiles = [];
    var templateFiles = [];

    _self = $.extend(true,
        {},
        _self,
        {
            // globales
            initialize: function() {
                IdsTemplateFiles = getIds(sIdFrm, "template");

                $.each(IdsTemplateFiles,
                    function(i, v) {
                        templateFiles[v] =
                            $(`#${v}`).uTemplate(formData.Support.EnvironmentId, formData.Support.InstanceId, "");
                    });
            },
            readOnly: function() {
                $.each(IdsTemplateFiles,
                    function(i, v) {
                        templateFiles[v].readOnlyMode();
                    });
            },
            resetAll: function() {
                $.each(IdsTemplateFiles,
                    function(i, v) {
                        templateFiles[v].setFile("", "", "");
                    });
            }
        });

    // Métodos privados
    var getIds = function(frmId, prefix) {
        var ids = [];

        $.each($(`#${frmId} div .dth`),
            function(i, elemento) {
                var aids = elemento.id.split("_");
                if (aids.length > 0)
                    if (aids[0] === prefix)
                        ids.push(elemento.id);
            });

        return ids;
    };

    return _self;
};

$.TablesHandler = function() {
    var _self = $.Base();
    var IdsTables = [];
    var tables = [];

    _self = $.extend(true,
        {},
        _self,
        {
            setTables: function(aTables) {
                for (let t = 0; t < aTables.length; t++) {
                    IdsTables.push(aTables[t].id);
                    tables[aTables[t].id] = aTables[t];
                }
            },
            // globales
            initialize: function() {
                $.each(IdsTables,
                    function(i, v) {
                        tables[v].initialize();
                    });
            },
            readOnly: function() {
                $.each(IdsTables,
                    function(i, v) {
                        tables[v].readOnly();
                    });
            },
            resetAll: function() {
                $.each(IdsTables,
                    function(i, v) {
                        tables[v].clear();
                    });
            }
        });
    return _self;
};

// Clases finales
$.Section = function(sIdFrm, oRules) {
    var _self = {};
    var _readOnly = false;
    var _idFrm = sIdFrm;
    var _rules = oRules || {};

    var _files = $.AttachedFilesHandler(_idFrm);
    var _templates = $.TemplateHandler(_idFrm);
    var _tables = $.TablesHandler();
    var _originalItem = null;

    var _sectionFrm = $(`#${_idFrm}`).uValidate({ rules: _rules });

    _self = $.extend({},
        {
            setTables: function(tables) {
                _tables.setTables(tables);
            },

            validate: function() { return true },
            showAlert: function(oMsg) {
                _sectionFrm.showAlert(oMsg);
            },

            form: function() { return _sectionFrm.form(); },
            resetForm: function() {
                _sectionFrm.tResetForm();

                $(`#${_idFrm} input`).val("");
                $(`#${_idFrm} select`).val(null).trigger("change");
                $(`#${_idFrm} input[type=radio]`).prop("checked", false).trigger("change");
                $(`#${_idFrm} input[type=checkbox]`).prop("checked", false).trigger("change");

                _files.resetAll();
                _tables.resetAll();
                _templates.resetAll();

                $(_self).triggerHandler("resetForm");
            }
        });

    _self.public = $.extend({},
        $.SectionBase(_idFrm),
        {
            initialize: function() {
                $(_self).trigger("initializing");
                _files.initialize();
                _tables.initialize();
                _templates.initialize();

                _sectionFrm.tResetForm();
                $(_self).trigger("initialized");
            },
            validate: function() {
                _sectionFrm.tResetForm();
                return _sectionFrm.form() && _self.validate();
            },
            readOnly: function() {
                _readOnly = true;
                $(`#preview_${_idFrm}`).hide();

                $(`#${_idFrm} input, #${_idFrm} select, #${_idFrm} textarea`).prop("disabled", true);
                $(".panel-collapse").removeClass("in");

                _files.readOnly();
                _tables.readOnly();
                _templates.readOnly();

                $(_self).trigger("readOnly");
            },
            get: function() {
                return _controlDataHandler.getJsonSection(_idFrm);
            },
            load: function(oJson) {
                _originalItem = oJson;
                $(_self).trigger("loading");
                _controlDataHandler.loadJsonSection(_idFrm, oJson);
                $(_self).trigger("loaded");
            }
        });

    // Propiedades
    Object.defineProperty(_self,
        "originalItem",
        {
            get: function() { return _originalItem; },
            enumerable: false
        });
    Object.defineProperty(_self,
        "isReadOnly",
        {
            get: function() {
                return _readOnly;
            },
            enumerable: false
        });

    // Obtiene el json de la sección
    var _controlDataHandler = $.ControlDataHandler();

    return _self;
};

$.TableSimple = function(sId, oSettings) {
    var _id = sId;
    var _tabla = $(`#${sId}`);
    _tabla.uDrawDataTable({ modalLink: { visible: false, visiblePopup: false } });
    _tabla.uDataTable(oSettings);

    var _self = $.extend({}, $.TableBase(sId));

    $(`#${_id} tbody`).on("click",
        "td.details-control",
        function(e) {
            var tr = $(this).closest("tr");
            var row = _self.dtTable.row(tr);

            if (row.child.isShown()) {
                // This row is already open - close it
                row.child.hide();
                tr.removeClass("shown");
            } else {
                // Open this row
                row.child(format(row.data())).show();
                tr.addClass("shown");
            }
        });

    return _self;
};

$.TableCRUD = function(sId, oModal, tableSettings, drawEditColumn) {
    //Propiedades de la clase
    var _iSelectedIndex = -1;
    var _id = sId;
    var _modal = oModal;
    var _tabla = $(`#${_id}`);
    var _drawEditColumn = drawEditColumn || true;

    if (_drawEditColumn) {
        var htmlEdit = "<th>Editar</th>";
        _tabla.find("tr").prepend(htmlEdit);

        tableSettings.columns.splice(0,
            0,
            {
                data: "Edit",
                render: function() {
                    return '<center><a data-link="openModal" href="#" ><i class="glyphicon glyphicon-edit"></i></a></center>';
                }
            });
    }

    _tabla.uDrawDataTable({ modalLink: { visible: true, visiblePopup: true } });
    _tabla.uDataTable(tableSettings);

    //Métodos que extienden la clase y que se usarán desde sus instancias
    //Métodos públicos
    var _self = $.extend({},
        $.TableBase(_id),
        {
            initialize: function() {
                _modal.initialize();
            },
            showModal: function(rowData) {
                showModal(rowData);
            },
            readOnly: function() {
                $(`#lnkCaptura${_id}`).hide();
                $(`#popup${_id}`).hide();
                _modal.readOnly();
                $(this).trigger("readOnly");
            },
            showCapture: function(show) {
                if (show)
                    $(`#lnkCaptura${_id}`).show();
                else
                    $(`#lnkCaptura${_id}`).hide();
            }
        });

    //Métodos de uso interno de la clase
    //Métodos privados
    var showModal = function(data) {
        if (_modal === undefined || _modal === null) return;

        if (data === undefined || data === null) {
            _iSelectedIndex = -1;
            _modal.show(null);
        } else if (_self.dtTable.data().length > 0) {
            var oTabla = _self.dtTable.row(data).data();
            _iSelectedIndex = _self.dtTable.row(data).index();
            _modal.show(oTabla);
        }
    };

    //Eventos para componentes de la clase
    $(`#lnkCaptura${_id}`).click(function(e) {
        showModal();
        e.preventDefault();
    });

    $(`#${_id} tbody`).on("click",
        "a",
        function(e) {
            if ($(this).attr("data-link") === "openModal") {
                showModal($(this).closest("tr"));
            }
            e.preventDefault();
        });

    //Funciones para los eventos de las clases asociadas
    //Eventos para los triggers
    $(_modal).on("save",
        function(event, oTabla) {
            if (_iSelectedIndex === -1) {
                _self.dtTable.row.add(oTabla).draw();
            } else {
                _self.dtTable.row(_iSelectedIndex).data(oTabla).draw(false);
            }
            $(_self).trigger("rowUpdate", "save");
        });

    $(_modal).on("delete",
        function(event) {
            _self.dtTable.row(_iSelectedIndex).remove().draw(false);
            $(_self).trigger("rowUpdate", "delete");
        });

    $(_modal).on("get",
        function(event) {
            return _self.dtTable.data().toArray();
        });

    //Llamadas a funciones de inicialización de la clase

    //Retorno del objeto de la clase
    return _self;
};

$.TableMModal = function(sId, aModal, tableSettings) {
    //Propiedades de la clase
    var _iSelectedIndex = -1;
    var _id = sId;
    var _aModal = aModal;
    var _ReadOnly = false;

    var _tabla = $(`#${_id}`);
    _tabla.uDrawDataTable({ modalLink: { visible: false } });
    _tabla.uDataTable(tableSettings);

    //Métodos que extienden la clase y que se usarán desde sus instancias
    //Métodos públicos
    var _self = $.extend(true,
        {},
        $.TableBase(_id),
        {
            rowUpdate: function(item, index) {
                var _index = index || _iSelectedIndex;
                if (item) {
                    this.dtTable.row(_index).data(item).draw(false);
                    $(this).trigger("save");
                }
            },
            initialize: function() {
                for (let m = 0; m < _aModal.length; m++)
                    _aModal[m].initialize();
            },
            readOnly: function() {
                _ReadOnly = true;
                for (let m = 0; m < _aModal.length; m++)
                    _aModal[m].readOnly();
                $(this).trigger("readOnly");
            }
        });

    //Métodos de uso interno de la clase
    //Métodos privados

    //Eventos para componentes de la clase
    $(`#${_id} tbody`).on("click",
        "a",
        function(e) {
            var htmlrow = this.parentElement.parentElement.parentElement;
            var _item = _self.dtTable.row(htmlrow).data();
            var _dataLink = $(this).attr("data-link");
            _iSelectedIndex = _self.dtTable.row(htmlrow).index();

            $(_self).trigger("openModal", [{ item: _item, dataLink: _dataLink }]);;

            e.preventDefault();
        });

    //Funciones para los eventos de las clases asociadas
    //Eventos para los triggers
    for (let m = 0; m < _aModal.length; m++) {
        $(_aModal[m]).on("save",
            function(event, oTabla) {
                _self.dtTable.row(_iSelectedIndex).data(oTabla).draw(false);
                $(_self).trigger("save");
            });

        $(_aModal[m]).on("get",
            function(event) {
                return _self.dtTable.data().toArray();
            });
    }

    Object.defineProperty(_self,
        "isReadOnly",
        {
            get: function() { return _ReadOnly; },
            enumerable: false
        });

    //Llamadas a funciones de inicialización de la clase

    //Retorno del objeto de la clase
    return _self;
};

$.TableEdit = function(sId, oModal, tableSettings, drawEditColumn) {
    //Propiedades de la clase
    var _iSelectedIndex = -1;
    var _id = sId;
    var _modal = oModal;
    var _tabla = $(`#${_id}`);
    var _drawEditColumn = drawEditColumn || true;

    if (_drawEditColumn) {
        var htmlEdit = "<th>Editar</th>";
        _tabla.find("tr").prepend(htmlEdit);


        tableSettings.columns.splice(0,
            0,
            {
                data: "Edit",
                render: function() {
                    return '<center><a data-link="openModal" href="#" ><i class="glyphicon glyphicon-edit"></i></a></center>';
                }
            });
    }

    _tabla.uDrawDataTable({ modalLink: { visible: false, visiblePopup: true } });
    _tabla.uDataTable(tableSettings);

    //Métodos que extienden la clase y que se usarán desde sus instancias
    //Métodos públicos
    var _self = $.extend(true,
        {},
        $.TableBase(_id),
        {
            initialize: function() {
                _modal.initialize();
            },
            showModal: function(rowData) {
                showModal(rowData);
            },
            readOnly: function() {
                _modal.readOnly();
                $(this).trigger("readOnly");
            }
        });

    //Métodos de uso interno de la clase
    //Métodos privados
    var showModal = function(dato) {
        if (_modal !== null && _self.dtTable.data().length > 0) {
            var oTabla = _self.dtTable.row(dato).data();
            _iSelectedIndex = _self.dtTable.row(dato).index();
            _modal.show(oTabla);
        }
    };

    //Eventos para componentes de la clase
    $(`#${_id} tbody`).on("click",
        "a",
        function(e) {
            if ($(this).attr("data-link") === "openModal") {
                showModal($(this).closest("tr"));
            }
            e.preventDefault();
        });

    //Funciones para los eventos de las clases asociadas
    //Eventos para los triggers
    $(_modal).on("save",
        function(event, oTabla) {
            if (_iSelectedIndex === -1) {
                _self.dtTable.row.add(oTabla).draw();
            } else {
                _self.dtTable.row(_iSelectedIndex).data(oTabla).draw(false);
            }
            //$(_self).trigger("save", [oTabla]);
            $(_self).trigger("rowUpdate", "save");
        });

    $(_modal).on("get",
        function(event) {
            return _self.dtTable.data().toArray();
        });

    //Llamadas a funciones de inicialización de la clase

    //Retorno del objeto de la clase
    return _self;
};

$.ModalEdit = function(sIdDiv, oRules) { // crud - edit
    var _self = {};

    var _readOnly = false;
    var _rules = oRules || {};
    var _idModalDiv = sIdDiv;
    var _idModalFrm = $(`#${sIdDiv} form`)[0].id;

    var _files = $.AttachedFilesHandler(_idModalFrm);
    var _tables = $.TablesHandler();
    var _templates = $.TemplateHandler(_idModalFrm);
    var _originalItem = null;

    var _modalFrm = $(`#${_idModalFrm}`).uValidate({ rules: _rules });

    _self = $.extend({},
        {
            setTables: function(tables) {
                _tables.setTables(tables);
            },

            showAlert: function(oMsg) {
                _modalFrm.showAlert({ sMessage: oMsg, iSeconds: 7, isScroll: true });
            },
            close: function() {
                $(_self).trigger("closing");
                $(`#${_idModalDiv}`).modal("hide");
                $(_self).trigger("closed");
            },

            get: function() {
                return _controlDataHandler.getJsonModal(_idModalFrm);
            },
            getObject: function() {
                return _controlDataHandler.getJsonModal(_idModalFrm);
            },
            loadObject: function(oJson) {
                $(_self).trigger("loading");
                _controlDataHandler.loadJsonModal(_idModalFrm, oJson);
                $(_self).trigger("loaded");
            },

            validate: function() { return true; }
        });

    _self.public = $.extend(true,
        {},
        $.ModalBase(),
        {
            initialize: function() {
                $(_self).trigger("initializing");

                _files.initialize();
                _tables.initialize();
                _templates.initialize();

                $(_self).trigger("initialized");
            },
            show: function(item) {
                $(_self).trigger("showing");

                _originalItem = item;
                // Se limpia la modal
                resetForm();

                // Se agrega la información
                if (item !== undefined && item !== null) {
                    _self.loadObject(item);
                }

                // Se establece el modo lectura
                if (_readOnly)
                    setReadOnly();

                // Se muestra la modal
                $(`#${_idModalDiv}`).modal("show");
                $(_self).trigger("show");
            },
            readOnly: function() {
                _readOnly = true;
            }
        });

    // Métodos privados
    var resetForm = function() {
        _modalFrm.tResetForm();

        $(`#${_idModalFrm} input`).val("");
        $(`#${_idModalFrm} textarea`).val("");
        $(`#${_idModalFrm} select`).val(null).trigger("change");
        $(`#${_idModalFrm} input[type=radio]`).prop("checked", false).trigger("change");
        $(`#${_idModalFrm} input[type=checkbox]`).prop("checked", false).trigger("change");

        _files.resetAll();
        _tables.resetAll();
        _templates.resetAll();

        $(_self).triggerHandler("resetForm");
    };

    var setReadOnly = function() {
        $(`#${_idModalDiv} button.save`).hide();
        $(`#${_idModalFrm} input, #${_idModalFrm} select, #${_idModalFrm} textarea`).prop("disabled", true);

        _files.readOnly();
        _tables.readOnly();
        _templates.readOnly();

        $(_self).trigger("readOnly");
    };

    // Eventos para componentes de la clase
    $(`#${_idModalDiv} button.save`).click(function() {
        _modalFrm.tResetForm();
        var oModal = _self.getObject();

        if (!_modalFrm.form()) {
            _modalFrm.showAlert({
                sMessage: "Llene los campos requeridos",
                isScroll: true,
                iSeconds: 5
            });
        } else if (_self.validate(oModal)) {
            $(_self.public).trigger("save", [oModal]);
            $(`#${_idModalDiv}`).modal("hide");
        }
    });

    // Propiedades
    Object.defineProperty(_self,
        "originalItem",
        {
            get: function() { return _originalItem; },
            enumerable: false
        });

    Object.defineProperty(_self,
        "isReadOnly",
        {
            get: function() { return _readOnly; },
            enumerable: false
        });


    // Obtiene el json de la modal
    var _controlDataHandler = $.ControlDataHandler();

    //Llamadas a funciones de inicialización de la clase
    return _self;
};

$.ModalCRUD = function(sIdDiv, oRules, renderSettings) {
    var _renderSettings = $.extend(true,
        {
            title: {
                genericTitle: $(`#${sIdDiv} h4.modal-title`).text(),
                prefixTitleAdd: "Agregar ",
                prefixTitleModified: "Editar ",
                dinamyc: true
            }
        },
        renderSettings || {});

    var _self = {};

    var _readOnly = false;
    var _originalItem = null;
    var _isNewItem = false;

    var _rules = oRules || {};
    var _idModalDiv = sIdDiv;
    var _idModalFrm = $(`#${sIdDiv} form`)[0].id;

    var _files = $.AttachedFilesHandler(_idModalFrm);
    var _tables = $.TablesHandler();
    var _templates = $.TemplateHandler(_idModalFrm);

    var _modalFrm = $(`#${_idModalFrm}`).uValidate({ rules: _rules });

    _self = $.extend({},
        {
            setTables: function(tables) {
                _tables.setTables(tables);
            },
            isNewItem: function() { return _isNewItem; },
            isDuplicated: function(aJsonPath) {
                var result = false;

                var original = this.originalItem;
                var actual = this.getObject();
                var data = $(this.public).triggerHandler("get");

                if (typeof data != "undefined" && !Utils.objEquals(original, actual, aJsonPath)) {
                    for (let i = 0; i < data.length; i++) {
                        if (Utils.objEquals(data[i], actual, aJsonPath)) {
                            result = true;
                            break;
                        }
                    }
                }
                return result;
            },
            showAlert: function(oMsg) {
                _modalFrm.showAlert({ sMessage: oMsg, iSeconds: 7, isScroll: true });
            },
            close: function() {
                $(_self).trigger("closing");
                $(`#${_idModalDiv}`).modal("hide");
                $(_self).trigger("closed");
            },
            get: function() {
                return _controlDataHandler.getJsonModal(_idModalFrm);
            },
            getObject: function() {
                return _controlDataHandler.getJsonModal(_idModalFrm);
            },
            loadObject: function(oJson) {
                $(_self).trigger("loading");
                _controlDataHandler.loadJsonModal(_idModalFrm, oJson);
                $(_self).trigger("loaded", [oJson]);
            },

            validate: function() { return true }
        });

    _self.public = $.extend(true,
        {},
        $.ModalBase(),
        {
            initialize: function() {
                $(_self).trigger("initializing");

                _files.initialize();
                _tables.initialize();
                _templates.initialize();

                $(_self).trigger("initialized");
            },
            show: function(item) {
                $(_self).triggerHandler("showing");

                // Limpiando valores
                _originalItem = null;
                _isNewItem = (item == undefined);

                // Se limpia la modal
                resetForm();

                // Se agrega la información
                if (!_isNewItem) {
                    _originalItem = item;
                    _self.loadObject(item);
                }

                // Se establece el modo lectura
                if (_readOnly)
                    setReadOnly();

                // Se muestra la modal
                $(`#${_idModalDiv}`).modal("show");
                $(_self).trigger("show");
            },
            readOnly: function() {
                _readOnly = true;
            }
        });

    // Métodos privados
    var resetForm = function() {
        if (_renderSettings.title.dinamyc)
            if (_isNewItem) {
                $(`#${_idModalDiv} h4.modal-title`)
                    .text(_renderSettings.title.prefixTitleAdd + " " + _renderSettings.title.genericTitle);
                $(`#${_idModalDiv} button.delete`).hide();
            } else {
                $(`#${_idModalDiv} h4.modal-title`).text(_renderSettings.title.prefixTitleModified +
                    " " +
                    _renderSettings.title.genericTitle);
                $(`#${_idModalDiv} button.delete`).show();
            }

        _modalFrm.tResetForm();

        $(`#${_idModalFrm} input`).val("");
        $(`#${_idModalFrm} textarea`).val("");
        $(`#${_idModalFrm} select`).val(null).trigger("change");
        $(`#${_idModalFrm} input[type=radio]`).prop("checked", false).trigger("change");
        $(`#${_idModalFrm} input[type=checkbox]`).prop("checked", false).trigger("change");

        _files.resetAll();
        _tables.resetAll();
        _templates.resetAll();

        $(_self).triggerHandler("resetForm");
    };

    var setReadOnly = function() {
        $(`#${_idModalDiv} button.save, #${_idModalDiv} button.delete`).hide();
        $(`#${_idModalFrm} input, #${_idModalFrm} select, #${_idModalFrm} textarea`).prop("disabled", true);

        _files.readOnly();
        _tables.readOnly();
        _templates.readOnly();

        $(_self).trigger("readOnly");
    };

    // Eventos para componentes de la clase
    $(`#${_idModalDiv} button.save`).click(function() {
        _modalFrm.tResetForm();
        var oModal = _self.getObject();

        if (!_modalFrm.form()) {
            _modalFrm.showAlert({
                sMessage: "Llene los campos requeridos",
                isScroll: true,
                iSeconds: 5
            });
        } else if (_self.validate(oModal)) {
            $(_self.public).trigger("save", [oModal]);
            $(`#${_idModalDiv}`).modal("hide");
        }
    });

    $(`#${_idModalDiv} button.delete`).click(function() {
        // Se debe agregar algo para poder hacer la eliminacion ¿Confirmación?        
        $(_self.public).trigger("delete");
        $(`#${_idModalDiv}`).modal("hide");
    });

    // Propiedades
    Object.defineProperty(_self,
        "originalItem",
        {
            get: function() { return _originalItem; },
            enumerable: false
        });

    Object.defineProperty(_self,
        "isNewItem",
        {
            get: function() { return _isNewItem; },
            enumerable: false
        });

    Object.defineProperty(_self,
        "isReadOnly",
        {
            get: function() { return _readOnly; },
            enumerable: false
        });

    // Obtiene el json de la modal
    var _controlDataHandler = $.ControlDataHandler();

    //Llamadas a funciones de inicialización de la clase
    return _self;
};

function format(d) {
    // `d` is the original data object for the row  
    return `<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">
            <tr><td>Descripción de actividad:</td>
            <td>${d.metadato}</td></tr>
            </table>`;
}

// Manejador de controles
$.ControlDataHandler = function() {
    var _self = {
        get: {
            "txt": function(id) { return $(`#${id}`).val(); },
            "cbo": function(id) {
                return {
                    text: $(`#${id} option:selected`).text(),
                    id: $(`#${id}`).val()
                };
            },
            "file": function(id) { return $(`#${id}`).getFileInfo(); },
            "dt": function(id) { return $(`#${id}`).getData(); },
            "template": function(id) { return $(`#${id}`).getFileInfo(); },
            "text": function(id) { return $(`#${id}`).text(); },
            "lbl": function(id) { return $(`#${id}`).text(); },
            "td": function(id) { return $(`#${id}`).text(); },
            "html": function(id) { return $(`#${id}`).html(); },
            "cbxtxt": function(id) {
                return {
                    IsChecked: $(`#${id}`).is(":checked"),
                    Text: $(`#${id}`).parent().text().trim()
                };
            },
            "rbtxt": function(id) {
                return {
                    IsSelect: $(`#${id}`).is(":checked"),
                    Text: $(`#${id}`).parent().text().trim()
                };
            },
            "txtUpper": function(id) { return $(`#${id}`).val().toUpperCase(); },
            "txtLower": function(id) { return $(`#${id}`).val().toLowerCase(); }
        },
        set: {
            "txt": function(id, value) { $(`#${id}`).val(value); },
            "cbo": function(id, value) { $(`#${id}`).val(value.id).change(); },
            "file": function(id, value) { $(`#${id}`).setFile(value); },
            "dt": function(id, value) { $(`#${id}`).loadData(value); },
            "template": function(id, value) { $(`#${id}`).setFile(value); },
            "text": function(id, value) { $(`#${id}`).text(value); },
            "lbl": function(id, value) { $(`#${id}`).text(value); },
            "td": function(id, value) { $(`#${id}`).text(value); },
            "html": function(id, value) { $(`#${id}`).html(value); },
            "cbxtxt": function(id, value) {
                $(`#${id}`).prop("checked", value.IsChecked).change();
                $(`#${id}`).parent().find("span").text("").text(value.Text);
            },
            "rbtxt": function(id, value) {
                $(`#${id}`).prop("checked", value.IsSelect).change();
                $(`#${id}`).parent().find("span").text("").text(value.Text);
            },
            "txtUpper": function(id, value) { $(`#${id}`).val(value); },
            "txtLower": function(id, value) { $(`#${id}`).val(value); }
        },
        getJsonSection: function(frmSectionId) {
            var ids = $(`#${frmSectionId} .dth`).map(function() { return this.id; }).get();
            var jsonResult = {};

            for (let e = 0; e < ids.length; e++) {
                jsonResult = $.extend(true,
                    {},
                    jsonResult,
                    this.getJsonItem(ids[e], ids[e].split("_"), 1));
            }

            return jsonResult;
        },
        loadJsonSection: function(frmSectionId, oJson) {
            var ids = $(`#${frmSectionId} .dth`).map(function() { return this.id; }).get();
            for (let e = 0; e < ids.length; e++) {
                this.setJsonItem(ids[e], ids[e].split("_"), 1, oJson);
            }
        },
        getJsonModal: function(frmModalId) {
            var ids = $(`#${frmModalId} .dth`).map(function() { return this.id; }).get();
            var jsonResult = {};

            for (let e = 0; e < ids.length; e++) {
                jsonResult = $.extend(true,
                    {},
                    jsonResult,
                    this.getJsonItem(ids[e], ids[e].split("_"), 2));
            }

            return jsonResult;
        },
        loadJsonModal: function(frmModalId, oJson) {
            var ids = $(`#${frmModalId} .dth`).map(function() { return this.id; }).get();
            for (let e = 0; e < ids.length; e++) {
                this.setJsonItem(ids[e], ids[e].split("_"), 2, oJson);
            }
        },
        getJsonItem: function(id, aPath, index) {
            var internalJson = {};
            if (aPath.length - 1 === index)
                internalJson[aPath[index]] = this.get[aPath[0]](id);
            else {
                internalJson[aPath[index]] = this.getJsonItem(id, aPath, ++index);
            }
            return internalJson;
        },
        setJsonItem: function(id, aPath, index, internalJson) {
            if (aPath.length - 1 === index) {
                if (internalJson[aPath[index]])
                    this.set[aPath[0]](id, internalJson[aPath[index]]);
            } else {
                var tmp = internalJson[aPath[index]];
                if (tmp)
                    this.setJsonItem(id, aPath, ++index, tmp);
            }
        },
        loadJson: function(frmSectionId, oJson, index) {
            var ids = $(`#${frmSectionId} .dth`).map(function() { return this.id; }).get();
            for (let e = 0; e < ids.length; e++) {
                this.setJsonItem(ids[e], ids[e].split("_"), index || 1, oJson);
            }
        }
    };
    return _self;
};
var cdh = $.ControlDataHandler();

(function($) {
    $.fn.getData = function() {
        var _dtTable = this.DataTable();
        return _dtTable.data().toArray();
    };
    $.fn.loadData = function(data) {
        var _dtTable = this.DataTable();
        _dtTable.rows.add(data).draw();
        $(this).trigger("loadedData", [data]);
    };
    $.fn.getFileInfo = function() {
        return {
            OriginalName: this.attr("data-original-name"),
            SystemName: this.attr("data-file-name"),
            Hash: this.attr("data-file-hash"),
            ToPDF: this.attr("data-file-toPDF")
        };
    };
    $.fn.setFile = function(data) {
        $(this).trigger("setFile", [data]);
    };
    $.fn.setSignature = function(isSignatrue) {
        $(this).trigger("setSignature", [isSignatrue]);
    };
    $.fn.subscribe = function(methods) {
        if (methods.create)
            $(this).on("createDocumentFormTemplate", methods.create);
        if (methods.success)
            $(this).on("createDocumentSuccess", methods.success);
        if (methods.error)
            $(this).on("createDocumentError", methods.error);
    };
})(jQuery);

$.EnableActionButton = function() {};