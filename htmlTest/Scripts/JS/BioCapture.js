var urlService = "http://192.168.0.156:3990/POC-HSBC/TransactionService/TransactionService.svc";
var hubUrl = "http://localhost:8087/signalr";
var idnttmHub;
var minimumFingerprintsRequired;
var idTransaction;
var isOk;
var cic;
var posToIne;
var uID;
var fingersActive = [2, 3, 4, 5, 7, 8, 9, 10, 1, 6];
var fingersDeactive = [];
var absencesJson = [];
var fingersCaptured = [];
var fingersCaptureAttempts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];



$(document).ready(function () {

    $('#masterIconoBio').attr('src', 'Imagenes/Enrolamiento.png');
    $('#masterProgreso').attr('src', 'Imagenes/Progress Bar 25.png');

    $('#iVerificarHuella').addClass('verificarHuellaHover');

    $('#iGuardar').on({
        'mouseenter': function () {
            if (true) {
                $(this).addClass('guardarHover');
            }
        },
        'mouseleave': function () {
            $(this).removeClass('guardarHover');
        }
    });

    if ($("#PersonID").val() != "") {
        uID = $("#PersonID").val();
        console.log("ID" + uID);
    }

    if ($("#ocr").val() != "") {
        cic = $("#ocr").val();
        console.log("cic" + cic);
    }

    $("#save").prop('disabled', true); //modificación

    invocar();


    
});

function invocar() {
    waitingDialog.show(void 0, void 0, "Cargando...");
    $.connection.hub.url = hubUrl;
    idnttmHub = $.connection.messageRecievingHub;

    if (idnttmHub == undefined) {
        waitingDialog.hide();
        showAlert("ALERTA", "RECARGAR LA PÁGINA CUANDO EL SERVICIO DE ENROLAMIENTO HAYA INICIADO");
        //bootbox_alert("RECARGAR LA PÁGINA CUANDO EL SERVICIO HAYA INICIADO");
        $(".hands-panel").hide();
        return;
    }

    //idnttmHub.server.invoke("130792", "1", urlService);
    /*CapturaHuella*/
    idnttmHub.client.addInvoke = function (it, res, req) {


        isOk = res;
        idTransaction = it;
        minimumFingerprintsRequired = req;

        console.log("Inovcación.");
        console.log("Status: " + isOk);
        console.log("IdTransaction: " + idTransaction);
        console.log("minimo huellas: " + minimumFingerprintsRequired);


        if (isOk) {
            configureViewOptions(minimumFingerprintsRequired);
            if (10 - minimumFingerprintsRequired == 0) {
                removeAllAddAbsenceMenu();
            } else {
                addAllAddAbsenceMenu();
                addAllToIneMenu();
            }

            addAllCaptureEvents();
            //addSaveEvent();

            if ($("#JsonPerson").val() != "") {
                idnttmHub.server.setDatos(idTransaction, $("#JsonPerson").val());
                //set crop
            }
        } else {

            //bootbox_alert("HUBO UN ERROR DURANTE LA INVOCACIÓN, CONTACTE AL ADMINISTRADOR DEL SISTEMA.");
            showAlert("ALERTA", "HUBO UN ERROR DURANTE LA INVOCACIÓN, CONTACTE AL ADMINISTRADOR DEL SISTEMA.");

        }
    };

    idnttmHub.client.addsetCropIne = function (res, msg) {
        console.log("addsetCropIne" + res);
        if (res) {
            console.log(msg);
            $('#imgCropINE').attr("src", "data:image/png;base64," + $("#cropINE").val());
        } else {
            showAlert("ALERTA", "<h3>" + msj + "</h3> ");
        }

    };

    /*foto*/
    idnttmHub.client.addPhoto = function (res, mensaje) {
        if (!res)
            showAlert("<h3>ALERTA</h3>", mensaje);
        else {
            waitingDialog.hide();
            $('#verificar').css('pointer-events', 'all');
            showAlert("<h3>EXITO</h3>", "AHORA PUEDES VERIFICAR LAS FOTOS.");
        }
    };

    idnttmHub.client.addvalidatePhoto = function (res, mensaje, img) {
        console.log("addvalidatePhoto" + res);
        if (!res)
        {
            waitingDialog.hide();
            showAlert("<h3>ALERTA</h3>",  mensaje);
        } 
        else {
            setICAO(img)
        }
    };

    idnttmHub.client.addCapture = function (sta, nfiq, msj, qua, img) {
        resultsFlags = sta;
        resultsNFIQ = nfiq;
        console.log(resultsFlags);
        console.log(resultsNFIQ);

        var wait = false;
        var showImage = false;

        for (var i = 0 ; i < resultsFlags.length ; i++) {
            showImage = showImage || resultsFlags[i];
        }

        if (showImage) {

            $('#fp-image').html('<img src="data:image/png;base64,' + img + '" style="padding:1px;border:1px solid #000;" width="180px" />');
            $('#fp-image').css('visibility', 'visible');
        }

        for (var i = 0 ; i < resultsFlags.length ; i++) {

            if (resultsFlags[i]) {
                fingersCaptured.push(fingersToCapture[i]);//agregamos la posicion capturada correctamente
                fingersActive.splice(fingersActive.indexOf(fingersToCapture[i]), 1);//lo eliminamos de las posiciones disponibles

                $(".f" + fingersToCapture[i]).unbind("click");
                $(".f" + fingersToCapture[i]).css('cursor', 'default');
                //$(".f" + fingersToCapture[i]).attr('class', 'f' + fingersToCapture[i] + ' nfiq' + resultsNFIQ[i]);

                /**cambio L&F**/
                $(".f" + fingersToCapture[i]).unbind("mouseover");
                $(".f" + fingersToCapture[i]).unbind("mouseout");
                $("#pulseInstruction").text("");
                /**/

                $(".f" + fingersToCapture[i] + "-menu").unbind("click");
                $(".f" + fingersToCapture[i] + "-menu").attr('class', '');
                $(".f" + fingersToCapture[i]).removeClass("pulse");

                //var backColor = getRGBbyNFIQ(resultsNFIQ[i]);//se obtiene la gama de color de acuerdo al nfiq obtenido
                $(".f" + fingersToCapture[i]).css("background-color", "#95C959");
                console.log("correct:" + fingersToCapture[i]);
                //se verifica que posición se captuó para deshabilitar el tachado de esa mano, es decir con algun dedo que se capture de esos se deshabilita la opción
                if (fingersToCapture[i] >= 1 && fingersToCapture[i] <= 5)
                    disableRHBtn();
                if (fingersToCapture[i] >= 6 && fingersToCapture[i] <= 10)
                    disableLHBtn();

                /*if( fingersCaptured.length == minimumFingerprintsRequired ){
                    removeAllAddAbsenceMenu();
                    removeAllCaptureEvents();
                }*/
            } else {
                //showAlert("ALERTA", "<h3>" + getDescription(fingersToCapture[i]) + "</h3> " + msj[i]);
                fingersCaptureAttempts[fingersToCapture[i] - 1] += 1;
                if (fingersCaptureAttempts[fingersToCapture[i] - 1] == 3) {

                    var fingerWithBadQuality = fingersToCapture[i];

                    bootbox.dialog({
                        title: "Definición automática de ausencia para " + getDescription(fingerWithBadQuality) + ".",
                        message:
                            '<div class="container-fluid">' +
                                '<div class="row"> ' +
                                    '<div class="col-md-12" style="float:none; margin: 0 auto;"> ' +
                                        '<form id="f' + fingerWithBadQuality + '-menu-formAbsence" class="form-horizontal"> ' +
                                            '<div class="form-group"> ' +
                                                '<label class="col-md-4 control-label" for="absenceType">Tipo</label> ' +
                                                '<div class="col-md-6"> ' +
                                                    '<select id="absenceType" name="absenceType" data-native-menu="false" disabled="disabled" class="form-control input-md">' +
                                                    '	<option value="BAD_QUALITY">Mala calidad</option>' +
                                                    '</select>' +

                                                '</div> ' +
                                                '<label class="col-md-4 control-label" for="absenceCause">Motivo</label> ' +
                                                '<div class="col-md-6"> ' +
                                                    '<input type="text" name="absenceCause" data-native-menu="false" class="form-control input-md" value="No cumple con la calidad requerida." disabled="disabled">' +
                                                '</div> ' +
                                            '</div> ' +
                                        '</form>' +
                                    '</div>' +
                                '</div>' +
                            '</div>',
                        buttons: {
                            success: {
                                label: "Aceptar",
                                className: "btn btn-info"
                            }
                        }
                    });


                    absence = {};
                    absence["idPosition"] = "" + fingerWithBadQuality;
                    absence["PositionDescripcion"] = getDescription(fingerWithBadQuality);
                    absence["Motivo"] = 'No cumple con la calidad requerida.';
                    absencesJson.push(absence);
                    enableNextFingerOption(fingersToCapture[i]);
                    console.log(JSON.stringify(absencesJson));
                    //$(".f" + fingerWithBadQuality).attr('class', 'f' + fingerWithBadQuality + ' absence');
                    //$(".f" + fingerWithBadQuality).css('cursor', 'default');
                    //$(".f" + fingerWithBadQuality + "-menu").attr('class', '');
                    //$(".f" + fingerWithBadQuality).unbind("click");
                    if (absencesJson.length > minimumFingerprintsRequired) {
                        waitingDialog.hide();
                        //bootbox.hideAll();
                        //bootbox_alert("EL ENROLAMIENTO NO PUEDE LLEVARSE A ACABO.");
                        showAlert("ALERTA", "EL ENROLAMIENTO NO PUEDE LLEVARSE A ACABO.");
                        $(".hands-panel").hide();
                        return;
                    }

                } else
                    if (msj[i] != undefined)
                        showAlert("ALERTA", "<h3>" + msj[i] + " Intento:" + fingersCaptureAttempts[fingersToCapture[i] - 1] + " de 3 para :" + getDescription(fingersToCapture[i]) + "</h3> ");
            }
        }
        setNextPosibleSelection();//agregamos efecto de pulsasión
        //if( fingersCaptured.length + absencesJson.length >= minimumFingerprintsRequired ){
        //if (fingersCaptured.length  >= minimumFingerprintsRequired) {
        if (fingersCaptured.length + absencesJson.length == 10) {

            setToIneEnable();
            $("#pulseInstruction").text("Haz click en una huella para enviar al INE.");
        }

        waitingDialog.hide();

    };

    idnttmHub.client.addcaptureIndex = function (res, ansi, wsq, msg) {
        waitingDialog.hide();
        console.log(res);
        if (res) {
            verifyAtINE(ansi, wsq);
        } else {
            if(msj[i] != undefined)
            showAlert("ALERTA", "<h3>" + msj[i] + "</h3> ");
        }

    };

    
    idnttmHub.client.addverifyFaces = function (res, msg) {
        console.log("addverifyFaces" + res);

        $("#iGuardar").on("click", function () {
            window.location.href = "Scanning.aspx";
        });

        if (res) {
            showAlert("<h3>RESULTADO</h3>", "SIMILITUD:" + msg);
        } else {
            showAlert("<h3>ALERTA</h3>", msg );
        }

    };
    idnttmHub.client.addsetDatos = function (res, msg) {
        console.log("addsetDatos"+res);
        if (res) {
            console.log(msg);
            //se setea la imagen recortada de la foto del ine
            if ($("#cropINE").val() != "") {
                idnttmHub.server.setCropIne(idTransaction, $("#cropINE").val());
            }
        } else {
            showAlert("ALERTA", "<h3>" + msj + "</h3> ");
        }

    };

    idnttmHub.client.addEnrollment = function (code, descrip) {
        console.log("code: " + code);
        console.log("desc: " + descrip);

        waitingDialog.hide();
        checkEnrollResponse(code, descrip);
    };

    /*Hub start*/
    $.connection.hub.start().done(function () {
        idnttmHub.server.invoke(uID, "1", urlService);

        
    });

    
    waitingDialog.hide();
}


function checkEnrollResponse(responseCode, responseMessage) {
    console.log("recibido");

    switch (responseCode) {
        case 1:
            $(".handsContainer").css("display", "none");
            $('#iPhoto').addClass('capturarFotoHover');
            $(".cameraContainer").css("display", "block");
            showFlashingAlert("EXITO", responseMessage);
            AskForCamera();
            break;
        case 5000:
        case 600:
            webcamhide();
            showAlert("ERROR", responseMessage.toUpperCase());
            break;
        case 601:
            webcamhide();
            showAlert("CAPTURA DE HUELLAS INTERRUMPIDA", "NO SE PODRA CONTINUAR SIN CAPTURAR HUELLAS ");
            break;
        case 608:
            webcamhide();
            showAlert("ERROR EN LICENCIAS", "NO SE ENCONTRARON LICENCIAS NECESARIAS ");
            break;
        case 105:
        case 602:
            webcamhide();
            showAlert("ALERTA", responseMessage);
            break;
        default:
            webcamhide();
            showAlert("ERROR:" + responseCode, "DESCONOCIDO " + responseMessage);
    }
}
/*************           FUNCIONES DE ALERTAS       ******************/
function showAlert(titutlo, mensaje) {
    var dialog = bootbox.dialog({
        message: mensaje,
        title: titutlo,
        onEscape: function () {
            //if (callback)
            //    callback();
        }, callback: function () {
            if ($("#foto").css("display") != "block") {
                $("#foto").css("display", "none");
                $("#webcam").css("display", "block");
                $("#webcam").css("margin-left", "15.5%");
            }


        },
        backdrop: true,
        closeButton: false,
        className: "default",
        buttons: {
            cancel: {
                label: "CERRAR",
                className: "btn-info",
                callback: function () {
                    if ($("#foto").css("display") != "block") {
                        $("#foto").css("display", "none");
                        $("#webcam").css("display", "block");
                        $("#webcam").css("margin-left", "15.5%");
                    }
                }
            }
        }
    });
}
//var imagenCatcha = "";
function showAlert2(titutlo, mensaje, cerrar) {
    if (cerrar > 0) {
        bootbox.hideAll();
    }
    var dialog = bootbox.dialog({
        message: mensaje,
        title: titutlo,
        onEscape: function () {
            //if (callback)
            //    callback();
        },
        close: function () {
            alert("cerrado");
        },
        backdrop: true,
        closeButton: false,
        className: "default",
    });
}

function showFlashingAlert(titulo, mensaje) {
    var dialog = bootbox.dialog({
        message: mensaje,
        title: titulo,
        onEscape: function () {
            //if (callback)
            //    callback();
        },
        backdrop: true,
        closeButton: false,
        className: "default",
        buttons: {
            cancel: {
                label: "CERRAR",
                className: "btn-default	nuevoBOTON",
                callback: function () {
                    //if (callback)
                    //    callback();
                    dialog.modal('hide');
                }
            }
        }

    });
    setTimeout(function () { dialog.modal('hide'); }, 3000);

}

function verifyAtINE(ansi, wsq,position) {
    console.log("verificando en ine")
    console.log("ansi:" + ansi);
    console.log("wsq:" + wsq);

    waitingDialog.show(void 0, void 0, "Verificando huella en INE...");

    $.ajax({
        type: 'POST',
        async: false,
        url: './BiometricForm.aspx/VerifyAtINE',
        data: '{ocr:"' + cic + '",huella:"' + wsq + '",position:"' + posToIne + '"}',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (response) {
            waitingDialog.hide();
            Obj = response;
            var r = parseJSON(Obj.d);
            console.log("Respuesta succes-->" + r.res);
            if (r.res)
            {
                showAlert("Respuesta", r.val);
            } else {
                showAlert("Error Desconocido", r.val);
            }
            $("#save").css('cursor', 'pointer'); // modificación.
            $('#save').removeClass("save-disabled");
            $('#save').addClass("save-enabled");
            $('#save').prop('disabled', false);
            addSaveEvent();
            //Modificación
            $("#pulseInstruction").text("Haz click en GUARDAR para continuar.");

        },
        error: function (xhr, ajaxOptions, thrownError) {
            waitingDialog.hide();
            console.log(thrownError);
            showAlert("Error:" + thrownError);

            //mover cuando este en vpn
           // $("#save").css('cursor', 'pointer');
            //$('#save').removeClass("save-disabled");
            //$('#save').addClass("save-enabled");
        }
    });
}

function parseJSON(data) {
    return window.JSON && window.JSON.parse ? window.JSON.parse(data) : (new Function("return " + data))();
}

function removeAllAddAbsenceMenu() {
    for (var i = 1 ; i <= 10 ; i++) {
        $(".f" + i + "-menu").attr('class', '');
    }
}

function addAllAddAbsenceMenu() {
    for (var i = 1 ; i <= 10 ; i++) {
        $(".f" + i + "-menu").click({ finger: i }, addAbsenceMenu);
    }
}

function addAllToIneMenu() {
    for (var i = 1 ; i <= 10 ; i++) {
        $(".f" + i + "-ine").click({ finger: i }, sendToIne);
    }
}

function sendToIne(event) {
    posToIne = event.data.finger;
    idnttmHub.server.getAnsiWSQ(idTransaction, posToIne);
}

function getDescription(finger) {
    switch (finger) {
        case 1:
            return "Pulgar Derecho";
        case 2:
            return "Índice Derecho";
        case 3:
            return "Medio Derecho";
        case 4:
            return "Anular Derecho";
        case 5:
            return "Meñique Derecho";
        case 6:
            return "Pulgar Izquierdo";
        case 7:
            return "Índice Izquierdo";
        case 8:
            return "Medio Izquierdo";
        case 9:
            return "Anular Izquierdo";
        case 10:
            return "Meñique Izquierdo";
        case 61:
            return "Pulgares";
        case 23:
            return "Índice y Medio Derechos";
        case 87:
            return "Índice y Medio Izquierdos";
        default:
            return "Unknown";
    }
}

function addAbsenceMenu(event) {
    bootbox.dialog({
        title: "Definir ausencia para " + getDescription(event.data.finger) + ".",
        message:
            '<div class="container-fluid">' +
                '<div class="row"> ' +
                    '<div class="col-md-12" style="float:none; margin: 0 auto;"> ' +
                        '<form id="f' + event.data.finger + '-menu-formAbsence" class="form-horizontal"> ' +
                            '<div class="form-group"> ' +
                                '<label class="col-md-4 control-label" for="absenceType">Tipo</label> ' +
                                '<div class="col-md-6"> ' +
                                    '<select id="absenceType" name="absenceType" data-native-menu="false"  class="form-control input-md">' +
                                    '	<option value="">Tipo de ausencia</option>' +
                                    '	<option value="LESIONADO">Lesionado</option>' +
                                    '	<option value="AMPUTADO">Amputado</option>' +
                                    '</select>' +
                                '</div> ' +
                                '<label class="col-md-4 control-label" for="absenceCause">Motivo</label> ' +
                                '<div class="col-md-6"> ' +
                                    '<input type="text" name="absenceCause" data-native-menu="false" class="form-control input-md">' +
                                '</div> ' +
                            '</div> ' +
                        '</form>' +
                    '</div>' +
                '</div>' +
            '</div>',
        buttons: {
            success: {
                label: "Aceptar",
                className: 'btn-success pull-right',
                callback: function () {

                    var absenceCause = $('#f' + event.data.finger + '-menu-formAbsence input[name=absenceCause]').val(); //motivo de la ausencia
                    var absenceType = $('#f' + event.data.finger + '-menu-formAbsence select[name=absenceType]').val(); //tipo de ausencia

                    if (!$.isEmptyObject(absenceType)) {
                        bootbox.confirm({
                            message: "¿Estas seguro que el " + getDescription(event.data.finger).toUpperCase() + " está " + absenceType.toUpperCase() + "?, no se podrá revertir el cambio.",
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

                                    var motivoDesc = $.isEmptyObject(absenceCause) ? ",sin motivo." : "," + absenceCause + ".";
                                    absence = {};
                                    absence["idPosition"] = "" + event.data.finger;
                                    absence["PositionDescripcion"] = getDescription(event.data.finger);
                                    absence["Motivo"] = absenceType + motivoDesc;
                                    absencesJson.push(absence);
                                    enableNextFingerOption(event.data.finger);
                                    setNextPosibleSelection();
                                    console.log(JSON.stringify(absencesJson));
                                    //$(".f"+event.data.finger).attr('class','f'+event.data.finger+' absence');
                                    //$(".f"+event.data.finger).css('cursor','default');
                                    //$(".f"+event.data.finger+"-menu").attr('class','');
                                    //$(".f"+event.data.finger).unbind("click");
                                    if (absencesJson.length == 10 - minimumFingerprintsRequired) {
                                        removeAllAddAbsenceMenu();
                                        setToIneEnable();
                                        $("#pulseInstruction").text("Haz click en una huella para enviar al INE.");
                                    }
                                }
                                else {
                                    addAbsenceMenu(event);
                                }
                            }
                        });
                    } else
                        bootbox.dialog({
                            message: "<h3>ALERTA!!</h3> No seleccionaste ningún tipo de ausencia.",
                            buttons: {
                                main: {
                                    label: "OK",
                                    className: "btn-info"
                                }
                            },
                            callback: function () {
                                addAbsenceMenu(event);
                            }
                        });


                }
            },
            cancel: {
                label: "Cancelar",
                className: 'btn-danger pull-left',
                callback: function () {
                    bootbox.hideAll();
                }
            }
        }
    });

    //if( fingersCaptured.length + absencesJson.length >= minimumFingerprintsRequired ){


}

function fingerToCapture(finger) {
    var fingers = [];

    if (finger == 1 || finger == 6) {
        if (isAbsenceDefined(1) || isFingerCaptured(1)) {
            fingers[0] = 6;
        } else if (isAbsenceDefined(6) || isFingerCaptured(6)) {
            fingers[0] = 1;
        } else {
            fingers[0] = 6;
            fingers[1] = 1;
        }
        return fingers;
    }
    if (finger == 2 || finger == 3) {
        if (isAbsenceDefined(2) || isFingerCaptured(2)) {
            fingers[0] = 3;
        } else if (isAbsenceDefined(3) || isFingerCaptured(3)) {
            fingers[0] = 2;
        } else {
            fingers[0] = 2;
            fingers[1] = 3;
        }
        return fingers;
    }
    if (finger == 7 || finger == 8) {
        if (isAbsenceDefined(7) || isFingerCaptured(7)) {
            fingers[0] = 8;
        } else if (isAbsenceDefined(8) || isFingerCaptured(8)) {
            fingers[0] = 7;
        } else {
            fingers[0] = 8;
            fingers[1] = 7;
        }
        return fingers;
    }

    fingers[0] = finger;
    return fingers;
}

function isAbsenceDefined(finger) {
    for (var i = 0 ; i < absencesJson.length ; i++) {
        if (absencesJson[i].idPosition == finger) {
            return true;
        }
    }
    return false;
}

function isFingerCaptured(finger) {
    for (var i = 0 ; i < fingersCaptured.length ; i++) {
        if (fingersCaptured[i] == finger) {
            return true;
        }
    }
    return false;
}

function captureFingerprints(event) {

    $('#fp-image').css('visibility', 'hidden');

    fingersToCapture = fingerToCapture(event.data.finger);
    console.log("Capturando: " + fingersToCapture);

    waitingDialog.show(fingersToCapture, fingersCaptureAttempts[fingersToCapture[0] - 1] + 1);

    try {
        //idnttmHub.server.captureIndex(idTransaction);
        idnttmHub.server.capture(idTransaction, fingersToCapture);
    } catch (err) {
        waitingDialog.hide();
        showAlert("NO SE PUEDE CAPTURAR", "RECARGAR LA PÁGINA CUANDO EL SERVICIO HAYA INICIADO");
        //bootbox_alert("RECARGAR LA PÁGINA CUANDO EL SERVICIO HAYA INICIADO");
        $(".hands-panel").hide();
        return;
    }

}

//DESHABILITA LOS TACHES PARA LAS MANOS COMPLETAS
function disableLHBtn() {
    $("#LH").css("opacity", ".5");
    $("#LH").css("pointer-events", "none");
    $("#LH").unbind();
}

function disableRHBtn() {
    $("#RH").css("opacity", ".5");
    $("#RH").css("pointer-events", "none");
    $("#RH").unbind();
}

//deshabilita todas las operaciones de una mano recibida por parametro
function removeHandOptions(event) {

    var selectedHand = event.data.hand == "RH" ? "DERECHA" : "IZQUIERDA";
    console.log("Eliminando mano: " + selectedHand);
    bootbox.confirm({
        message: "¿Estás seguro de DESHABILITAR LA MANO " + selectedHand + "?, no se podrá revertir el cambio.",
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
                if (event.data.hand == "RH")//mano derecha
                {
                    $(".rightHand").css("opacity", ".5");//aparencia de deshabilitada

                    for (var id = 1 ; id <= 5 ; id++) {
                        deactivateALLFingerEvents(id);
                        activateFingerEvent(id + 5);
                        addAbsenceToJson(id);
                    }
                    if (minimumFingerprintsRequired >= 5)//si el minimo de huellas a capturar  es mayor o igual a el restante de dedos (5) se deshabilitan las ausencias
                        deactivateAllAbsences();
                } else if (event.data.hand == "LH")//mano izquierda
                {
                    $(".leftHand").css("opacity", ".5");//aparencia de deshabilitada

                    for (var id = 6 ; id <= 10 ; id++) {
                        deactivateALLFingerEvents(id);
                        activateFingerEvent(id - 5);
                        addAbsenceToJson(id);
                    }
                    if (minimumFingerprintsRequired >= 5)//si el minimo de huellas a capturar  es mayor o igual a el restante de dedos (5) se deshabilitan las ausencias
                        deactivateAllAbsences();
                }
                else {
                    bootbox.hideAll();
                    bootbox_alert("MANO INVALIDA");
                }

                //iteramos el arreglo de ausencias para dejar unicamente los que no tengan ausencias registradas
                var auxF = [];
                for (var id = 1 ; id <= 10 ; id++) {
                    if (!isAbsenceDefined(id))
                        auxF.push(id);
                    else
                        fingersActive.splice(fingersActive.indexOf(id), 1);
                }

                for (var pos = 0 ; pos < auxF.length ; pos++) {
                    if (fingersActive.indexOf(auxF[pos]) == -1)
                        fingersActive.push(auxF[pos]);
                }

                //deshabilitamos las opciones de tachado de manos
                disableRHBtn();
                disableLHBtn();
                setNextPosibleSelection();
            }
        }
    });

}

//agrega una ausencia en forma de json al arreglo
function addAbsenceToJson(id) {
    console.log("Ading absnce:" + id);
    absence = {};
    absence["idPosition"] = "" + id;
    absence["PositionDescripcion"] = getDescription(id);
    absence["Motivo"] = "Sin mano";
    absencesJson.push(absence);
}

function addAllCaptureEvents() {
    for (var i = 1 ; i <= 10 ; i++) {
        $(".f" + i).click({ finger: i }, captureFingerprints);
    }
    $("#LH").click({ hand: "LH" }, removeHandOptions);
    $("#RH").click({ hand: "RH" }, removeHandOptions);
}

function removeAllCaptureEvents() {
    for (var i = 1 ; i <= 10 ; i++) {
        if (!isFingerCaptured(i)) {
            $(".f" + i).attr('class', '');
        }
    }
}

function addSaveEvent() {
    $("#save").click(sendEnrollment);
}

function sendEnrollment() {

    if (fingersCaptured.length >= minimumFingerprintsRequired) {

        //if( minimumFingerprintsRequired >= fingersCaptured.length ){

        waitingDialog.show(void 0, void 0, "Enviando información.");

        try {
            idnttmHub.server.sendEnrollment(idTransaction, JSON.stringify(absencesJson));
        } catch (err) {
            waitingDialog.hide();
            //showAlert("NO SE PUEDE CAPTURAR", "RECARGAR LA PÁGINA CUANDO EL SERVICIO HAYA INICIADO");
            showAlert("ALERTA", "RECARGAR LA PÁGINA CUANDO EL SERVICIO HAYA INICIADO");
            $(".hands-panel").hide();
            return;
        }
        //}

    } else {
        if (minimumFingerprintsRequired < 10) {
            showAlert("ALERTA", "TERMINE DE CAPTURAR O INDIQUE AUSENCIAS.");
            //bootbox_alert("TERMINE DE CAPTURAR O INDIQUE AUSENCIAS.");
        } else {
            showAlert("ALERTA", "TERMINE DE CAPTURAR.");
            //bootbox_alert("TERMINE DE CAPTURAR.");
        }
    }

}

//desactiva todos los menus de ausencias
function deactivateAllAbsences() {
    for (var id = 1 ; id <= 10 ; id++) {
        $(".f" + id + "-menu").removeClass("absence");
        $(".f" + id + "-menu").addClass("absence-disable");
    }
}

//funcion que desactiva las operaciónes de una posicion en especifico
function deactivateALLFingerEvents(id) {
    //desactivamos la opción con su respectivo menu
    $(".f" + id).removeClass("no-captured");
    $(".f" + id).addClass("no-captured-disable");
    $(".f" + id + "-menu").removeClass("absence");
    $(".f" + id + "-menu").addClass("absence-disable");
    $(".f" + id).unbind("mouseover mouseout");

}

//funcion que desactiva el menu de ausencia de una posicion en especifico
function deactivateFingerAbsence(id) {
    //desactivamos la opción con su respectivo menu
    $(".f" + id + "-menu").removeClass("absence");
    $(".f" + id + "-menu").addClass("absence-disable");
}

//funcion que activa las operaciónes de una posicion en especifico
function activateALLFingerEvents(id) {
    //desactivamos la opción con su respectivo menu
    $(".f" + id).removeClass("no-captured-disable");
    $(".f" + id).addClass("no-captured");
    $(".f" + id + "-menu").removeClass("absence-disable");
    $(".f" + id + "-menu").addClass("absence");
}

//funcion que activa las operaciónes de una posicion en especifico
function activateFingerEvent(id) {
    $(".f" + id).removeClass("no-captured-disable");
    $(".f" + id).addClass("no-captured");
}
//funcion que activa las operaciónes de una posicion en especifico
function activateFingerAbsence(id) {
    //desactivamos la opción con su respectivo menu
    $(".f" + id + "-menu").removeClass("absence-disable");
    $(".f" + id + "-menu").addClass("absence");
}

//funcion que habilita o deshabilita opciones dependiendo el rol en el que se enrolara
function configureViewOptions(minFingers) {
    if (minimumFingerprintsRequired < 10) {

        for (var i = 0 ; i < fingersDeactive.length  ; i++) {

            var fingerID = fingersDeactive[i];

            //desactivamos la opción con su respectivo menu
            $(".f" + fingerID).removeClass("no-captured");
            $(".f" + fingerID).addClass("no-captured-disable");
            $(".f" + fingerID + "-menu").removeClass("absence");
            $(".f" + fingerID + "-menu").addClass("absence-disable");
        }
    }
    else {
        fingersActive = fingersActive.concat(fingersDeactive);
        fingersDeactive = [];
        disableLHBtn(); $("#LH").css("display", "none");
        disableRHBtn(); $("#RH").css("display", "none");
    }
}
//activa una posición posible despues de eliminar alguna posible que se recibe como argumento
function enableNextFingerOption(id) {
    console.log("recibi: " + id);
    var nextIndex = getNextFingerIndex(id);
    deactivateALLFingerEvents(id);
    activateALLFingerEvents(nextIndex);
}

//funcion que obtiene un elemento de los inactivos para volverlo activo y mete al arreglo de inactivos la ausencia marcada
function getNextFingerIndex(id) {


    var nextActive;
    if (fingersDeactive.length > 0)
        nextActive = fingersDeactive[0];
    else
        return null;

    //elimina de los activos el id recibido
    console.log("eliminando: " + id);
    fingersActive.splice(fingersActive.indexOf(id), 1);
    //agrega el inactivo obtenido
    console.log("agregando..: " + nextActive);
    fingersActive.push(nextActive);

    fingersDeactive.splice(fingersDeactive.indexOf(nextActive), 1);
    console.log("quitando: " + nextActive);

    return nextActive;

}

//funcion que quita el efecto de pulsasión del dedo ya capturado y lo coloca en la siguiente opcion
function setNextPosibleSelection() {

    for (var x = 0 ; x < fingersActive.length ; x++) {

        var finger = fingersActive[x];
        console.log("next:" + finger);
        if (finger == 1 || finger == 6) {
            if (!isAbsenceDefined(1) && !isFingerCaptured(1)) {
                $(".f" + 1).removeClass("no-captured");
                $(".f" + 1).addClass("pulse no-captured-turn");
            }

            if (!isAbsenceDefined(6) && !isFingerCaptured(6)) {
                $(".f" + 6).removeClass("no-captured");
                $(".f" + 6).addClass("pulse no-captured-turn");
            }

            return;
        }
        if (finger == 2 || finger == 3) {
            if (!isAbsenceDefined(2) && !isFingerCaptured(2)) {
                $(".f" + 2).removeClass("no-captured");
                $(".f" + 2).addClass("pulse no-captured-turn");
            }

            if (!isAbsenceDefined(3) && !isFingerCaptured(3)) {
                $(".f" + 3).removeClass("no-captured");
                $(".f" + 3).addClass("pulse no-captured-turn");
            }

            return;
        }
        if (finger == 7 || finger == 8) {
            if (!isAbsenceDefined(7) && !isFingerCaptured(7)) {
                $(".f" + 7).removeClass("no-captured");
                $(".f" + 7).addClass("pulse no-captured-turn");
            }

            if (!isAbsenceDefined(8) && !isFingerCaptured(8)) {
                $(".f" + 8).removeClass("no-captured");
                $(".f" + 8).addClass("pulse no-captured-turn");
            }

            return;
        }

        if (!isAbsenceDefined(finger) && !isFingerCaptured(finger)) {
            $(".f" + finger).removeClass("no-captured");
            $(".f" + finger).addClass("pulse no-captured-turn");
            return;
        }

    }



}

function setToIneEnable()
{
    for (var x = 0 ; x < fingersCaptured.length ; x++) {
        var finger = fingersCaptured[x];
        $(".f" + finger + "-ine").fadeIn();
    }
}

function getAnsiWSQ(selectedPosition)
{
    idnttmHub.server.invoke(uID, "1", urlService);

}



