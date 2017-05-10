/// <reference path="jquery-1.9.1.js" />
var urlService = "http://192.168.0.156:3990/Identitum_SPF/TransactionService/TransactionService.svc";
//var urlService = "http://10.247.210.2:775/Identitum/TransactionService/TransactionService.svc";
var hubService = "http://localhost:8087/signalr";
var idTransaction;
var idGUIDTransaction;//Id unico de transaccion GUID
var uID ;
var isOk;
var transaction;
var idBtn;
var verifyselectedfingers = 0;
var enablegFingerForCapture = [8, 7, 6, 1, 2, 3];
var localServiceReady = false;
var verifyFromEnroll = false; 
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
				//alert("verifyselectedfingers:"+verifyselectedfingers );
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
					//alert('verifyselectedfingers:' + verifyselectedfingers);
					//alert('idtoVlidate: ' + idTOValidate);
					//alert('inArray : '+ jQuery.inArray(idTOValidate, enablegFingerForCapture));
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
        transaction.server.capture(idGUIDTransaction,$(this).attr('id').replace('F', ''));

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
		
        //$("#btnStart").prop("disabled", true);
    });

    $("#btnSendCaptureForm").click(function () {
		
        transaction.server.save(idGUIDTransaction,verifyFromEnroll);
    });

    $("#btnCancelCaptureForm").click(function () {
        verifyFromEnroll = false;
        $('#ModalIdentitumClient').modal('hide');
        alert("cancelando");
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
    //transaction = $.connection.messageRecievingHub;
	transaction = $.connection.messageReceivingHub;
	
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
        idGUIDTransaction = it;
		localServiceReady = res;
      
        console.log("Invocación.");
        //console.log("Status: " + isOk);
        console.log("Res2: " + res);
		console.log("Resultado: " + idGUIDTransaction);
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
             //transaction.server.captureVerify(idTransaction,users);
			//transaction.server.startCapture(users, $('#cboTransaction').find('option:selected').val(),urlService);
        
        } else {

            alert("HUBO UN ERROR DURANTE LA INVOCACIÓN, CONTACTE AL ADMINISTRADOR DEL SISTEMA.");

        }
    };

	
    transaction.client.clientResponse = function (response) {
        $('#Feedback').text(response.ResponseCode + "-" + response.ResponseDescription);
        alert(response.ResponseCode + "-" + response.ResponseDescription);
		//if (response.ResponseCode = 5000){
        //$('#ModalIdentitumClient').modal('hide')
        //$("#btnStart").prop("disabled", false);
        //$(".EnrollForm").hide();
        //$(".VerifyForm").hide();
		//}
    };

    transaction.client.deviceReady = function () {
        $("#btnCancelCaptureFingerPrint").prop('disabled', false);
        $("#MensajeCapturaFinger").text("Coloque su dedo en el lector de huellas...");

    };

    transaction.client.markedAsMissingFinger = function () {
        $(idBtn).removeClass("no-captured");
        $(idBtn).addClass("captured-missing");
        alert("Se marcó el dedo como ausente");
        $(".EnrollForm").show();
        $(".CaptureFinger").hide();
    };

	transaction.client.addCaptureVerification = function (status, message, nfiq, quality, image) {
            console.log('addCaptureVerification');
            //statusResponse = status;
            //nfiqResponse = nfiq;
            console.log('idGUIDTransaction: ' + idGUIDTransaction);
            if (status) {
				if (verifyFromEnroll){//si proviene de un enrollamiento el resultado
					console.log(' ' + idGUIDTransaction);
					verifyFromEnroll=false;// se asigna falso para que no vuelva a mandar pantalla de verificación. 
					transaction.server.save(idGUIDTransaction,verifyFromEnroll);
				}
				else{
					transaction.server.sendVerification(idGUIDTransaction,verifyFromEnroll);
				}

            } else {
                console.log(message);
				if (message=='Error en capture invoke: Referencia a objeto no establecida como instancia de un objeto.')
                {
                    alert('Captura falló. Existe otra transaccion en curso.');
                }
                else
                { 
                    alert('Captura falló. ' + message);
                }
                //alert('Captura falló. Desconecte y conecte el lector de nuevo e intentelo de nuevo');
				//desconecte y conecte el lector de nuevo e intentelo de nuevo');
                //showAlert('Captura falló.', message);
				$(".IdentitumClientControl").removeClass("IdentitumClientControlVerify");
				$(".IdentitumClientControl").removeClass("IdentitumClientControlEnroll");
				$("#btnStart").prop("disabled", false);
				$(".EnrollForm").hide();
				$(".VerifyForm").hide();
				console.log("valor de verifyFromEnroll: " + verifyFromEnroll);
				$('#ModalIdentitumClient').modal('hide');
		
            }
        };

    transaction.client.addCaptureEnroll = function (status, message) {
           console.log('addCaptureEnroll');
           console.log('idGUIDTransaction: ' + idGUIDTransaction);
           console.log('status: '+ status);
		   console.log('message: '+ message);
           if (status) {
                $("#btnCancelCaptureFingerPrint").prop('disabled', true);
                $("#MensajeCapturaFinger").text("La huella fue capturada exitosamente");
                $("#btnSaveCaptureFingerPrint").prop('disabled', false);

                $("#FingerDisplay").removeClass("FingerDisplay");
                $("#FingerDisplay").addClass("FingerDisplayCaptured");

                $("#btnSendCaptureForm").prop("disabled", false);

                $(idBtn).removeClass("NoCaptured");
                $(idBtn).removeClass("Missing");
                $(idBtn).addClass("Captured");
           }
		   else {
				console.log(message);
				alert('Captura falló,'+ message);
			}
				$(".EnrollForm").show();
				$(".CaptureFinger").hide();
       };
	
	transaction.client.addSendVerification = function (code, description) {
		//waitingDialog.hide();
		console.log('addSendVerification');
		responseCode = parseInt(code);
		responseDescription = description;
		$(".IdentitumClientControl").removeClass("IdentitumClientControlVerify");
		$(".IdentitumClientControl").removeClass("IdentitumClientControlEnroll");
		$("#btnStart").prop("disabled", false);
		$(".EnrollForm").hide();
		$(".VerifyForm").hide();
		console.log("valor de verifyFromEnroll: " + verifyFromEnroll);
		$('#ModalIdentitumClient').modal('hide');
		alert(responseCode + " - " + responseDescription);
	
	};

	transaction.client.addSendEnrollMent = function (code, description) {
		 
		console.log('addSendEnrollMent');
		responseCode = parseInt(code);
		responseDescription = description;
		$(".IdentitumClientControl").removeClass("IdentitumClientControlVerify");
		$(".IdentitumClientControl").removeClass("IdentitumClientControlEnroll");
		$("#btnStart").prop("disabled", false);
		$(".EnrollForm").hide();
		$(".VerifyForm").hide();
		console.log("valor de verifyFromEnroll: " + verifyFromEnroll);
		$('#ModalIdentitumClient').modal('hide');
		alert(responseCode + " - " + responseDescription);
	
	};

    transaction.client.feedback = function (feedback) {
        $("#Feedback").prop("disabled", false);
        $("#Feedback").addClass("bg-danger");
        $("#Feedback").text(feedback.FeedbackType + " - " + feedback.Message);
    };

    transaction.client.showEnrollForm = function (isfromenroll) {
		verifyFromEnroll=isfromenroll;
        $(".IdentitumClientControl").removeClass("IdentitumClientControlVerify");
        $(".IdentitumClientControl").addClass("IdentitumClientControlEnroll");
        $(".EnrollForm").show();
         $(".VerifyForm").hide();
        //$('#ModalIdentitumClient').modal('handleUpdate')

    };

    transaction.client.showVerifyForm = function ( ) {
		//identifica si la verificación viene de un Enrollamiento
		//verifyFromEnroll = fromEnroll;
		console.log("valor de verifyFromEnroll: " + verifyFromEnroll);
        $(".IdentitumClientControl").removeClass("IdentitumClientControlEnroll");
        $(".IdentitumClientControl").addClass("IdentitumClientControlVerify");
        $(".EnrollForm").hide();
        $(".VerifyForm").show();
        transaction.server.captureVerify();
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
		//debugger;
        for (var i = 0; i < characteristics.length; i++) {
            $("#F" + characteristics[i].BiometricCharacteristicId).removeClass("FingerNotEnabled");
            $("#F" + characteristics[i].BiometricCharacteristicId).addClass("NoCaptured");
        }
    };

}
