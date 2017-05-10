var urlService = "http://192.168.0.156:3990/POC-HSBC/TransactionService/TransactionService.svc";
var hubUrl = "http://localhost:8087/signalr";
var idnttmHub;
var minimumFingerprintsRequired;
var idTransaction;
var isOk;

var uID;

var ButtonEventsState = {
    ACTIVE: 1,
    DEACTIVE: 2,
};

var padOpenState = ButtonEventsState.ACTIVE;
var padCleanState = ButtonEventsState.DEACTIVE;
var padCloseState = ButtonEventsState.DEACTIVE;


$(document).ready(function () {

    $('#masterIconoBio').attr('src', 'Imagenes/Enrolamiento.png');
    $('#masterIconoDigitalizacion').attr('src', 'Imagenes/Digitalización.png');
    $('#masterIconoFirma').attr('src', 'Imagenes/Firma Contrato.png');
    $('#masterProgreso').attr('src', 'Imagenes/Progress Bar 75.png');

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
    /*CapturaFirma*/
    idnttmHub.client.addInvoke = function (it, res, req) {


        isOk = res;
        idTransaction = it;
        

        console.log("Inovcación.");
        console.log("Status: " + isOk);
        console.log("IdTransaction: " + idTransaction);
        


        if (isOk) {
           
        } else {

            //bootbox_alert("HUBO UN ERROR DURANTE LA INVOCACIÓN, CONTACTE AL ADMINISTRADOR DEL SISTEMA.");
            showAlert("ALERTA", "HUBO UN ERROR DURANTE LA INVOCACIÓN, CONTACTE AL ADMINISTRADOR DEL SISTEMA.");

        }
    };

   

    idnttmHub.client.addvalidatePhoto = function (res, mensaje, img) {
        console.log("addvalidatePhoto" + res);
        if (!res) {
            waitingDialog.hide();
            showAlert("<h3>ALERTA</h3>", mensaje);
        }
        else {
            setICAO(img)
        }
    };


    /*FIRMA*/

    var estado = "False";
    idnttmHub.client.addGuardar = function (res, mensaje) {
        if (res) {
            $('#firma').attr("src", "data:image/png;base64," + mensaje);
            $("#fB64").val(mensaje);
           
            $('#spClean').val('BORRAR FIRMA');
            activateOpen();
            deactivateClose();
            padCloseState = ButtonEventsState.DEACTIVE;
            $('#btnGenerar').fadeIn();
            showAlert("ALERTA", "AHORA PUEDES GENERAR LOS CONTRATOS.");
            $('#masterProgreso').attr('src', 'Imagenes/Progress Bar 100.png');
            $("#iExit").on("click", function () {
                window.location.href = "BiographicDataForm.aspx";
            });

        }
        else {
            //showAlert("ALERTA",mensaje);
            idnttmHub.server.cerrarPad(idTransaction);
            showAlert("ALERTA", "PRESIONE DE NUEVO CAPTURAR Y CAPTURE LA FIRMA");
        }
    };


    idnttmHub.client.addlimpiarr = function (res, mensaje) {
        if (!res) {
            showAlert("ALERTA", mensaje);
            $('#spOpen').val('CAPTURAR');
            $('#spClean').val('LIMPIAR PAD');
            deactivateClean(); padCleanState = ButtonEventsState.DEACTIVE;
            deactivateClose(); padCloseState = ButtonEventsState.DEACTIVE;
        }
        else
            showAlert("ALERTA", "LA FIRMA SE AH BORRADO, TRAZARLA DE NUEVO ");
    };

    idnttmHub.client.addCerrar = function (res, mensaje) {
        if (res) {
            deactivateClean(); padCleanState = ButtonEventsState.DEACTIVE;
            deactivateClose(); padCloseState = ButtonEventsState.DEACTIVE;
            $('#spOpen').val('CAPTURAR');
        }
        else
            showAlert("ALERTA", mensaje);
        deactivateClean(); padCleanState = ButtonEventsState.DEACTIVE;
        deactivateClose(); padCloseState = ButtonEventsState.DEACTIVE;
        $('#spOpen').val('CAPTURAR');
        //alert("cerrar: " + close);
    };

    idnttmHub.client.addState = function (res, mensaje) {
        estado = mensaje;
        //alert("state: " + estado);
        if (estado == "True") {
            idnttmHub.server.cerrarPad($('#displayname').val());
        }
        //alert(mensaje);
    };

    idnttmHub.client.addFirma = function (res, mensaje) {
        if (!res) {
            if (mensaje.indexOf("A connection has already been opened") > -1)
                showAlert("ALERTA", "YA SE INICIO UNA CAPTURA.");
            else
                showAlert("ALERTA", mensaje);
        }
        else {
            $('#spOpen').val('CANCELAR');
            $('#spClean').val('LIMPIAR PAD');
            activateClose(); padCloseState = ButtonEventsState.ACTIVE;
            activateClean(); padCleanState = ButtonEventsState.ACTIVE;
            showFlashingAlert("ALERTA", "FAVOR DE TRAZAR SU FIRMA");
        }

    };

    

    /*Hub start*/
    $.connection.hub.start().done(function () {
        idnttmHub.server.invoke(uID, "1", urlService);

        $('#spOpen').click(function () {
            // Call the Send method on the hub.
            if (padOpenState == ButtonEventsState.ACTIVE)
                if ($('#spOpen').val() == "CAPTURAR") {
                    $('#firma').attr("src", "Imagenes/firmaDefault.jpg");
                    idnttmHub.server.capturarFirma(idTransaction);
                }
                else {
                    //alert("Cerrando");
                    idnttmHub.server.cerrarPad(idTransaction);
                }

        });
        //cerrar
        $('#spClose').click(function () {
            //si el boton tiene texto de cancelar guardamos
            //alert(padCloseState);
            if (padCloseState == ButtonEventsState.ACTIVE)
                if ($('#spOpen').val() == "CANCELAR") {
                    $('#spOpen').val('CAPTURAR');
                    idnttmHub.server.guardarFirma(idTransaction);
                }
                else {
                    showAlert("ALERTA", "ANTES DE GUARDAR INICIE UNA CAPTURA DE FIRMA");
                }
        });

        //limpiar
        $('#spClean').click(function () {
            // Call the Send method on the hub.
            if (padCleanState == ButtonEventsState.ACTIVE)
                if ($('#spClean').val() == "LIMPIAR PAD") {
                    idnttmHub.server.limpiarFirma(idTransaction);
                }
                else {
                    $('#firma').attr("src", "Imagenes/firmaDefault.jpg");
                    //Re-ajusta el tamaño de la imagen default del ovalo
                    $("#firmaOvalMin").css("height", "35px");
                    $("#firmaOvalMin").css("margin-top", "19%");
                    $("#firmaOvalMin").css("margin-left", "22%")
                    $("#firmaOvalMin").attr("src", "Imagenes/firma.png");
                    $("#sendPS").css("cursor", "not-allowed");
                    respuestaGlobal.firma = 0;
                    padCloseState = ButtonEventsState.DEACTIVE;
                    deactivateClean();

                }
        });

    });


    waitingDialog.hide();
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



function parseJSON(data) {
    return window.JSON && window.JSON.parse ? window.JSON.parse(data) : (new Function("return " + data))();
}

//funciones para cambiar los estados de los botones
//Boton de guardar Firma
function activateClose() {
    $("#spClose").css("cursor", "pointer");
    $("#spClose").css("pointer-events", "auto");
}
function deactivateClose() {
    $("#spClose").css("cursor", "not-allowed");
}

//Boton de capturar Firma
function activateOpen() {
    $('#spOpen').css("cursor", "pointer");
    $("#spOpen").css("pointer-events", "auto");
}
function deactivateOpen() {
    $("#spOpen").css("cursor", "not-allowed");
}

//Boton de limpiar Firma
function activateClean() {
    $('#spClean').css("cursor", "pointer");
    $("#spClean").css("pointer-events", "auto");
}
function deactivateClean() {
    $("#spClean").css("cursor", "not-allowed");
}


