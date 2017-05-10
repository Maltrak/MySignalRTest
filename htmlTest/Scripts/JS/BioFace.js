// Elements for taking the snapshot
var canvas;
var context;
var video;


$(document).ready(function () {
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    video = document.getElementById('video');

   
    
    
    

    // Trigger photo take
    //document.getElementById("btnCaptureWC").addEventListener("click", function () {
    //    context.drawImage(video, 0, 0, 480, 320);
    //    CovertCanvasToB64();
    //});

    //CIERRA WEB CAM Y REPLICA LA FOTO DE OVALO EN VISTA AMPLIADA
    $("#guardar").click(function () {
        if (guardar != false) {
            //obtiene la foto capturada
            var fotosrc = $("#imgCapture").attr("src");
            var fotoB64 = fotosrc.split(",")[1];

            waitingDialog.show(void 0, void 0, "Evaluando foto...");
            idnttmHub.server.validatePhoto(idTransaction, fotoB64);
            //idnttmHub.server.setPhoto(idTransaction, fotoB64);
            $("#foto").attr("src", fotosrc);
            $("#video").css("display", "none");

            $("#btnCaptureWC").attr("value", "ACTIVAR");
            $("#foto").css("display", "block");
            guardar = false;
            video.pause();
        } else {
            showAlert("ALERTA", "CAPTURA UNA FOTO ANTES DE GUARDAR.");
        }
    });

    $("#verificar").click(function () {
        
        idnttmHub.server.verifyFaces(idTransaction);

          
    });

    

    //BOTON DE CAPTURA DE FOTO
    $("#btnCaptureWC").click(function () {
        if ($("#btnCaptureWC").attr("value") == "CAPTURAR") {
            context.drawImage(video, 0, 0, 480, 320);
            CovertCanvasToB64();
            guardar = true;
            $("#guardar").css("cursor", "pointer");
        } else {
            webcamUpdate();
            $("#foto").css("display", "none");
            $("#video").css("display", "block");
            $("#imgCapture").attr("src", "Imagenes/fotoDefault.png");
        }



    });
});


function videoError(e) {

    console.log('Reeeejected!', e.name);
    if (e.name == "NotAllowedError")
    {
        $("#btnCaptureWC").css("cursor", "not-allowed");
        $("#guardar").css("cursor", "not-allowed");
        showFlashingAlert("<h3>ALERTA</h3>", "Debes permitir el uso de cámara para continuar, recargue la página.");
    }
    
}
function update(stream) {
    document.querySelector('video').src = stream.url;
}
function CovertCanvasToB64() {
    console.log("convirtiendo:" + canvas.toDataURL());
    $('#imgCapture').attr("src", canvas.toDataURL());
}
//-----FUNCION	DE	APAGAR	CAMARA----//
function webcamhide() {
    //alert("webcamhide");
    $("#webcam").css("display", "none");
}

function webcamUpdate() {
    $("#btnCaptureWC").attr("value", "CAPTURAR");
    $("#guardar").attr("disabled", false);
    video.play();
   
}

function onError(errorId, errorMsg) {
    $("#guardar").attr("disabled", true);
    $("#btnCaptureWC").attr("value", "RECARGAR CAMARA");

    switch (errorId) {
        case 3:
            showAlert("ERROR", "NO SE DETECTARON CAMARAS DISPONIBLES");
            break;
        case 4:
            showAlert("ERROR", "ACCESO A LA CAMARA DENEGADO");
            break;
        case 24:
            showAlert("ERROR", "EL NAVEGADOR NO ES COMPATIBLE CON LA APLICACIÓN");
            break;
        case 99:
            showAlert("ERROR", "DESCONOCIDO");
            break;
        default:
            showAlert("ERROR", errorId);
            break;
    }
}
function onWebcamReady(cameraNames, camera, microphoneNames, microphone, volume) {
    $('#cameraNames').empty();
    $.each(cameraNames, function (index, text) {
        $('#cameraNames').append($('<option></option>').val(index).html(text))
    });
    $('#cameraNames').val(camera);
}

function AskForCamera()
{
    // Get access to the camera!
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Not adding `{ audio: true }` since we only want video now
        navigator.mediaDevices.getUserMedia({ video: true }).then(function (stream) {
            video.src = window.URL.createObjectURL(stream);
            video.play();
        }, videoError);
    }
}

function setICAO(icaoImage)
{
    $('#foto').attr("src", "data:image/png;base64," + icaoImage);
    idnttmHub.server.setPhoto(idTransaction, icaoImage);
}
