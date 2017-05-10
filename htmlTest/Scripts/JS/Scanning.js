//-- =============================================
//-- Author: ANIBAL OROZCO
//-- Create date: 15-03-2017
//-- Description:	Script para demo HSBC (Dynamsoft, OCRPro, Barcode)
//-- =============================================
/*  */
var AppPath = './';  //cuando se publique la app esto debe cambiar, ejemplo: ./nombreapp/
document.onscroll = MouseScroll;
var _iLeft, _iTop, _iRight, _iBottom;
var _iLeftOUT, _iTopOUT, _iRightOUT, _iBottomOUT;
Dynamsoft.WebTwainEnv.RegisterEvent('OnWebTwainReady', Dynamsoft_OnReady);
var DWObject;
var DWObjectLargeViewer;
var sourceid = "";
var ResolutionTarget = 300;
/*  */
/* Los procesos de OCR y lectura de Barcode se hacen del lado del cliente, solo el proceso de los resultados viaja y se procesa en el server*/
/* La funcion saveImage manda la imagen en el buffer al server y este lo guarda, tambien se puede guardar desde el lado del cliente */

var BarcodeInfo =
    [
        { desc: "All", val: EnumDWT_BarcodeFormat.All },
        { desc: "1D Barcodes", val: EnumDWT_BarcodeFormat.OneD },
        { desc: "QR Code", val: EnumDWT_BarcodeFormat.QR_CODE },
        { desc: "PDF417", val: EnumDWT_BarcodeFormat.PDF417 },
        { desc: "Data Matrix", val: EnumDWT_BarcodeFormat.DATAMATRIX },
        { desc: "CODE_39", val: EnumDWT_BarcodeFormat.CODE_39 },
        { desc: "CODE_128", val: EnumDWT_BarcodeFormat.CODE_128 },
        { desc: "CODE_93", val: EnumDWT_BarcodeFormat.CODE_93 },
        { desc: "CODABAR", val: EnumDWT_BarcodeFormat.CODABAR },
        { desc: "EAN_13", val: EnumDWT_BarcodeFormat.EAN_13 },
        { desc: "EAN_8", val: EnumDWT_BarcodeFormat.EAN_8 },
        { desc: "UPC_A", val: EnumDWT_BarcodeFormat.UPC_A },
        { desc: "UPC_E", val: EnumDWT_BarcodeFormat.UPC_E },
        { desc: "Interleaved 2 of 5", val: EnumDWT_BarcodeFormat.ITF },
        { desc: "Industrial 2 of 5", val: EnumDWT_BarcodeFormat.INDUSTRIAL_25 }
    ];

function Dynamsoft_OnReady() {

    document.getElementById("masterIconoBio").src = "Imagenes/Enrolamiento.png";
    document.getElementById("masterIconoDigitalizacion").src = "Imagenes/Digitalización.png";
    document.getElementById("masterProgreso").src = "Imagenes/Progress Bar 50.png";

    DWObject = Dynamsoft.WebTwainEnv.GetWebTwain('dwtPreviewPages');
    if (DWObject) {
        DWObjectLargeViewer = Dynamsoft.WebTwainEnv.GetWebTwain('dwtlargePreview');
        DWObjectLargeViewer.SetViewMode(-1, -1);
        DWObjectLargeViewer.MaxImagesInBuffer = 1;
        DWObject.SetViewMode(3, 1);

        var count = DWObject.SourceCount;
        var foundScannertarget = false;
        for (var i = 0; i < count; i++) {
            var nombreScanner = DWObject.GetSourceNameItems(i);
            var n = nombreScanner.indexOf("KODAK");
            var serNo = nombreScanner.indexOf("1150");

            if (serNo == -1) {
                serNo = nombreScanner.indexOf("i1100");
            }

            var WIA = nombreScanner.indexOf("WIA");


            if (n >= 0 && serNo >= 0 && WIA == -1) {

                sourceid = i;
                foundScannertarget = true;
                break;
            }
        }

        if (foundScannertarget == true) {

        }
        else {
            alert('No se econtró el scanner Kodak');
        }

        if (Dynamsoft.Lib.env.bMac)
            DWObject.Addon.Barcode.Download(AppPath + 'Resources/addon/MacBarcode.zip');
        else {
            DWObject.Addon.Barcode.Download(AppPath + 'Resources/addon/Barcode.zip');
        }

        DWObject.Addon.OCRPro.Download(AppPath + 'Resources/addon/OCRPro.zip',
            function () {/*console.log('OCR dll is installed');*/ },
            function (errorCode, errorString) {
                console.log(errorString);
            }
        );

    }
    _iTop = 0;
    _iLeft = 0;
    _iRight = 0;
    _iBottom = 0;
    _iTopOUT = 0;
    _iLeftOUT = 0;
    _iRightOUT = 0;
    _iBottomOUT = 0;
    DWObject.RegisterEvent("OnPostTransfer", Dynamsoft_OnPostTransfer);
    DWObject.RegisterEvent("OnPostLoad", Dynamsoft_OnPostLoadfunction);
    DWObject.RegisterEvent("OnPostAllTransfers", Dynamsoft_OnPostAllTransfers);
    DWObject.RegisterEvent("OnMouseClick", Dynamsoft_OnMouseClick);
    DWObjectLargeViewer.RegisterEvent("OnImageAreaSelected", Dynamsoft_OnImageAreaSelected);
    DWObjectLargeViewer.RegisterEvent("OnImageAreaDeSelected", Dynamsoft_OnImageAreaDeselected);
    DWObject.RegisterEvent("OnTopImageInTheViewChanged", Dynamsoft_OnTopImageInTheViewChanged);

    updatePageInfo();
    //runAcquire();
    //Cargar();

}

function runAcquire() {
    var count = DWObject.SourceCount;
    var foundScannertarget = false;
    for (var i = 0; i < count; i++) { //Aqui se busca que tenga instalado el scanner kodak i1150
        var nombreScanner = DWObject.GetSourceNameItems(i);
        var n = nombreScanner.indexOf("KODAK");
        var serNo = nombreScanner.indexOf("1150");

        if (serNo == -1) {
            serNo = nombreScanner.indexOf("i11");
        }
        var WIA = nombreScanner.indexOf("WIA");

        if (n >= 0 && serNo >= 0 && WIA == -1) {

            sourceid = i;
            foundScannertarget = true;
            break;
        }

    }

    if (foundScannertarget == true) {
        document.getElementById('waiting').style.display = 'inline-block';
        document.getElementById('txtProcessing').innerText = 'Digitalizando...';
        AcquireImage();
        document.getElementById('iGuardar').addEventListener("click", changeUrlFunction, false);
    }
    else {
        alert('No se econtró el scanner Kodak ');
    }
}

function changeUrlFunction() {
    window.location.href = "ContractForm.aspx";
}

function AcquireImage() {

    if (DWObject) {
        if (DWObject.HowManyImagesInBuffer >= 0) {
            DWObject.RemoveAllImages();
            DWObjectLargeViewer.RemoveAllImages();
            document.getElementById('results').innerText = '';
        }

        DWObject.OpenSource();

        DWObject.SelectSourceByIndex(sourceid);
        DWObject.IfAutoBright = true;
        DWObject.IfShowUI = false;
        DWObject.Resolution = ResolutionTarget; //resolucion

        DWObject.IfDuplexEnabled = false; //no escanea por ambos lados de la hoja

        DWObject.PixelType = 2; //color, perfecto para OCR

        DWObject.IfAutoDiscardBlankpages = true;
        DWObject.Capability = EnumDWT_Cap.ICAP_AUTODISCARDBLANKPAGES; //descarta paginas en blanco
        DWObject.CapType = EnumDWT_CapType.TWON_ONEVALUE;
        DWObject.IfDisableSourceAfterAcquire = true;

        DWObject.AcquireImage(OnAcquireImageSuccess, OnAcquireImageFailure);
    }
}

function OnAcquireImageSuccess() {
    console.log("On Acquire Image Success.");
    GetOCRProInfoInnerA();
    document.getElementById('waiting').style.display = 'inline-block';
    document.getElementById('txtProcessing').innerText = 'Digitalizando...';
}

function OnAcquireImageFailure() {
    document.getElementById('waiting').style.display = 'none';
}

//simula la digitalizacion :) 
document.getElementById("btnGetOCR").onclick = Cargar;
function Cargar() {

    //console.log("Cargando imágenes.");
    //if (DWObject.HowManyImagesInBuffer >= 0) {
    //    DWObject.RemoveAllImages();
    //    DWObjectLargeViewer.RemoveAllImages();
    //}

    //DWObject.IfShowFileDialog = false;
    ////Aqui se cargan imagenes
    //DWObject.LoadImage("C:\\Users\\juan.gonzalez\\Desktop\\img\\001.jpg");
    //console.log("LoadImage 001." + DWObject.HowManyImagesInBuffer);
    //DWObject.LoadImage("C:\\Users\\juan.gonzalez\\Desktop\\img\\002.jpg");
    //console.log("LoadImage 002." + DWObject.HowManyImagesInBuffer);
    //DWObject.LoadImage("C:\\Users\\juan.gonzalez\\Desktop\\img\\003.jpg", LoadSuccess, LoadError); // es async
    //console.log("LoadImage 003." + DWObject.HowManyImagesInBuffer);
    //document.getElementById('waiting').style.display = 'inline-block';
    //document.getElementById('txtProcessing').innerText = 'Digitalizando...';
    runAcquire();

}

function LoadSuccess() {

    console.log("Load Success.");
    updatePageInfo();
    DoOCRInner();
    document.getElementById('waiting').style.display = 'inline-block';
    document.getElementById('txtProcessing').innerText = 'Procesando documento 1...';

}

function LoadError() {
    console.log("Load Error.");
    document.getElementById('waiting').style.display = 'none';
}

var indexImage = 0;

function DoOCRInner() {
    console.log("Doc OCR Inner.");
    indOCR = 0;
    console.log(DWObject.HowManyImagesInBuffer);
    if (DWObject) {
        if (DWObject.HowManyImagesInBuffer == 0) {
            alert("No se ha digitalizado o cargado una imagen.");
            return;
        }

        document.getElementById('waiting').style.display = 'inline-block';
        document.getElementById('txtProcessing').innerText = 'Procesando documento 1...';
        var numImages = DWObject.HowManyImagesInBuffer;
        indexImage = -1;
        doOCR();

    }
}

function saveImage(index, documentType) {
    var imagedata;
    DWObject.SelectedImagesCount = 1;
    DWObject.SetSelectedImageIndex(0, index);
    DWObject.GetSelectedImagesSize(EnumDWT_ImageType.IT_JPG);
    imagedata = DWObject.SaveSelectedImagesToBase64Binary();

    $.ajax({
        type: 'POST',
        async: true,
        contentType: 'application/json; charset=utf-8',
        data: '{idFile: "' + 31416 + '", documentType: "' + documentType + '", imageArray: "' + imagedata + '" }',
        url: AppPath + 'Scanning.aspx/saveFile',
        dataType: 'json',
        success: function (response) {

        },
        error: function (a, b, c) {
            alert(c);
        }
    });


}

function doOCR() {
    console.log("do OCR");
    indexImage = indexImage + 1;
    document.getElementById('txtProcessing').innerText = 'Procesando documento  ' + (indexImage + 1) + '...';
    var xi = 1066.73; //CFE
    var yi = 445.52;
    var xf = 1464.04;
    var yf = 555.33;

    var settings = Dynamsoft.WebTwain.Addon.OCRPro.NewSettings();
    var bMultipage = false;

    settings.Languages = "eng";
    settings.RecognitionModule = EnumDWT_OCRProRecognitionModule.OCRPM_MOSTACCURATE;
    settings.OutputFormat = EnumDWT_OCRProOutputFormat.OCRPFT_TXTS;

    DWObject.Addon.OCRPro.Settings = settings;


    if (xi != 0 || yi != 0 || xf != 0 || yf != 0) {

        var zoneArray = [];
        var zone = Dynamsoft.WebTwain.Addon.OCRPro.NewOCRZone(xi, yi, xf, yf);
        zoneArray.push(zone);

        var alpha = DWObject.Addon.OCRPro.RecognizeRect(indexImage, zoneArray, GetRectOCRProInfo);
    }
}

function GetRectOCRProInfo(sImageIndex, aryZone, result) {
    return GetOCRProInfoInnerA(result);
}

var arrayResults = [];

function GetOCRProInfoInnerA(result) {
    console.log("Get OCR Pro Info Inner A");
    if (result == null)
        return null;

    var pageCount = result.GetPageCount();
    if (pageCount == 0) {
        var numImages = DWObject.HowManyImagesInBuffer;
        if (numImages == indexImage + 1) {
            document.getElementById('waiting').style.display = 'none';

        }
        else {
            doOCR();
        }
    } else {

        var bRet = "";
        for (var i = 0; i < pageCount; i++) {
            var page = result.GetPageContent(i);
            var letterCount = page.GetLettersCount();
            for (var n = 0; n < letterCount; n++) {
                var letter = page.GetLetterContent(n);
                bRet += letter.GetText();
            }
        }

        var clearString = removeSpecial(bRet);
        var dateOCR = '';
        var documentType = '';
        var dateBarcode = '';
        var confirmDocumentType = '';
        var found = false;
        $.ajax({
            type: 'POST',
            async: false,
            url: AppPath + 'Scanning.aspx/processTextOCR',
            data: '{ ocr: "' + clearString + '" }',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function (response) {
                Obj = response;
                var r = parseJSON(Obj.d);
                dateOCR = r.dateFoundOCR;
                documentType = r.documentType;

                var Objeto = DWObject.Addon.Barcode.Read(indexImage, BarcodeInfo[1].val);

                if (Objeto.GetContent.length >= 1) {
                    dateBarcode = Objeto.GetContent(0);
                    if (dateBarcode.length == 30) {
                        confirmDocumentType = 'CFE';
                        dateBarcode = dateBarcode.substring(20, 14);
                        found = true;
                    }
                    else {
                        dateBarcode = '';
                        if (documentType == 'CFE') {
                            found = true;
                        }
                    }
                }

                ProcessFirstResult(dateOCR, dateBarcode, found, documentType);

            },
            error: function (xhr, textStatus, errorThrown) {
                alert('Error en response AJAX - ' + xhr.responseText);
            }
        });

    }

}

function ProcessFirstResult(dateOCR, dateBarcode, found, type) {  //escribe resultados
    console.log("Process First Result.");
    if (found == true) {
        saveImage(indexImage, type);
        renderDataFound(indexImage, dateOCR, dateBarcode, type);
        var numImages = DWObject.HowManyImagesInBuffer;
        if (numImages == indexImage + 1) {
            document.getElementById('waiting').style.display = 'none';
        }
        else {
            doOCR();
        }
    }
    else {
        runOCRTelmex(); //prueba si es telmex
    }
}

function runOCRTelmex() {

    var xi = 1244; //TELMEX
    var yi = 239;
    var xf = 1955;
    var yf = 306;
    var numImages = DWObject.HowManyImagesInBuffer;

    var settings = Dynamsoft.WebTwain.Addon.OCRPro.NewSettings();
    var bMultipage = false;

    settings.Languages = "eng";
    settings.RecognitionModule = EnumDWT_OCRProRecognitionModule.OCRPM_MOSTACCURATE;
    settings.OutputFormat = EnumDWT_OCRProOutputFormat.OCRPFT_TXTS;

    DWObject.Addon.OCRPro.Settings = settings;

    if (xi != 0 || yi != 0 || xf != 0 || yf != 0) {

        var zoneArray = [];
        var zone = Dynamsoft.WebTwain.Addon.OCRPro.NewOCRZone(xi, yi, xf, yf);
        zoneArray.push(zone);

        DWObject.Addon.OCRPro.RecognizeRect(indexImage, zoneArray,
            GetRectOCRProTELMEX,
            errorOCRTelmex);
    }

}

function errorOCRTelmex() {
    var numImages = DWObject.HowManyImagesInBuffer;
    if (numImages == indexImage + 1) {
        document.getElementById('waiting').style.display = 'none';
    }
    else {
        doOCR();
    }
}

function GetRectOCRProTELMEX(sImageIndex, aryZone, result) {
    return GetOCRProInfoInnerTELMEX(result);
}

function GetOCRProInfoInnerTELMEX(result) {
    if (result == null)
        return null;

    var pageCount = result.GetPageCount();
    if (pageCount == 0) {

        var numImages = DWObject.HowManyImagesInBuffer;
        if (numImages == indexImage + 1) {
            document.getElementById('waiting').style.display = 'none';

        }
        else {
            doOCR();
        }

    } else {

        var bRet = "";
        for (var i = 0; i < pageCount; i++) {
            var page = result.GetPageContent(i);
            var letterCount = page.GetLettersCount();
            for (var n = 0; n < letterCount; n++) {
                var letter = page.GetLetterContent(n);
                bRet += letter.GetText();
            }
        }

        var clearString = removeSpecial(bRet);
        var dateOCR = '';
        var documentType = '';
        var dateBarcode = '';
        var confirmDocumentType = '';
        var found = false;
        $.ajax({
            type: 'POST',
            async: false,
            url: AppPath + 'Scanning.aspx/processTextOCRTELMEX',
            data: '{ ocr: "' + clearString + '" }',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function (response) {
                Obj = response;
                var r = parseJSON(Obj.d);
                dateOCR = r.dateFoundOCR;
                documentType = r.documentType;

                if (documentType == "TELMEX") {
                    found = true;
                }

                processSecondResult(dateOCR, 'NA', found, documentType);
            },
            error: function (xhr, textStatus, errorThrown) {
                alert('Error en response AJAX - ' + xhr.responseText);
            }
        });
    }
}

function processSecondResult(dateOCR, dateBarcode, found, type) { //escribe resultados
    if (type == "TELMEX") {
        renderDataFound(indexImage, dateOCR, dateBarcode, type);
        saveImage(indexImage, type);
        var numImages = DWObject.HowManyImagesInBuffer;
        if (numImages == indexImage + 1) {
            document.getElementById('waiting').style.display = 'none';

        }
        else {
            doOCR();
        }
    }
    else {
        var numImages = DWObject.HowManyImagesInBuffer;
        if (numImages == indexImage + 1) {
            document.getElementById('waiting').style.display = 'none';


        }
        else {
            doOCR();
        }
    }
}

function renderDataFound(index, value, BC, type) {

    var d = document.createElement('div');
    document.getElementById('results').appendChild(d);
    var label = document.createElement('label');
    d.appendChild(label);
    var i = document.createElement('input');
    var i2 = document.createElement('input');
    var i3 = document.createElement('input');
    d.appendChild(i);

    var lblBC = document.createElement('label');
    var lblType = document.createElement('label');
    d.appendChild(lblBC);
    d.appendChild(i2);
    d.appendChild(lblType);
    d.appendChild(i3);
    i.setAttribute("id", "txtResult" + index);
    i.setAttribute("class", "txt");
    i.setAttribute("value", value);

    i2.setAttribute("id", "BCResult" + index);
    i2.setAttribute("class", "txt");
    i2.setAttribute("style", "width:75px;");
    i2.setAttribute("value", BC);

    i3.setAttribute("id", "TypeResult" + index);
    i3.setAttribute("class", "txt");
    i3.setAttribute("style", "width:75px;");
    i3.setAttribute("value", type);

    label.innerHTML = 'Documento ' + (index + 1).toString() + ' - Fecha OCR:';
    lblBC.innerHTML = 'Código de barras:';
    lblType.innerHTML = 'Tipo:';

}

//NO se usa
function getFullOCR() {

    var xi = 1066.73;
    var xf = 445.52;
    var yi = 1464.04;
    var yf = 555.33;

    indOCR = 0;
    if (DWObject) {

        var numImages = DWObject.HowManyImagesInBuffer;
        for (var i = 0; i < numImages; i++) {


            var settings = Dynamsoft.WebTwain.Addon.OCRPro.NewSettings();
            var bMultipage = false;
            settings.Languages = "eng";

            settings.RecognitionModule = EnumDWT_OCRProRecognitionModule.OCRPM_MOSTACCURATE;
            settings.OutputFormat = EnumDWT_OCRProOutputFormat.OCRPFT_TXTS;

            DWObject.Addon.OCRPro.Settings = settings;

            var zoneArray = [];
            var zone = Dynamsoft.WebTwain.Addon.OCRPro.NewOCRZone(xi, xf, yi, yf);
            zoneArray.push(zone);


            DWObject.Addon.OCRPro.Download("http://localhost:62661/Resources/addon/OCRPro.zip",
                function () {
                    document.getElementById('txtProcessing').innerText = 'Procesando documento 1...';

                    DWObject.Addon.OCRPro.RecognizeRect(i, zoneArray,
                        function (index, result) { GetOCRProInfoInnerZone(result); },
                        function (errorCode, errorString, result) { alert('Error en Recognize - ' + errorString); });

                    //DWObject.Addon.OCRPro.Recognize(i,
                    //    function (index, result) { GetOCRProInfoInner(result); },
                    //    function (errorCode, errorString, result) { alert('Error en Recognize - ' + errorString); });
                }, function (errorCode, errorString) { alert('Error en Download - ' + errorString); });


            //DWObject.Addon.OCRPro.Download("http://localhost:62661/Resources/addon/OCRPro.zip",
            //    function () {
            //        document.getElementById('txtProcessing').innerText = 'Procesando documento 1...';
            //        DWObject.Addon.OCRPro.Recognize(i,
            //            function (index, result) { GetOCRProInfoInner(result); },
            //            function (errorCode, errorString, result) { alert('Error en Recognize - ' + errorString); });
            //    }, function (errorCode, errorString) { alert('Error en Download - ' + errorString); });


        }

    }
}
//NO se usa
function GetOCRProInfoInnerZone(result) {

    if (result == null)
        return null;
    var pageCount = result.GetPageCount();
    if (pageCount == 0) {
        alert("OCR result is Empty.");
        return;
    } else {
        var bRet = "";
        for (var i = 0; i < pageCount; i++) {
            var page = result.GetPageContent(i);

            var letterCount = page.GetLettersCount();
            for (var n = 0; n < letterCount; n++) {
                var letter = page.GetLetterContent(n);
                bRet += letter.GetText();
            }
        }

        var clearString = removeSpecial(bRet);


        renderDataFound(0, clearString);
        document.getElementById('waiting').style.display = 'none';
    }
}
//NO se usa
function GetOCRProInfoInner(result) {


    if (result == null)
        return null;
    var pageCount = result.GetPageCount();
    if (pageCount == 0) {
        alert("OCR result is Empty.");
        return;
    } else {
        var bRet = "";
        for (var i = 0; i < pageCount; i++) {
            var page = result.GetPageContent(i);

            var letterCount = page.GetLettersCount();
            for (var n = 0; n < letterCount; n++) {
                var letter = page.GetLetterContent(n);
                bRet += letter.GetText();
            }
        }

        var clearString = removeSpecial(bRet);

        $.ajax({
            type: 'POST',
            async: true,
            url: './Scanning.aspx/processTextOCR',
            data: '{ result: "' + clearString + '" }',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function (response) {
                Obj = response;
                var r = parseJSON(Obj.d);
                var textclean = r.dateFound;
                renderDataFound(indOCR, textclean);
                var numImages = DWObject.HowManyImagesInBuffer;
                if (numImages == indOCR + 1) {
                    document.getElementById('waiting').style.display = 'none';
                    indOCR = 0;
                }
                else {
                    indOCR++;
                    document.getElementById('txtProcessing').innerText = 'Procesando documento ' + (indOCR + 1) + '...';

                }


            },
            error: function (xhr, textStatus, errorThrown) {
                alert('Error en response AJAX - ' + xhr.responseText);
                document.getElementById('waiting').style.display = 'none';
            }
        });

    }
    //if (savePath.length > 1)
    //    //Save the file on the local machine, savePath is an absolute path on the local disk
    //    result.Save(savePath);
}

function isNumber(text) {
    reg = new RegExp('[0-9]+$');
    if (text) {
        return reg.test(text);
    }
    return false;
}

function removeSpecial(text) {
    if (text) {
        var lower = text.toLowerCase();
        var upper = text.toUpperCase();
        var result = "";
        for (var i = 0; i < lower.length; ++i) {
            if (text[i] == '-' || isNumber(text[i]) || (lower[i] != upper[i]) || (lower[i].trim() === '')) {
                if (text[i] == '-') {
                    result += ' ';
                }
                else {
                    result += text[i];
                }


            }
        }
        return result;
    }
    return '';
}

function closeViewer() {
    document.getElementById('largePreview').style.display = 'none';
}

function OnSuccess() {

    console.log('successful');
}

function OnFailure(errorCode, errorString) {
    alert(errorString);
}

function checkIfImagesInBuffer() {
    if (DWObject.HowManyImagesInBuffer == 0) {

        return false;
    }
    else
        return true;
}

function OnHttpUploadFailure(errorCode, errorString, sHttpResponse) {
    //alert(errorString + sHttpResponse);
}


function btnRotateLeft_onclick() {

    DWObjectLargeViewer.RotateLeft(DWObjectLargeViewer.CurrentImageIndexInBuffer);

}

function btnRotateRight_onclick() {
    DWObjectLargeViewer.RotateRight(DWObjectLargeViewer.CurrentImageIndexInBuffer);
}

function btnFirstImage_onclick() {
    if (!checkIfImagesInBuffer()) {
        return;
    }
    DWObject.CurrentImageIndexInBuffer = 0;
    updatePageInfo();
    updateLargeViewer();
}

function btnPreImage_onclick() {
    if (!checkIfImagesInBuffer()) {
        return;
    }
    else if (DWObject.CurrentImageIndexInBuffer == 0) {
        return;
    }
    DWObject.CurrentImageIndexInBuffer = DWObject.CurrentImageIndexInBuffer - 1;
    updatePageInfo();
    updateLargeViewer();
}

function btnNextImage_onclick() {
    if (!checkIfImagesInBuffer()) {
        return;
    }
    else if (DWObject.CurrentImageIndexInBuffer == DWObject.HowManyImagesInBuffer - 1) {
        return;
    }
    DWObject.CurrentImageIndexInBuffer = DWObject.CurrentImageIndexInBuffer + 1;
    updatePageInfo();
    updateLargeViewer();
}

function btnLastImage_onclick() {
    if (!checkIfImagesInBuffer()) {
        return;
    }
    DWObject.CurrentImageIndexInBuffer = DWObject.HowManyImagesInBuffer - 1;
    updatePageInfo();
    updateLargeViewer();
}

function updatePageInfo() {
    console.log("Update Page Info.");
    document.getElementById("txtpT").value = DWObject.HowManyImagesInBuffer;
    document.getElementById("txtpA").value = DWObject.CurrentImageIndexInBuffer + 1;
    if (DWObject.HowManyImagesInBuffer == 0) {
        document.getElementById("txtpA").value = '0';

    }
}

function btnRemoveAllImages_onclick() {
    if (!checkIfImagesInBuffer()) {
        return;
    }
    DWObject.RemoveAllImages();

}

function Dynamsoft_OnPostTransfer() {

    updatePageInfo();


}

function Dynamsoft_OnPostLoadfunction(path, name, type) {

    updatePageInfo();
}

function Dynamsoft_OnPostAllTransfers() {
    console.log("Dynamsoft_OnPostAllTransfers.");
    updatePageInfo();
    DoOCRInner();
    //GetOCRProInfoInnerA();//modificación

}

function Dynamsoft_OnMouseClick(index) {
    //lanza el visor     
    document.getElementById('largePreview').style.display = 'inline-block';
    updatePageInfo();
    updateLargeViewer();
}

function updateLargeViewer() { //al dar clic en los visores pequeños abre el visor grande
    DWObject.CopyToClipboard(DWObject.CurrentImageIndexInBuffer);
    DWObjectLargeViewer.LoadDibFromClipboard();
}

function Dynamsoft_OnMouseRightClick(index) {

}


function Dynamsoft_OnImageAreaSelected(index, left, top, right, bottom) {
    _iLeft = left;
    _iTop = top;
    _iRight = right;
    _iBottom = bottom;
}

function Dynamsoft_OnImageAreaSelectedOUT(index, left, top, right, bottom) {
    _iLeftOUT = left;
    _iTopOUT = top;
    _iRightOUT = right;
    _iBottomOUT = bottom;
}

function Dynamsoft_OnImageAreaDeselected(index) {
    _iLeft = 0;
    _iTop = 0;
    _iRight = 0;
    _iBottom = 0;
}

function Dynamsoft_OnImageAreaDeselectedOUT(index) {
    _iLeftOUT = 0;
    _iTopOUT = 0;
    _iRightOUT = 0;
    _iBottomOUT = 0;
}


function Dynamsoft_OnMouseDoubleClick() {
    return;
}

function Dynamsoft_OnTopImageInTheViewChanged(index) {
    _iLeft = 0;
    _iTop = 0;
    _iRight = 0;
    _iBottom = 0;
    DWObject.CurrentImageIndexInBuffer = index;
    updatePageInfo();
}

function Dynamsoft_OnGetFilePath(bSave, count, index, path, name) {
}


function MouseScroll(evt) {
    var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
    if (document.attachEvent)
        document.attachEvent("on" + mousewheelevt, NavigateImages);
    else if (document.addEventListener);
    document.addEventListener(mousewheelevt, NavigateImages, false)
}

function NavigateImages(e) {

    evt = window.event || e;
    var delta = evt.detail ? evt.detail * (-120) : evt.wheelDelta;
    if (delta < 0)
        btnNextImage_wheel();
    else if (delta > 0)
        btnPreImage_wheel();
}

function btnPreImage_wheel() {
    if (DWObject.HowManyImagesInBuffer != 0)
        btnPreImage_onclick()
}

function btnNextImage_wheel() {
    if (DWObject.HowManyImagesInBuffer != 0)
        btnNextImage_onclick()
}


function stopWheel(evt) {
    if (!evt) { /* IE7, IE8, Chrome, Safari */
        evt = window.event;
    }
    if (evt.preventDefault) { /* Chrome, Safari, Firefox */
        var ret = evt.preventDefault();
    }
    evt.returnValue = false; /* IE7, IE8 */
}

function btnZoomin_onclick() {

    DWObjectLargeViewer.Zoom = DWObjectLargeViewer.Zoom * 1.5;
}

function btnZoominOUT_onclick() {
    DWObjectLargeViewer.Zoom = DWObjectLargeViewer.Zoom * 1.5;
}

function btnZoomout_onclick() {

    DWObjectLargeViewer.Zoom = DWObjectLargeViewer.Zoom * 0.5;
}

function btnZoomoutOUT_onclick() {
    DWObjectLargeViewer.Zoom = DWObjectLargeViewer.Zoom * 0.5;
}
function parseJSON(data) {
    return window.JSON && window.JSON.parse ? window.JSON.parse(data) : (new Function("return " + data))();
}

//$('#DWTcontainer').hover(function () {
//    $(document).bind('mousewheel DOMMouseScroll', function (event) {
//        stopWheel(event);
//    });
//}, function () {
//    $(document).unbind('mousewheel DOMMouseScroll');
//});
