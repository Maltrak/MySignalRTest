var origen = "http://128.100.200.107";
var allowedPorts = [60, 40];

//var urlService = "http://128.100.200.115/Identitum/TransactionService/TransactionService.svc";
var urlService = "http://128.100.200.115/Identitum/TransactionService/TransactionService.svc";
var idUser = '';
var idRol = '0';
var respuestaGlobal =
	{
	    success: false,
	    autenticado: '0',
	    tituloAlerta: '',
	    msjAlerta: '',
	    especial: false, /***************************/
	    gafete: ""
	};
var chat;
var gafete;
var idTransaction = '0';
var idT;

function autenticar() {
    console.log("autenticar");
    var idTransaction = '0', responseCode = -1, responseDescription = '', statusResponse = false, nfiqResponse = 0, huella = '';

    try {
        $.connection.hub.url = "http://localhost:8087/signalr";

        chat = $.connection.messageRecievingHub;

        chat.client.addCapture = function (status, nfiq, message, quality, image) {
            console.log('AddVerification');
            statusResponse = status;
            nfiqResponse = nfiq;
            console.log('idTransaction: ' + idTransaction);
            if (status) {
                huella = image;
                //waitingDialog.show('Esperando respuesta', { dialogSize: 'sm' });
                //waitingDialog.show('Esperando respuesta', {dialogSize: 'sm'});
                chat.server.sendVerification(idTransaction);

            } else {
                console.log(message);
                showAlert('Captura falló.', 'Desconecte y conecte el lector de nuevo e intentelo de nuevo');
                //showAlert('Captura falló.', message);
            }
        };
        chat.client.addSendVerification = function (code, description) {
            waitingDialog.hide();
            console.log('addSendVerification');
            responseCode = parseInt(code);
            responseDescription = description;
            $('#imgHuella').prop('src', 'data:image/png;base64,' + huella);
            /***************************/
            //valido si se tiene un evento especial de enrolamiento
            if (respuestaGlobal.especial) {
                console.log("Detecte Especial.");
                return NotifySpecialTx(idT, responseCode, responseDescription);
            }

            if (verifyReponse(responseCode, responseDescription)) {
                parent.postMessage({ mensaje: respuestaGlobal }, origen);
                console.log('Paso');
            }
        };

        chat.client.addInvoke = function (idTx, status, minFp) {
            console.log('Invoke');
            idTransaction = idTx;
            console.log('idTransaction recibida: ' + idTransaction);
            console.log('status recibido: ' + status);
            console.log('minFp recibido: ' + minFp);

            if (status) {
                var msg = "Capturando..."
                if (respuestaGlobal.especial)
                    msg = "Colocar dedo del supervisor para verificar...";

                waitingDialog.show(msg, { dialogSize: 'sm' });
                chat.server.capture(idTransaction);
            } else {
                showError('Invocación falló.', 'Intente de nuevo.');
            }
        }

        // Start the connection.
        $.connection.hub.start().done(function () {
            console.log('Iniciando');

            $('#continuarV').click(function () {
                idTransaction = '0', responseCode = -1, responseDescription = '', statusResponse = false, nfiqResponse = 0, huella = '';
                $('#circle').circleProgress({
                    value: 1,
                    size: 215,
                    startAngle: 1.6,
                    fill:
                        {
                            gradient: [['white', 0], ['white', 0]], gradientAngle: 1
                        }
                });
                idUser = $('#idVerify').val();
                /*idRol = $('#idVerify2').val();*/
                idTransaction = '';
                $('#imgHuella').prop('src', 'Imagenes/huella_blanco.png');
                console.log('Datos invocacion: ' + idUser + ' ' + idRol + ' ' + urlService);

                chat.server.invoke(idUser, idRol, urlService);

            });
        });
    } catch (ex) {

        console.log("Sin servicio");
        showError("No hay conexión.", "Revise el servicio.");
    }

}

$(document).ready(function () {

    /***************   COMUNIACION CON PAGINA CONTROLADORA      *********************/
    console.log("test");
    $('#continuarV').on("click", autenticar);

});

function fillCircle(autenticado) {

    if (autenticado) {
        color = 'green';
        $('#circle').circleProgress({
            value: 1,
            size: 215,
            startAngle: 1.6,
            fill:
                {
                    gradient: [['black', 0], [color, .9]], gradientAngle: .9
                }
        });
    } else {
        color = 'red';
        $('#circle').circleProgress({
            value: 1,
            size: 215,
            startAngle: 1.6,
            fill:
                {
                    gradient: [['black', 0], [color, .9]], gradientAngle: .9
                }
        });
    }
}

function verifyReponse(responseCode, responseDescription) {
    try {
        var res = false;
        switch (responseCode) {
            case 1:
                respuestaGlobal.success = true;
                respuestaGlobal.autenticado = '1';
                fillCircle(true);
                res = true;
                break;
            case 102:
                respuestaGlobal.success = true;
                showAlert('ALERTA', 'NO EXISTE EL USUARIO');
                fillCircle(false);
                break;
            case 104:
                respuestaGlobal.success = true;
                fillCircle(false);
                showAlert('ALERTA', 'NO ES EL USUARIO ');
                break;
            case 109:
                respuestaGlobal.success = true;
                fillCircle(false);
                showAlert('ALERTA:' + responseCode, '' + responseDescription);
                break;
            case 5000:
            case 600:
                showAlert('ALERTA', responseDescription.toUpperCase());
                fillCircle(false);
            default:
                showAlert('ALERTA:' + responseCode, 'DESCONOCIDO ' + responseDescription);
                fillCircle(false);
        }
        return res;
    } catch (err) {
        alert(err.message);
    }
}

function showAlert(titutlo, mensaje) {
    waitingDialog.hide();
    var dialog = bootbox.dialog({
        message: mensaje,
        title: titutlo,
    });
}

function showError(titulo, mensaje) {
    showAlert(titulo, mensaje);
    $('#contenedorPrincipal').replaceWith('');
    $('#errorContainer img').prop('hidden', false);
}


//Funcion para mostrar dialogo de confirmación de enroll especial ***************************
function AskForSpecialEnrollment() {

    console.log("Solicitando verificación especial");
    bootbox.confirm({
        message: "¿Estás seguro de solicitar UNA VERIFICACIÓN ESPECIAL?.",
        buttons: {
            'cancel': {
                label: 'NO',
                className: 'btn-danger pull-left'
            },
            'confirm': {
                label: 'SI',
                className: 'btn-success pull-right'
            }
        },
        callback: function (result) {
            if (result) {
                respuestaGlobal.especial = true;
                ShowSupervisorForm();
            }
        }
    });

}

//Funcion para solicitar el gafete del supervisor especial
function ShowSupervisorForm() {
    //bootbox.hideAll();
    var box = bootbox.dialog({
        message: "INGRESE EL GAFETE DEL SUPERVISOR: <br/><input type='text' id='gafeteVal' style='margin-left: 30%;'></input>",
        title: "VERIFICACIÓN ESPECIAL",
        backdrop: false,
        closeButton: false,
        buttons: {
            success: {
                label: "ACEPTAR ",
                className: "nuevoBOTON",
                callback: function () {
                    gafete = $('#gafeteVal').val();
                    respuestaGlobal.gafete = gafete;
                    VerifyCredentials(gafete);
                }
            }
        }
    });
}

function VerifyCredentials(gafete) {
    waitingDialog.show(void 0, void 0, 'Validando facultad del gafete ....');
    $.ajax({
        type: 'POST',
        async: false,
        url: './Main.aspx/VerifyCredential',
        data: '{gafete:"' + gafete + '"}',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (response) {
            waitingDialog.hide();
            Obj = response;
            var r = parseJSON(Obj.d);
            console.log("Respuesta succes-->" + r.facultad);
            if (r.facultad == "1") {
                idT = r.id;
                chat.server.invoke(r.id, 0, urlService);
            }
            else if (r.facultad == "0") {
                alert("Error El gafete ingresado no tiene la facultad para autorizar el trámite.");
                showAlert("Error", "El gafete ingresado no tiene la facultad para autorizar el trámite.");
            }
            else if (r.facultad == "") {
                showAlert("Error", "El gafete ingresado no se encuentra registrado.");
            }
            else {
                showAlert("Error Desconocido", r.facultad);
            }


        },
        /* failure: function (response) {
            console.log("Regreso");
           Obj = response;
            var r = parseJSON(Obj.d);
            console.log("Respuesta fail-->");
            showAlert("FALLO EN ENVIO DE FOTO Y FIRMA:","FALLO");
        } */
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
        }
    });
}

function NotifySpecialTx(gafete, responseCode, responseDescription) {
    //waitingDialog.show(void 0, void 0, 'Registrando ....');
    $.ajax({
        type: 'POST',
        async: false,
        url: './Main.aspx/RegisterSpecialTx',
        data: '{credere:"' + $('#idVerify').val() + '",gafete:"' + gafete + '",action:"Verificación",resultCode:"' + responseCode + '" }',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (response) {
            waitingDialog.hide();
            Obj = response;
            var r = parseJSON(Obj.d);
            console.log("Respuesta succes-->" + r.val);
            if (r.val == "1") {
                if (verifyReponse(responseCode, responseDescription)) {
                    parent.postMessage({ mensaje: respuestaGlobal }, origen);
                    console.log('Paso');
                }
            }
            else if (r.val == "0") {
                showAlert("Error", "No se logro terminar el proceso de verificación...");
            }
            else {
                showAlert("Error", r.val);
            }


        },
        /* failure: function (response) {
            console.log("Regreso");
           Obj = response;
            var r = parseJSON(Obj.d);
            console.log("Respuesta fail-->");
            showAlert("FALLO EN ENVIO DE FOTO Y FIRMA:","FALLO");
        } */
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
        }
    });
}

function parseJSON(data) {
    return window.JSON && window.JSON.parse ? window.JSON.parse(data) : (new Function("return " + data))();
}