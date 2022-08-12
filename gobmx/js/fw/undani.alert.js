(function ($) {

	$.uAlert = function (oSettings, fnConfirm, fnCancel) {
		var dfd = $.Deferred();

		oSettings = oSettings || {};
		var modalAlert =
			'<div id="divModalUndaniAlert" class="modal fade" tabindex="-1" role="dialog" data-backdrop="static" data-keyboard="false">'
				+ '<div id="divModalUndaniAlertDialog" class="modal-dialog modal-lg" role="document">'
					+ '<div class="modal-content">'
						+ '<div class="modal-header">'
							+ '<h4 class="modal-title" id="titleModalUndaniAlert"></h4>'
						+ "</div>"
						+ '<div class="modal-body"><p id="messageModalUndaniAlert"></p></div>'
						+ '<div class="modal-footer">'
							+ '<button id="btnModalUnaniAlertCancel" type="button" class="btn btn-default" data-dismiss="modal">Cancelar</button>'
							+ '<button id="btnModalUnaniAlertConfirm" type="button" class="btn btn-primary" data-dismiss="modal">Aceptar</button>'
						+ "</div>"
					+ "</div>"
				+ "</div>"
			+ "</div>";

		var buttonClicked = false,
			action = "";

		if (!$("#divModalUndaniAlert").length)
			$("body").append(modalAlert);

		//Inicialización de parámetros
		var oButtons = {
			confirm: {
				text: "Aceptar",
				className: "btn btn-primary"
			},
			cancel: {
				text: "Cancelar",
				className: "btn btn-default"
			}
		};

		var oSettingsDefault = {
			title: "Confirmación",
			message: "¿Confirmar operación?",
			size: "long",
			buttons: oButtons,
			allowEscapeKey: false,
			allowOutsideClick: false
		};

		var oCallbacks = {
			callbackConfirm: (fnConfirm || function () { return true; }),
			callbackCancel: (fnCancel || function () { return false; })
		};

		oSettings = $.extend(true, oSettingsDefault, oSettings, oCallbacks);
		oSettings.allowOutsideClick = oSettings.allowOutsideClick ? true : "static";

		//Modalidades de alerta
		function confirmAlert() {
			$("#btnModalUnaniAlertCancel").show();
			$("#btnModalUnaniAlertConfirm").show();
		}

		function messageAlert() {
			$("#btnModalUnaniAlertCancel").hide();
			$("#btnModalUnaniAlertConfirm").show();
		}

		//Formateo de modal
		function modalSettings(args) {
			//Mensajes
			$("#titleModalUndaniAlert").html(oSettings.title);
			$("#messageModalUndaniAlert").html(oSettings.message);
			//Botones
			$("#btnModalUnaniAlertConfirm").html(oSettings.buttons.confirm.text);
			$("#btnModalUnaniAlertCancel").html(oSettings.buttons.cancel.text);
			$("#btnModalUnaniAlertConfirm").removeClass().addClass(oSettings.buttons.confirm.className);
			$("#btnModalUnaniAlertCancel").removeClass().addClass(oSettings.buttons.cancel.className);
			//Tamaño
			$("#divModalUndaniAlertDialog").removeClass().addClass("modal-dialog");
			if (oSettings.size.indexOf("px") !== -1 || oSettings.size.indexOf("%") !== -1) {
				$("#divModalUndaniAlertDialog").css("width", oSettings.size);
			}
			else {
				let sSizeClass = "";
				switch (oSettings.size) {
					case "small":
						sSizeClass = "modal-sm";
						break;
					case "medium":
						sSizeClass = "";
						break;
					case "long":
					default:
						sSizeClass = "modal-lg";
						break;
				}
				$("#divModalUndaniAlertDialog").addClass(sSizeClass);
			}
			//Modalidad
			args.length === 3 ? confirmAlert() : messageAlert();

		}

		//Funcionalidad para eventos
		$("#btnModalUnaniAlertConfirm").unbind("click").one("click", function (e) {
			buttonClicked = true;
			action = "Confirm";
			$("#btnModalUnaniAlertCancel").unbind("click");
		    $("#divModalUndaniAlert").modal("hide");
		});

		$("#btnModalUnaniAlertCancel").unbind("click").one("click", function (e) {
			buttonClicked = true;
			action = "Cancel";
			$("#btnModalUnaniAlertConfirm").unbind("click");
		    $("#divModalUndaniAlert").modal("hide");
		});

		$("#divModalUndaniAlert").one("hidden.bs.modal", function () {
			$(this).data("bs.modal", null);
			if (oSettings.allowOutsideClick === true) {
				if (!buttonClicked) action = "Cancel";
			}
			action === "Confirm" ? dfd.resolve(oSettings.callbackConfirm()) : dfd.reject(oSettings.callbackCancel());
		});

		$("#divModalUndaniAlert").on("hidden.bs.modal", function () {
		    if ($(".modal.fade.in").length > 0)
		        $("body").addClass("modal-open");
		    else $("body").removeClass("modal-open");
		});

		//Ejecución de modal
		modalSettings(arguments);
		$("#divModalUndaniAlert").modal({
			show: true,
			keyboard: oSettings.allowEscapeKey,
			backdrop: oSettings.allowOutsideClick
		});

		return dfd.promise();
	};

})(jQuery);