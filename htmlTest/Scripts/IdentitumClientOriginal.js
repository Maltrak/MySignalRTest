/// <reference path="jquery-1.9.1.js" />
var urlService = "http://192.168.0.156:3990/Identitum_SPF/TransactionService/TransactionService.svc";
var hubService = "http://localhost:8087/signalr";
var idTransaction;
var uID ;
var isOk;
var transaction;
var idBtn;
var verifyselectedfingers = 0;
var enablegFingerForCapture = [8, 7, 6, 1, 2, 3];
var localServiceReady = false;

$(function () {
    $.contextMenu({
        selector: '.context-menu-one',
        callback: function (key, options) {
            var id = $(this).attr('id').replace('F', '');

            if (key === "missing") {

                transaction.server.setMissing(id, true);
                $(this).removeClass("NoCaptured");
                $(this).addClass("Missing");
            }

            if (key === "verify") {
                ++verifyselectedfingers;
                transaction.server.setCanVerify(id, true);
                $(this).removeClass("Missing");
                $(this).removeClass("Captured");
                $(this).addClass("ForVerify");
            }

        },
        items: {
            "verify": {
                name: "Usar para verificar", icon: "fa-check-square", disabled: function (key, opt) {
                    return !this.data('enableVerify');
                }
            },
            "missing": {
                name: "Marcar como ausente", icon: "fa-minus-square", disabled: function (key, opt) {
                    return !this.data('enableMissing');
                }
            },
        },
        events: {
            show: function (opt) {
                this.data('enableMissing', $(this).hasClass("NoCaptured"));
                var idTOValidate = eval($(this).attr('id').replace('F', ''));

                if (verifyselectedfingers < 2 && jQuery.inArray(idTOValidate, enablegFingerForCapture) != -1) {
                    this.data('enableVerify', $(this).hasClass("Captured"));
                }
            },
            hide: function (opt) {
                // this is the trigger element
                var $this = this;
            }
        }
    });

    $('.context-menu-one').on('click', function (e) {
        console.log('clicked', this);
    })
});

$(document).ready(function () {
    loadHub();
    $('.Finger').on('click', function (e) {

        $(".EnrollForm").hide();
        $(".CaptureFinger").show();

        $('#ModalIdentitumClient').modal('handleUpdate')

        $("#FingerDisplay").removeClass("FingerDisplayCaptured");
        $("#FingerDisplay").addClass("FingerDisplay");

        idBtn = $(this);
        transaction.server.enrollFinger($(this).attr('id').replace('F', ''));

    })

    $('#btnCancelCaptureFingerPrint').on('click', function (e) {
        $(".EnrollForm").show();
        $(".CaptureFinger").hide();
    })

    $('#btnSaveCaptureFingerPrint').on('click', function (e) {
        $(".EnrollForm").show();
        $(".CaptureFinger").hide();
    })


    $(":input").prop("disabled", true);

    $('#txtUsuario').prop("disabled", false);
    $('#txtSupervisor').prop("disabled", false);
    $('#cboTransaction').prop("disabled", false);
    $("#btnStart").prop("disabled", false);


    $("#btnStart").click(function () {

        if (!localServiceReady) {
            alert("No fue posible establecer una conexión con el servicio local de Identitum. No cierre este mensaje hasta haber iniciado el servicio e intente nuevamente");
            loadHub();
            return;
        }

        //$("body").css("cursor", "progress");
        $('#Feedback').text("");
        verifyselectedfingers = 0;

        $('#ModalIdentitumClient').modal({
            keyboard: false,
            backdrop: 'static'
        })

        $(".Finger").removeClass("Missing");
        $(".Finger").removeClass("Captured");
        $(".Finger").removeClass("ForVerify");
        $(".Finger").removeClass("NoCaptured");
        $(".Finger").addClass("FingerNotEnabled");

        $("#btnCancelCaptureForm").prop("disabled", false);
      
		uID=$("#txtSupervisor").val();
        transaction.server.invoke(uID, urlService);
		
        $("#btnStart").prop("disabled", true);
    });

    $("#btnSendCaptureForm").click(function () {
        transaction.server.save();
    });

    $("#btnCancelCaptureForm").click(function () {
        transaction.server.cancel();
        $('#ModalIdentitumClient').modal('hide')
    });
});

function loadHub() {

    $.getScript(hubService + "/hubs")
    .done(function (script, textStatus) {
        connectHub();
    })
    .fail(function (jqxhr, settings, exception) {
        localServiceReady = false;
    });
}

function connectHub() {
    // Start the connection
    $.connection.hub.url =hubService ;
    transaction = $.connection.messageRecievingHub;
	//transaction = $.connection.transactionClientServiceHub
	//debugger;
    $.connection.hub.logging = true;
    subscribeServerEvents();
    $.connection.hub.start().done(function () {
		localServiceReady = true;

        $.connection.hub.disconnected(function () {
            alert("El cliente fue desconectado, por favor inicie o reinicie el servicio local y cargue nuevamente la página");
            connectHub();
        });

    }).fail(function () {
        alert("No fue posible establecer una conexión con el servicio local de Identitum");
    });
}

function subscribeServerEvents() {
	
	transaction.client.addInvoke = function (it, res) {
        isOk = res;
        idTransaction = it;
		localServiceReady = res;
      
        console.log("Inovcación.");
        console.log("Status: " + isOk);
        console.log("IdTransaction: " + idTransaction);
        //console.log("minimo huellas: " + minimumFingerprintsRequired);


        if (isOk) {
			  var users;

        switch ($('#cboTransaction').find('option:selected').val()) {
            case "1":
                users = [
            { "UserAlias": $('#txtSupervisor').val(), "Rol": "Supervisor", "Action": 2 },
            { "UserAlias": $('#txtUsuario').val(), "Rol": "Usuario", "Action": 1 }
                ];
                break;
            case "2":
                users = [{
                    "UserAlias": $('#txtUsuario').val(), "Rol": "Usuario", "Action": 2
                }, ];
                break;
            case "6":
                users = [
            { "UserAlias": $('#txtSupervisor').val(), "Rol": "Supervisor", "Action": 1 },
                ];
                break;
            case "7":
                users = [
            { "UserAlias": $('#txtSupervisor').val(), "Rol": "Supervisor", "Action": 2 },
                ];
                break;
            case "10":
                users = [
            { "UserAlias": $('#txtSupervisor').val(), "Rol": "Supervisor", "Action": 2 },
            { "UserAlias": $('#txtUsuario').val(), "Rol": "Usuario", "Action": 5 }
                ];
                break;
            default:
                alert("Transacción no soportada, favor de configurar");
                break;

        }

			transaction.server.startCapture(users, $('#cboTransaction').find('option:selected').val(),urlService);
        
        } else {

            alert("HUBO UN ERROR DURANTE LA INVOCACIÓN, CONTACTE AL ADMINISTRADOR DEL SISTEMA.");

        }
    };

	
    transaction.client.clientResponse = function (response) {
        $('#Feedback').text(response.ResponseCode + "-" + response.ResponseDescription);
        alert(response.ResponseCode + "-" + response.ResponseDescription);
        $('#ModalIdentitumClient').modal('hide')
        $("#btnStart").prop("disabled", false);
        $(".EnrollForm").hide();
        $(".VerifyForm").hide();
    };

    transaction.client.deviceReady = function () {
        $("#btnCancelCaptureFingerPrint").prop('disabled', false);
        $("#MensajeCapturaFinger").text("Coloque su dedo en el lector de huellas...");

    };

    transaction.client.markedAsMissingFinger = function () {
        $(idBtn).removeClass("no-captured");
        $(idBtn).addClass("captured-missing");
        alert("Se supero el máximo número de intentos, se marcó el dedo como ausente");
        $(".EnrollForm").show();
        $(".CaptureFinger").hide();
    };

	 transaction.client.addCapture = function (status, nfiq, message, quality, image) {
            console.log('AddVerification');
            //statusResponse = status;
            //nfiqResponse = nfiq;
            console.log('idTransaction: ' + idTransaction);
            if (status) {
                //huella = image;
                //waitingDialog.show('Esperando respuesta', { dialogSize: 'sm' });
                //waitingDialog.show('Esperando respuesta', {dialogSize: 'sm'});
                transaction.server.sendVerification(idTransaction);

            } else {
                console.log(message);
                alert('Captura falló.', 'Desconecte y conecte el lector de nuevo e intentelo de nuevo');
                //showAlert('Captura falló.', message);
            }
        };
        transaction.client.addSendVerification = function (code, description) {
            //waitingDialog.hide();
            console.log('addSendVerification');
            responseCode = parseInt(code);
            responseDescription = description;
			alert(responseCode + " - " + responseDescription);
			$(".IdentitumClientControl").removeClass("IdentitumClientControlVerify");
			$(".IdentitumClientControl").removeClass("IdentitumClientControlEnroll");
			$("#btnStart").prop("disabled", false);
			//$(".EnrollForm").hide();
			//$(".VerifyForm").hide();
			$('#ModalIdentitumClient').modal('hide');
          };


    transaction.client.feedback = function (feedback) {
        $("#Feedback").prop("disabled", false);
        $("#Feedback").addClass("bg-danger");
        $("#Feedback").text(feedback.FeedbackType + " - " + feedback.Message);
    };

    transaction.client.showEnrollForm = function () {
        $(".IdentitumClientControl").removeClass("IdentitumClientControlVerify");
        $(".IdentitumClientControl").addClass("IdentitumClientControlEnroll");
        $(".EnrollForm").show();
        $('#ModalIdentitumClient').modal('handleUpdate')
    };

    transaction.client.showVerifyForm = function () {
        $(".IdentitumClientControl").removeClass("IdentitumClientControlEnroll");
        $(".IdentitumClientControl").addClass("IdentitumClientControlVerify");
        $(".EnrollForm").hide();
        $(".VerifyForm").show();
		//debugger;
		transaction.server.capture(idTransaction);
        //$('#ModalIdentitumClient').modal('handleUpdate')
    };
	
    transaction.client.templateCreated = function () {
        $("#btnCancelCaptureFingerPrint").prop('disabled', true);
        $("#MensajeCapturaFinger").text("La huella fue capturada exitosamente");
        $("#btnSaveCaptureFingerPrint").prop('disabled', false);

        $("#FingerDisplay").removeClass("FingerDisplay");
        $("#FingerDisplay").addClass("FingerDisplayCaptured");

        $("#btnSendCaptureForm").prop("disabled", false);

        $(idBtn).removeClass("NoCaptured");
        $(idBtn).removeClass("Missing");
        $(idBtn).addClass("Captured");

        $(".EnrollForm").show();
        $(".CaptureFinger").hide();

    };

    transaction.client.showCharacteristics = function (characteristics) {
		debugger;
        for (var i = 0; i < characteristics.Details.length; i++) {
            $("#F" + characteristics.Details[i].BiometricCharacteristicId).removeClass("FingerNotEnabled");
            $("#F" + characteristics.Details[i].BiometricCharacteristicId).addClass("NoCaptured");
        }
    };

}
