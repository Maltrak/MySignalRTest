var anterior = 0;
var titulo = "DIGITALIZACION";
var estado = false;
var habilitar = false;
var cic = "";
var claveE = "";
var noEm = "";
var numiden = "";

/******SWITCH INE*****/
var ineConsulta = true;

//Estados en los que puede estar un boton 
var ButtonEventsState = {
    ACTIVE: 1,
    DEACTIVE: 2,
};

var scanSaveState = ButtonEventsState.DEACTIVE;

var hubUrl = "http://localhost:8087/signalr";

var chat;

function SetStatus(text) {
    //$("#status").append(text);
    showAlert2(titulo, text, anterior);
    anterior = 1;
}

$(document).ready(function () {

    /*AUTENTIDOC*/
    $.connection.hub.url = "http://localhost:8081/signalr";
    // Declare a proxy to reference the hub.
    var chat = $.connection.autentidocHub;
    var imagenCatcha = "";

    if (chat == undefined) {

        showAlert("NO SE PUEDE DIGITALIZAR", "RECARGAR LA PÁGINA CUANDO EL SERVICIO HAYA INICIADO");
        return;
    }

    $("#iSave").click(function () {
        if (scanSaveState == ButtonEventsState.ACTIVE) {

            $("#iSave").css("cursor", "not-allowed");
            //$('#iw').attr("src", "img/blanco1.png");
            //$('#iwb').attr("src", "img/blanco1.png");
            //sendData();
            //showAlert("Digitalización Ine", "Se ha guardado con exito");
            if (respuesta.Generacion == "Ine") {
                $("#hojaOvalMin").css("margin-left", "1px");
            }
            else {
                $("#hojaOvalMin").css("margin-left", "-20px");
            }
            $("#hojaOvalMin").attr("src", "data:image/png;base64," + ine);
        }
        else {
            //showAlert("Digitalización Ine", "Aun no se ha terminado el proceso");
        }

    });


    $("#iGuardar").click(function () {
        $("#btnFinger").click();
    });

    chat.client.response = function (response) {
        SetStatus(response.ResponseDescription);
        respuesta = response.Document;
        if (response.ResponseCode == 1) {
            //alert(docName +"-"+response.Document.DocumentName);

            /*se valida la correspondencia del documento escaneado contra el tipo de documento recibido por query string*/
            if ($('input[name=documento]:checked').val() == 1) {
                docName = "ine";
            }
            if ($('input[name=documento]:checked').val() == 2) {
                docName = "psp";
            }


            if ((docName == "psp" && response.Document.DocumentName == "Passport") || (docName == "ine" && response.Document.DocumentName == "INE")) {
                //ocr
                if (response.Document.DocumentName == "Passport") {
                    $("#bInferior").css("display", "none");
                    tipo_doc = "PASAPORTE";
                    nombre = response.Document.Nombre;
                    $("#tbName").text(nombre);
                    apaterno = response.Document.ApPaterno.split(' ')[0];
                    $("#tbApPat").text(apaterno);
                    amaterno = response.Document.ApPaterno.split(' ')[1];
                    $("#tbApMat").text(amaterno);
                    genero = "n/a";
                    curp = "n/a";
                    numiden = response.Document.DocumentNumber;
                    aReg = "n/a";
                    noEm = response.Document.FechaVigencia.split(' ')[0].split('/')[2];
                    //alert("Datos:" + tipo_doc + "," + numiden + "," + nombre + "," + apaterno + "," + amaterno + "," + aReg);

                } else {
                    tipo_doc = "CREDENCIAL DE ELECTOR";
                    debugger;
                    console.log("Foto:" + response.Document.cropFace);
                    $("#fb64").val(response.Document.cropFace);
                    nombre = response.Document.Nombre;
                    $("#tbName").val(nombre);
                    apaterno = response.Document.ApPaterno;
                    $("#tbApPat").val(apaterno);
                    amaterno = response.Document.ApMaterno;
                    $("#tbApMat").val(amaterno);
                    genero = response.Document.Sexo;
                    if (genero == "H") {
                        $("#tbHombre").prop("checked", true);
                    }
                    else {
                        $("#tbMujer").prop("checked", true);
                    }
                    curp = response.Document.CURP;
                    $("#tbCURP").val(curp);
                    fecNac = (curp).replace(/(^.+\D)(\d+)(\D.+$)/i, '$2');
                    $("#tbFecNac").val(fecNac);

                    //validar que generación es para obtener CIC/OCR
                    if (response.Document.Generacion >= 5)
                    {
                        cic = response.Document.CodigoCIC;
                        $("#tbOCR_CIC").val(cic);
                    }
                    else {
                        numiden = response.Document.NoVertical;
                        $("#tbOCR_CIC").val(numiden);
                    }
                    
                    aReg = response.Document.AnioRegistro;;
                    $("#tbAReg").val(aReg);
                    noEm = response.Document.Emision;
                    $("#tbEmi").val(noEm);
                    
                    claveE = response.Document.ClaveDeElector;
                    $("#tbClaElec").val(claveE);
                    edad = response.Document.Edad;
                    $("#tbEdad").val(edad);
                    calle = response.Document.Calle;
                    $("#tbCallNo").val(calle);
                    colcp = response.Document.Colonia + " " + response.Document.CodigoPostal;
                    $("#tbColCP").val(colcp);
                    edo = response.Document.DelEdo;
                    $("#tbMunEnt").val(edo);
                    secc = response.Document.Seccion;
                    $("#tbSecc").val(secc);
                }

                //alert("Datos:" + tipo_doc + "," + numiden + "," + nombre + "," + apaterno + "," + amaterno + "," + genero + "," + curp + "," + aReg + "," + noEm);
            }
            //cambiar fechas
            //tipo de documento  |  nombre(s) | apaterno | amaterno | genero |  curp| numiden |  aReg |  noEm |  idCredere;
            //ocr = tipo_doc + "|" + nombre + "|" + apaterno + "|" + amaterno + "|" + genero + "|" + curp + "|" + numiden + "|" + aReg + "|" + noEm + "|" + idCredere + "|" + idUsuario + "|" + numSuc + "|" + descSuc + "|" + solicitud;
            //alert(ocr);
            //$("#ocr").val(ocr);

            // se realizó la validación
            $('#iw').attr("src", "");
            $('#iw').attr("src", "data:image/png;base64," + respuesta.Image);
            $('#iwb').attr("src", "");
            $('#iwb').attr("src", "data:image/png;base64," + respuesta.ImageBack);
            $('.blanco').css("height", "285px");
            //se carga la imagen en hiden field
            $("#frenteH").val(respuesta.Image);
            $("#reversoH").val(respuesta.ImageBack);

            var validacion;
            if (response.Document.Result) {
                validacion = "AUTENTICO";
            }
            else {
                validacion = "FALSO";
            }
            SetStatus("Terminado");
            bootbox.hideAll();
            //SetStatus("Resultado de la validación: " + validacion + " con un porcentaje del " + response.Document.ResultValue +
            //"Número de documento " + response.Document.DocumentNumber);
            //showAlert("Digitalización terminada","Resultado de la validación es: " + "<strong>"+ validacion+"</strong>"+" con un porcentaje del " + response.Document.ResultValue +"%");
            //$("#iSave").css("cursor", "pointer");
            //alert("ocr: " + ocr);
            if (response.Document.Result) {
                //showAlert("DIGITALIZACIÓN TERMINADA", "LA VALIDACIÓN DEL INE ES: " + "<strong>" + validacion + "</strong>" + " CON UN PORCENTAJE DEL " + response.Document.ResultValue + "%" + "<br/>AHORA PUEDE RETIRAR LA IDENTIFICACIÓN Y GUARDAR LA IMAGEN");
                if (response.Document.DocumentName == "INE") {
                    if (ineConsulta) {
                        getCaptcha();
                    }
                    else {
                        //modificacion en vivo
                        showAlert("DIGITALIZACIÓN TERMINADA", "EL DOCUMENTO ES: " + "<strong>" + validacion + "</strong>" + "<br/>AHORA PUEDE RETIRAR LA IDENTIFICACIÓN"); 
                        /*var box = bootbox.dialog({
                         message: "RESUMEN DE VALIDACIÓN:<br/><br/>"
                                 + "AUTENTICIDAD: <img class='autenticidad' src='Imagenes/Select.png'><br/><br/>"
                                 + "LISTA NOMINAL: <b>NO CONSULTADO</b> <br/>AHORA PUEDE RETIRAR LA IDENTIFICACIÓN Y GUARDAR LA IMAGEN.",
                         title: "DIGITALIZACIÓN TERMINADA",
                         backdrop: false,
                         closeButton: true
                     });*/
                        habilitar = true;
                        activateSave();
                        scanSaveState = ButtonEventsState.ACTIVE;
                    }

                } else {
                    var box = bootbox.dialog({
                        message: "RESUMEN DE VALIDACIÓN:<br/><br/>"
                                + "AUTENTICIDAD: <img class='autenticidad' src='Imagenes/Select.png'><br/>AHORA PUEDE RETIRAR LA IDENTIFICACIÓN",// Y GUARDAR LA IMAGEN.",
                        title: "DIGITALIZACIÓN TERMINADA",
                        backdrop: false,
                        closeButton: true
                    });
                    habilitar = true;
                    activateSave();
                    scanSaveState = ButtonEventsState.ACTIVE;
                }

            } else {



                deactivateSave();
                scanSaveState = ButtonEventsState.DEACTIVE;

                showAlert("DIGITALIZACIÓN TERMINADA", "EL DOCUMENTO NO CUMPLE CON LA NORMATIVIDAD" + "<br/>VUELVA A CAPTURARLO");
                /*var box = bootbox.dialog({
                    message: "RESUMEN DE VALIDACIÓN:<br/><br/>"
                            + "AUTENTICIDAD: <img class='autenticidad' src='Imagenes/handAbcense.png'><br/><br/>"
                            + "LISTA NOMINAL: <img class='autenticidad' src='Imagenes/handAbcense.png'> <br/>" + "<br/>EL DOCUMENTO NO CUMPLE CON LA NORMATIVIDAD, VUELVA A CAPTURARLO",
                    title: "DIGITALIZACIÓN TERMINADA",
                    backdrop: false,
                    closeButton: true
                });*/
                //alert("notificando a DD");
                setTimeout(function () {
                    parent.postMessage({ mensaje: { success: true, valor: "0" } }, origen);
                }, 100);
                habilitar = false;
            }

            //Redirect(cic);
            $('#iDig').on({
                'mouseenter': function () {
                    if (true) {
                        $(this).addClass('capturarIdHover');
                    }
                },
                'mouseleave': function () {
                    $(this).addClass('capturarIdHover');
                }
            });

            $('#infoQueCura').html("Inicia la verificación biométrica haciedo clic en el ícono de la huella en el menú ubicado en la parte inferior de esta pantalla.");
            $('#infoQueCura').fadeIn();

        }
        else {
            showAlert("ERROR", "EL DOCUMENTO INGRESADO NO ES EL CORRESPONDIENTE " + $('input[name=documento]:checked').val())
        }



        

        //showAlert("DIGITALIZACIÓN TERMINADA", "LA VALIDACIÓN DEL INE ES: " + "<strong>" + validacion + "</strong>" + " CON UN PORCENTAJE DEL " + response.Document.ResultValue + "%"+"AHORA PUEDE RETIRAR LA IDENTIFICACIÓN Y GUARDAR LA IMAGEN");
        //habilitar = true;
    };

    chat.client.feedBack = function (message) {

        if (message == "VALIDANDO IDENTIFICACIÓN") {
            titulo = "ESPERE UN MOMENTO";
        }
        else if (message.toLowerCase().indexOf("ine") != -1) {
            return;
        }
        else if (message == "RESULTADO DE LA VALIDACIÓN") {
            titulo = "RESPUESTA INE";
        }
        else {
            titulo = "DIGITALIZACIÓN";
        }
        var msj = new String(message);
        message = msj.toUpperCase();
        SetStatus(message);
        anterior = 1;
    };

    chat.client.captcha = function (imageC) {
        bootbox.hideAll();
        imagenCatcha = "data:image/png;base64," + imageC;
        //alert(imageC);
        //$("#imgCaptcha").attr("src", imagenCatcha);
        var box = bootbox.dialog({
            message: "INGRESE EL TEXTO DE LA SIGUIENTE IMAGEN: <br/><img style='margin-left: 30%; margin-top: 2%;' src='" + imagenCatcha + "'>" + "<br/><input type='text' id='result' style='margin-left: 30%;'></input>",
            title: "LISTA NOMINAL",
            backdrop: false,
            closeButton: false,
            buttons: {
                success: {
                    label: "ACEPTAR ",
                    className: "nuevoBOTON",
                    callback: function () {
                        //$('result').val();
                        nominal = $('#result').val();
                        //$("#status").append(nominal);
                        chat.server.sendCaptcha(nominal);
                        //bootbox.hideAll();
                    }
                }
            }
        });
    };

    $('#sendCaptcha').click(function () {
        chat.server.sendCaptcha($('#captchaValue').val());
        $("#captchaValue").val("");
    });

    // Start the connection.
    $.connection.hub.start().done(function () {
        estado = true;
        //showAlert("Servicio", "Se ha iniciado el servicio con exito");
        //$('#startCapture').prop("disabled", false);
    });

    $('#iDig').click(function () {
        $('#infoQueCura').fadeOut();
        if (estado) {
            showAlert2("ESPERE UN MOMENTO", "INICIANDO DISPOSITIVO");
            chat.server.startCapture();
        }
        else {
            showAlert("NO SE PUEDE DIGITALIZAR", "RECARGAR LA PÁGINA CUANDO EL SERVICIO HAYA INICIADO");
        }

    });

    $('#prueba').click(function () {

        try {
            document.getElementById('cric_1400').style.fill = '#00ff00';
            document.getElementById('cric_1400').style.stroke = '#00ff00';
        } catch (e) {

        }
    });




    /*********************    Fin de Digitalización de INE      ********************/

    $("#terminar").click(function () {
        //if (respuestaGlobal.documentos == 0) {
        //    showAlert("Error", "No se han capturado documentos");
        //    $("#terminar").css("cursor", "not-allowed");
        //    $("#terminar").css("background-color", "#EAEAEA");
        //}
        //else {
        sendData(respuesta);
        showAlert("Terminado", "Ya se termino de capturar");
        if (respuesta.Generacion == "Ine") {
            $("#hojaOvalMin").css("margin-left", "1px");
        }
        else {
            $("#hojaOvalMin").css("margin-left", "-20px");
        }
        $("#hojaOvalMin").attr("src", ine);
        //}
    });

    deactivateSave();
    /*MENSAJE DE CARGADO*/
    //parent.postMessage({ mensaje: { success: true, listo: true } }, origen);

    $('#iDig').addClass('capturarIdHover');

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

    $('#infoQueCura').fadeIn();

});


//funciones para cambiar los estados de los botones
//Boton de guardar escaneo
function activateSave() {
    $("#upBTN").css("cursor", "pointer");
    $("#upBTN").css("pointer-events", "auto");
    $('#upBTN').prop("disabled", false);
}
function deactivateSave() {
    $("#upBTN").css("cursor", "not-allowed");
    $("#upBTN").css("pointer-events", "none");
    $('#upBTN').prop("disabled", true);
}

function getUpAvailable() {
    if (scanSaveState == ButtonEventsState.ACTIVE) {
        //showAlert("ALERTA","PERMITIDO");
        return true;
    }
    else {
        showAlert("ALERTA", "YA EXISTE UN DOCUMENTO.");
        return false;
    }
}

function idCaptured() {
    return habilitar;
}

/*************          FUNCIONES DE ENVIO A WS    *************/

function sendData() {
    try {

        $.ajax({
            type: "POST",
            url: "CapturaIne.aspx/sendINE",
            data: '{frente:"PAKO",reverso:"pako",idCredere:"pako",ocr:"' + ocr + '" }',
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: OnSuccess,
            failure: function (response) {
                alert(response.d);
            }
        });
    } catch (err) {
        alert(err.message);
    }

}

function OnSuccess(response) {
    alert(response.d);
}

/*************           FUNCIONES DE ALERTAS       ******************/
function showAlert(titutlo, mensaje) {

    var dialog = bootbox.dialog({
        message: mensaje,
        title: titutlo,
        onEscape: function () {
            //if (callback)
            //    callback();
        },
        backdrop: false,
        closeButton: true,
        className: "default",
        buttons: {
            cancel: {
                label: "CERRAR",
                className: "nuevoBOTON",
                callback: function () {
                    //if (callback)
                    //    callback();
                    dialog.modal('hide');
                }
            }
        }
    });
}

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
        backdrop: true,
        closeButton: false,
        className: "default",
    });
}

/*************      FUNCIONES INE       ******************/
function getCaptcha() {
    try {
        debugger;
        console.log("Solicitando Captcha..");
        $.ajax({
            type: 'POST',
            async: false,
            url: './BiographicDataForm.aspx/getCaptcha',
            data: '',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function (response) {
                console.log("Succes");
                Obj = response;
                var r = parseJSON(Obj.d);
                //mostrar captcha
                bootbox.hideAll();
                imagenCatcha = "data:image/png;base64," + r.val;
                var box = bootbox.dialog({
                    message: "INGRESE CORRECTAMENTE EL TEXTO DE LA SIGUIENTE IMAGEN: <br/><img style='margin-left: 30%; margin-top: 2%;' src='" + imagenCatcha + "'>" + "<br/><input autofocus type='text' id='result' style='margin-left: 30%;' >",
                    title: "LISTA NOMINAL",
                    backdrop: false,
                    closeButton: false,
                    buttons: {
                        success: {
                            label: "ACEPTAR ",
                            className: "nuevoBOTON",
                            callback: function () {
                                //$('result').val();
                                nominal = $('#result').val();
                                if (!nominal) {
                                    return false;
                                }
                                else
                                    validate(cic, claveE, noEm, numiden, nominal);
                                //bootbox.hideAll();
                            }
                        }
                    }
                });
                //alert(imageC);
                //$("#imgCaptcha").attr("src", imagenCatcha);

            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
            }
        });
    } catch (err) {
        alert("Error solicitar captcha:" + err.message);
    }
}


function validate(CodigoCIC, ClaveDeElector, Emision, NoVertical, captchaValue) {
    try {
        showAlert2("ESPERE UN MOMENTO", "VALIDANDO EN LISTA NOMINAL");
        if (CodigoCIC == null) {
            console.log("cic nulo");
            CodigoCIC = "";
        }
        console.log(CodigoCIC, ClaveDeElector, Emision, NoVertical, captchaValue);
        console.log("Validando en INE..");
        $.ajax({
            type: 'POST',
            async: false,
            url: './BiographicDataForm.aspx/validate',
            data: '{CodigoCIC:"' + CodigoCIC + '" , ClaveDeElector:"' + ClaveDeElector + '" , Emision:"' + Emision + '",NoVertical:"' + NoVertical + '",captchaValue:"' + captchaValue + '"}',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function (response) {
                console.log("Succes");
                Obj = response;
                var r = parseJSON(Obj.d);
                //mostrar resultado
                console.log(r.res);
                bootbox.hideAll();
                if (r.res == false) {
                    if (r.code == 1)//captcha mal capturado se muestra de nuevo un captcha
                        getCaptcha();
                    else if (r.code == 2)//error en el sistema
                        showAlert2("ALERTA", r.val);
                    else if (r.code == 3)//respuesta del ine negativa
                    {
                        imagenResult = "data:image/png;base64," + r.val;
                        var box = bootbox.dialog({
                            message: "RESUMEN DE VALIDACIÓN:<br/><br/>"
                                    + "AUTENTICIDAD: <img class='autenticidad' src='Imagenes/Select.png'><br/><br/>"
                                     + "LISTA NOMINAL: <img class='autenticidad' src='Imagenes/handAbcense.png'> <br/><br/><img class='ineResult' src='" + imagenResult + "'>" + "<br/>",
                            title: "DIGITALIZACIÓN TERMINADA",
                            backdrop: false,
                            closeButton: true
                        });
                    }
                    else
                        showAlert2("ALERTA", "ERROR DESCONOCIDO");
                } else {
                    imagenResult = "data:image/png;base64," + r.val;
                    var box = bootbox.dialog({
                        message: "RESUMEN DE VALIDACIÓN:<br/><br/>"
                                + "AUTENTICIDAD: <img class='autenticidad' src='Imagenes/Select.png'><br/><br/>"
                                + "LISTA NOMINAL: <img class='autenticidad' src='Imagenes/Select.png'> <br/><br/><img class='ineResult' src='" + imagenResult + "'>" ,
                        title: "DIGITALIZACIÓN TERMINADA",
                        backdrop: false,
                        closeButton: true
                    });
                    habilitar = true;
                    activateSave();
                    scanSaveState = ButtonEventsState.ACTIVE;
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
            }
        });
    } catch (err) {
        alert("Error solicitar captcha:" + err.message);
    }
}


function parseJSON(data) {
    return window.JSON && window.JSON.parse ? window.JSON.parse(data) : (new Function("return " + data))();
}

/****/
function invocar()
{
    $.connection.hub.url = hubUrl;
    chat = $.connection.messageRecievingHub;

    if (chat == undefined) {
        showAlert("ALERTA", "RECARGAR LA PÁGINA CUANDO EL SERVICIO DE ENROLAMIENTO HAYA INICIADO");
        return;
    }

    
    /*CapturaHuella*/
    chat.client.addInvoke = function (it, res, req) {


        isOk = res;
        idTransaction = it;
        minimumFingerprintsRequired = req;

        console.log("Inovcación.");
        console.log("Status: " + isOk);
        console.log("IdTransaction: " + idTransaction);
        console.log("minimo huellas: " + minimumFingerprintsRequired);


        if (isOk) {
            chat.server.captureIndex(idTransaction);
        } else {

            //bootbox_alert("HUBO UN ERROR DURANTE LA INVOCACIÓN, CONTACTE AL ADMINISTRADOR DEL SISTEMA.");
            showAlert("ALERTA", "HUBO UN ERROR DURANTE LA INVOCACIÓN, CONTACTE AL ADMINISTRADOR DEL SISTEMA.");

        }


    };

    chat.client.addCapture = function (res, ansi, wsq, msg) {

        if (res) {
            verifyAtINE(ansi, wsq);
        }

    };

    $.connection.hub.start().done(function () {
        chat.server.invoke("130792", "1", "http://192.168.0.156:3990/POC-HSBC/TransactionService/TransactionService.svc");
    });

}

