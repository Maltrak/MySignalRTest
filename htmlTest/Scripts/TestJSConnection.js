/// <reference path="jquery-1.9.1.js" />
var urlService = "http://192.168.0.156:3990/Identitum_SPF/TransactionService/TransactionService.svc";

var hubService = "http://localhost:8087/signalr";//34281/
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

$(document).ready(function () {
    console.log("Document ready!!" );
	// Get the user name and store it to prepend to messages.
	$('#displayname').val(prompt('Enter your name:', ''));
	// Set initial focus to message input box.
	$('#message').focus();
	// Start the connection.
	loadHub();
});

function loadHub() {
	console.log("Inicia loadHub!" );
    $.getScript(hubService + "/hubs")
    .done(function (script, textStatus) {
		console.log("cargo scripts hubs, sin problema." );
        connectHub();
    })
    .fail(function (jqxhr, settings, exception) {
		console.log("Error al cargar script hubs: "+ exception );
        localServiceReady = false;
    });
}

function connectHub() {
	console.log("Inicia connectHub");
        
    // Start the connection
    $.connection.hub.url =hubService ;
	console.log("Setting urlHub:" + hubService);
    transaction = $.connection.messageReceivingHub;
    $.connection.hub.logging = true;
    subscribeServerEvents();
	console.log("Antes de hub start" );
    $.connection.hub.start().done(function () {
		console.log("Dentro de hub start Done!" );
        localServiceReady = true;
		$('#sendmessage').click(function () {
			// Call the Send method on the hub.
			console.log("Enviando (invoke), nombre:"+ $('#displayname').val() +" mensaje:"+ $('#message').val());
			transaction.server.invoke($('#displayname').val(), $('#message').val());
			// Clear text box and reset focus for next comment.
			$('#message').val('').focus();
		});
		$.connection.hub.disconnected(function () {
            console.log("El cliente fue desconectado, por favor inicie o reinicie el servicio local y cargue nuevamente la página");
            connectHub();
        });
    }).fail(function (jqxhr, settings, exception) {
        console.log("No fue posible establecer una conexión con el servicio local.");
		console.log(jqxhr);
		console.log(settings);
		console.log(exception);
    });
}

function subscribeServerEvents() {
	console.log("Suscribiendo evento, para broadcastMessage." );
    transaction.client.addInvoke = function (name,message) {
		console.log("Recibiendo mensaje: "+ message );
         // Html encode display name and message.
		var encodedName = $('<div />').text(name).html();
		var encodedMsg = $('<div />').text(message).html();
		// Add the message to the page.
		$('#discussion').append('<li><strong>' + encodedName
			+ '</strong>:&nbsp;&nbsp;' + encodedMsg + '</li>');
    };

}
