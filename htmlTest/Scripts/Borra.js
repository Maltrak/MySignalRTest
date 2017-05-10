/// <reference path="jquery-1.9.1.js" />

var transaction;
var idBtn;
var verifyselectedfingers = 0;
var enablegFingerForCapture = [8, 7, 6, 1, 2, 3];
var localServiceReady = false;
var transactionId = -1;

$(function () {
    if ($.contextMenu != undefined) {
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
    }
});

$(document).ready(function () {
    loadHub();
    $('.Finger').on('click', function (e) {

        $(".EnrollForm").hide();
        $(".CaptureFinger").show();

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


    $('#txtUsuario').prop("disabled", false);
    $('#txtSupervisor').prop("disabled", false);
    $('#cboTransaction').prop("disabled", false);
    $("#btnStart").prop("disabled", false);


    $("#btnStart").click(function () {


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

    $.getScript("http://localhost:8080/signalr/hubs")
    .done(function (script, textStatus) {
        connectHub();
    })
    .fail(function (jqxhr, settings, exception) {
        localServiceReady = false;
    });
}

function connectHub() {
    // Start the connection
    $.connection.hub.url = 'http://localhost:8080/signalr';
    transaction = $.connection.transactionClientServiceHub;
    $.connection.hub.logging = true;
    subscribeServerEvents();
    $.connection.hub.start().done(function () {
        localServiceReady = true;

        $.connection.hub.disconnected(function () {
            //            alert("El cliente fue desconectado, por favor inicie o reinicie el servicio local y cargue nuevamente la página");
            //            connectHub();
            localServiceReady = false;
        });

    }).fail(function () {
        alert("No fue posible establecer una conexión con el servicio local de Identitum");
    });
}

function verifyUser(identitum_user) {
    transactionId = 2;
    startCapture(2, identitum_user);
}

function deleteUser(identitum_user, identitum_supervisor) {
    transactionId = 10;
    startCapture(10, identitum_user, identitum_supervisor);
}

function addUser(identitum_user, identitum_supervisor) {
    transactionId = 1;
    startCapture(1, identitum_user, identitum_supervisor);
}

function userVerified(response) {
    switch (response.ResponseCode) {
        case 1: //Huellas confirmadas.
            Ext.MessageBox.alert('REA - Enrolamiento', '<div style="text-align:center;font-size:20px;">Verificacion válida. El usuario fue enrolado correctamente.</div>');
            break;
        case 102:
            //No existe el alias
            Ext.MessageBox.alert('REA - Enrolamiento', '<div style="text-align:center;font-size:20px;">Usuario no enrolado. Contacte a un administrador.</div>');

            break;
        case 104:
            //El usuario no se pudo verificar 
            Ext.MessageBox.alert('REA - Enrolamiento', '<div style="text-align:center;font-size:20px;">El usuario no se pudo verificar. Intente nuevamente</div>');

            break;
        case 118:
            //No se localizó el dispositivo o número de serie proporcionado
            Ext.MessageBox.alert('REA - Enrolamiento', '<div style="text-align:center;font-size:20px;">No se localizó el dispositivo o número de serie proporcionado.</div>');

            break;
        case 129:
            //No se localizó a ningún usuario *******el usuario esta bloqueado
            Ext.MessageBox.alert('REA - Enrolamiento', '<div style="text-align:center;font-size:20px;">Usuario bloqueado. Vuelva a intentarlo en un minuto.</div>');

            break;
        case 600:
            //Ocurrió un error interno en el cliente de Identitum                     
            Ext.MessageBox.alert('REA - Enrolamiento', '<div style="text-align:center;font-size:20px;">Error 600. Verifique que el biométrico esté conectado.</div>');

            break;
        case 603:
            //El Rol proporcionado no es valido                     
            Ext.MessageBox.alert('REA - Enrolamiento', '<div style="text-align:center;font-size:20px;">El Rol proporcionado no es valido.</div>');

            break;
        case 607:
            //El dispositivo fue desconectado 
            Ext.MessageBox.alert('REA - Enrolamiento', '<div style="text-align:center;font-size:20px;">El dispositivo fue desconectado.</div>');

            break;
        case 5000:
            //Fallo la conexión con el servidor 
            Ext.MessageBox.alert('REA - Enrolamiento', '<div style="text-align:center;font-size:20px;">Fallo la conexión con el servidor.</div>');

            break;

        default:
            Ext.MessageBox.alert('REA - Enrolamiento', '<div style="text-align:center;font-size:20px;">' + response.ResponseCode + "-" + response.responseDescription + '</div>');
    }
}


function userAdded(response) {
    if (response.ResponseCode == 1) {
        // if (response == 1) {
        //Ext.MessageBox.alert('REA - Enrolamiento', response.responseDescription);

        //SERIALIZACIÓN
        a = "{'strCadena': '" + IdPersona + "|" + NumeroEmpleado + "'}";
        //FIN

        //MAPEO
        //if (NumeroEmpleado == '-') {
        $.ajax(
                                    {
                                        url: "Controller/frmAjaxEnrolamiento.aspx/enrolamiento",
                                        data: a,
                                        dataType: "json",
                                        type: "POST",
                                        contentType: 'application/json; charset=utf-8',

                                        success: function (msg) {
                                            if (msg.d.msg == '') {

                                                //image.attr("src", "Imagenes/huella_green.png");
                                                //imagePal.attr("src", "Imagenes/" + nombreImg_ + "V.png");
                                                $("#ContentPlaceHolder1_lblNoEmpleado").html(msg.d.numero);
                                                $("#ContentPlaceHolder1_lblNoEmpleado").css("color", "red");


                                                // Ext.MessageBox.msg('REA - Enrolamiento', '¡Bienvenido, enrolamiento completado!', showResultAcceso);

                                                var win = Ext.create('Ext.window.Window', {
                                                    id: 'win',
                                                    title: '¡Bienvenido!',
                                                    height: 200,
                                                    width: 600,
                                                    resizable: false,
                                                    layout: {
                                                        type: 'vbox',
                                                        align: 'center'
                                                    },
                                                    items: [{
                                                        xtype: 'label',
                                                        text: '¡Enrolamiento completado!',
                                                        style: 'font: normal 20px courier'
                                                    }, {
                                                        xtype: 'label',
                                                        text: $('#ContentPlaceHolder1_lblpersona').text(),
                                                        style: 'font: normal 40px courier'

                                                    }, {
                                                        xtype: 'label',
                                                        text: 'Su número de empleado o número temporal es:',
                                                        style: 'font: normal 20px courier'
                                                    }, {
                                                        xtype: 'label',
                                                        text: msg.d.numero,
                                                        style: 'font: normal 55px courier'
                                                    }],
                                                    buttons: [{
                                                        text: 'Aceptar', handler: function () {
                                                            win.destroy();
                                                        }
                                                    }]
                                                }).show();


                                            }
                                            else {

                                                Ext.MessageBox.alert('REA - Enrolamiento', '<div style="text-align:center;font-size:20px;">' + msg.d.msg + '</div>');
                                                //  image.attr("src", "Imagenes/huella_red.png");
                                                // imagePal.attr("src", "Imagenes/" + nombreImg_ + "E.png");
                                            }

                                        },
                                        error: function (result) {

                                            Ext.example.msg('Error', 'Operación incompleta. Contacte con un administrador para generar su Número de Empleado Temporal.');

                                        }
                                    });

        /* }
         else {
             Ext.MessageBox.msg('REA - Enrolamiento', '¡Enrolamiento completado, bienvenido!', showResultAcceso);
         }*/
    }
    else {
        // alert(response.ResponseCode + "-" + response.responseDescription);
        switch (response.ResponseCode) {
            case 613:
                Ext.MessageBox.alert('REA - Enrolamiento', '<div style="text-align:center;font-size:20px;">El cliente Identitum no está disponible. Es necesario levantar el servicio.</div>');
                break;
            case 600:
                Ext.MessageBox.alert('REA - Enrolamiento', '<div style="text-align:center;font-size:20px;">Error 600. Verifique que el dispositivo esté conectado.</div>');
                break;
            case 105:
                Ext.MessageBox.alert('REA - Enrolamiento', '<div style="text-align:center;font-size:20px;">La persona ya ha sido enrolada. Operación exitosa.</div>');
                break;
            case 104:
                Ext.MessageBox.alert('REA - Enrolamiento', '<div style="text-align:center;font-size:20px;">No se pudo verificar la identidad del usuario enrolador. Intente nuevamente</div>');
                break;

            case 601:
                //Ext.MessageBox.alert('REA - Enrolamiento', 'La operación fue cancelada.');
                break;
            default:
                Ext.MessageBox.alert('REA - Enrolamiento', '<div style="text-align:center;font-size:20px;">' + response.ResponseCode + "  -  " + response.responseDescription + '</div>');
        }
    }
}

function userDeleted(response) {
    switch (response.ResponseCode) {
        case 1: //Huellas borradas.

            a = "{'strCadena': '" + IdPersona + "|" + NumeroEmpleado + "'}";

            $.ajax(
                {
                    url: "Controller/frmAjaxEnrolamiento.aspx/quitarHuellas",
                    data: a,
                    dataType: "json",
                    type: "POST",
                    contentType: 'application/json; charset=utf-8',

                    success: function (msg) {
                        if (msg.d.msg == '') {

                            $("#ContentPlaceHolder1_lblNoEmpleado").html(msg.d.numero);
                            $("#ContentPlaceHolder1_lblNoEmpleado").css("color", "red");

                            Ext.MessageBox.alert('REA - Enrolamiento', '<div style="text-align:center;font-size:20px;">Las huellas del integrante han sido dadas de baja.</div>', function () { enrolamiento(); });
                        }
                        else {

                            Ext.MessageBox.alert('REA - Enrolamiento', '<div style="text-align:center;font-size:20px;">' + msg.d.msg + '</div>');
                            //  image.attr("src", "Imagenes/huella_red.png");
                            // imagePal.attr("src", "Imagenes/" + nombreImg_ + "E.png");
                        }

                    },
                    error: function (result) {

                        Ext.example.msg('Error', 'Operación incompleta. Contacte con un administrador para dar de baja las huellas.');

                    }
                });
            break;
        case 102: //El integrante no se ha enrolado con anterioridad.
            enrolamiento();
            break;
        case 104: //El integrante no se ha enrolado con anterioridad.
            Ext.MessageBox.alert('REA - Enrolamiento', '<div style="text-align:center;font-size:20px;">No se pudo verificar la identidad del usuario enrolador. Intente nuevamente</div>');
            break;
        case 600:
            Ext.MessageBox.alert('REA - Enrolamiento', '<div style="text-align:center;font-size:20px;">Error 600. Verifique que el dispositivo esté conectado.</div>');
            break;
        default:
            Ext.MessageBox.alert('REA - Enrolamiento', '<div style="text-align:center;font-size:20px;">' + response.ResponseCode + "-" + response.responseDescription + '</div>');
    }
}

function startCapture(transactionId, identitum_user, identitum_supervisor) {
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
    var users;
    switch (transactionId) {
        case 1:
            users = [
        { "UserAlias": identitum_supervisor, "Rol": "Supervisor", "Action": 2 },
        { "UserAlias": identitum_user, "Rol": "Usuario", "Action": 1 }
            ];
            break;
        case 2:
            users = [{
                "UserAlias": identitum_user, "Rol": "Usuario", "Action": 2
            }, ];
            break;
        case 6:
            users = [
        { "UserAlias": $('#txtSupervisor').val(), "Rol": "Supervisor", "Action": 1 },
            ];
            break;
        case 7:
            users = [
        { "UserAlias": $('#txtSupervisor').val(), "Rol": "Supervisor", "Action": 2 },
            ];
            break;
        case 10:
            users = [
        { "UserAlias": identitum_supervisor, "Rol": "Supervisor", "Action": 2 },
        { "UserAlias": identitum_user, "Rol": "Usuario", "Action": 5 }
            ];
            break;
        default:
            alert("Transacción no soportada, favor de configurar");
            break;

    }

    transaction.server.startCapture(users, transactionId);
}


function subscribeServerEvents() {
    transaction.client.clientResponse = function (response) {
        $('#Feedback').text(response.ResponseCode + "-" + response.ResponseDescription);
        $('#ModalIdentitumClient').modal('hide')
        $("#btnStart").prop("disabled", false);
        $(".EnrollForm").hide();
        $(".VerifyForm").hide();

        switch (transactionId) {
            case 1:
                userAdded(response);
                break;
            case 2:
                userVerified(response);
                break;
            case 10:
                userDeleted(response);
                break;
            default:
                alert("Función no implementada");
                break;
        }
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


    transaction.client.feedback = function (feedback) {
        $("#Feedback").prop("disabled", false);
        $("#Feedback").addClass("bg-danger");
        $("#Feedback").text(feedback.FeedbackType + " - " + feedback.Message);
    };

    transaction.client.showEnrollForm = function () {
        $(".IdentitumClientControl").removeClass("IdentitumClientControlVerify");
        $(".IdentitumClientControl").addClass("IdentitumClientControlEnroll");
        $(".EnrollForm").show();
    };

    transaction.client.showVerifyForm = function () {
        $(".IdentitumClientControl").removeClass("IdentitumClientControlEnroll");
        $(".IdentitumClientControl").addClass("IdentitumClientControlVerify");
        $(".EnrollForm").hide();
        $(".VerifyForm").show();
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
        for (var i = 0; i < characteristics.Details.length; i++) {
            $("#F" + characteristics.Details[i].BiometricCharacteristicId).removeClass("FingerNotEnabled");
            $("#F" + characteristics.Details[i].BiometricCharacteristicId).addClass("NoCaptured");
        }
    };

}
