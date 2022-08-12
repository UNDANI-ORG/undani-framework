$.Load = function () {
    var _self = {};

    var pleaseWaitDiv = $('<div class="modal fade"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h4 class="modal-title">Por favor espere...</h4></div><div class="modal-body"><div class="progress progress-striped active"><div class="progress-bar" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%">Procesando...</div></div></div></div></div></div></div>');
    _self = $.extend(_self, {

        showModal: function () {
            return pleaseWaitDiv.modal({ backdrop: "static", keyboard: false });
        },

        hideModal: function () {
            return pleaseWaitDiv.modal("hide");
        }
        
    });

    return _self;
};

var Load = $.Load();