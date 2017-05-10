 $(document).ready(function() {

 	 	
			//agreamos efecto de mouseover y muse out para capturas duales
		//PULGARES

		$(".f1 , .f6").mouseover(function() {
			fPosition = "";//cambio L&F
    		instruction = "";//cambio L&F
								$(".f1").removeClass("pulse");
								$(".f6").removeClass("pulse");

								if(!isAbsenceDefined(6) && !isFingerCaptured(6) )
								{
									$(".f6").css("background-color","rgb(38, 19, 239)");
									fPosition +="6";//cambio L&F
								}	
								if(!isAbsenceDefined(1) && !isFingerCaptured(1) )
								{

									$(".f1").css("background-color","rgb(38, 19, 239) ");
									fPosition +="1";//cambio L&F
								}
								
								instruction += getDescription(parseInt(fPosition));//cambio L&F
								$("#pulseInstruction").text("Haz click para capturar "+ instruction);//cambio L&F
								
							  })
							  .mouseout(function() {

							  	$("#pulseInstruction").text("");

								if(!isAbsenceDefined(1) && !isFingerCaptured(1) )
								if($(".f1").hasClass( "no-captured-turn" ))
									$(".f1").addClass("pulse");
								else if($(".f1").hasClass( "no-captured" ))
									$(".f1").css("background-color","rgba(38, 19, 239, 0.3)");
									
								if(!isAbsenceDefined(6) && !isFingerCaptured(6) )
								if($(".f6").hasClass( "no-captured-turn" ))
									$(".f6").addClass("pulse");
									
								else if($(".f6").hasClass( "no-captured" ))
									$(".f6").css("background-color","rgba(38, 19, 239, 0.3)");

								$("#pulseInstruction").text("");//cambio L&F
							  });
							  
		$(".f2 , .f3").mouseover(function() {
			fPosition = "";
    		instruction = "";
								$(".f2").removeClass("pulse");
								$(".f3").removeClass("pulse");
								if(!isAbsenceDefined(2) && !isFingerCaptured(2) )
								{
									$(".f2").css("background-color","rgb(38, 19, 239)");
									 fPosition +="2";
								}
								if(!isAbsenceDefined(3) && !isFingerCaptured(3) )
								{
									$(".f3").css("background-color","rgb(38, 19, 239)");
									 fPosition +="3 ";
								}

								instruction += getDescription(parseInt(fPosition));
								$("#pulseInstruction").text("Haz click para capturar "+ instruction);
								
							  })
							  .mouseout(function() {

							  	$("#pulseInstruction").text("");

								if(!isAbsenceDefined(2) && !isFingerCaptured(2) )
								if($(".f2").hasClass( "no-captured-turn" ))
									$(".f2").addClass("pulse");
								else if($(".f2").hasClass( "no-captured" ))
									$(".f2").css("background-color","rgba(38, 19, 239, 0.3)");
									
								if(!isAbsenceDefined(3) && !isFingerCaptured(3) )
								if($(".f3").hasClass( "no-captured-turn" ))
									$(".f3").addClass("pulse");
									
								else if($(".f3").hasClass( "no-captured" ))
									$(".f3").css("background-color","rgba(38, 19, 239, 0.3)");
							  });
							  
		$(".f7 , .f8").mouseover(function() {
			fPosition = "";
    		instruction = "";
								$(".f7").removeClass("pulse");
								$(".f8").removeClass("pulse");
								if(!isAbsenceDefined(8) && !isFingerCaptured(8) )
								{
									$(".f8").css("background-color","rgb(38, 19, 239)");
									fPosition +="8";
								}
								if(!isAbsenceDefined(7) && !isFingerCaptured(7) )
								{
									$(".f7").css("background-color","rgb(38, 19, 239)");
									fPosition +="7";
								}

								instruction += getDescription(parseInt(fPosition));
								$("#pulseInstruction").text("Haz click para capturar "+ instruction);
								
								
							  })
							  .mouseout(function() {

							  	$("#pulseInstruction").text("");

								if(!isAbsenceDefined(7) && !isFingerCaptured(7) )
								if($(".f7").hasClass( "no-captured-turn" ))
									$(".f7").addClass("pulse");
								else if($(".f7").hasClass( "no-captured" ))
									$(".f7").css("background-color","rgba(38, 19, 239, 0.3)");
									
								if(!isAbsenceDefined(8) && !isFingerCaptured(8) )
								if($(".f8").hasClass( "no-captured-turn" ))
									$(".f8").addClass("pulse");
									
								else if($(".f8").hasClass( "no-captured" ))
									$(".f8").css("background-color","rgba(38, 19, 239, 0.3)");
							  });
		
		$(".f4 , .f5 ,.f9 , .f10").mouseover(function() {
    		instruction = "";

    		
								$(this).removeClass("pulse");
								var class_ = $(this).attr("class");
								var id= class_.substring(class_.indexOf("f")+1,class_.indexOf(" "));
								if(!isAbsenceDefined(id) && !isFingerCaptured(id) )
									$(this).css("background-color","rgb(38, 19, 239)");

								instruction += getDescription(parseInt(id));
								$("#pulseInstruction").text("Haz click para capturar "+ instruction);

							  })
							  .mouseout(function() {
								var class_ = $(this).attr("class");
								var id= class_.substring(class_.indexOf("f")+1,class_.indexOf(" "));
								if(!isAbsenceDefined(id) && !isFingerCaptured(id) )
								if($(this).hasClass( "no-captured-turn" ))
									$(this).addClass("pulse");
								else if( $(this).hasClass( "no-captured" ))
									$(this).css("background-color","rgba(38, 19, 239, 0.3)");


								$("#pulseInstruction").text("");
							  });
		
		
		});