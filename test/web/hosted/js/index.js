var uAg = navigator.userAgent.toLowerCase();
var isMobile = !!uAg.match(/android|iphone|ipad|ipod|blackberry|symbianos/i);	
	
	var keyStore = null;
	var ssls = null;
	var userId = null;
	var userConnected = null;
	var keyRequest =null;
	var currentKey = null;
	var jwt = null;
	var otp = null;
	
	var deviceId = null;
	var deviceDescription = null;
	var deviceCharacteristics = null;
	var identified = false;
	
	function start(conf){
		config = conf;
		ssls = new SSLSignature(config.apiUrl, config.accountId, config.apiKey,config.tokenType);
		console.log ("Create sslsignature service agent url:"+config.apiUrl+ " accountId:"+config.accountId+ " "+config.apiKey);
	}
	
	$(document).ready(function(){
		
		//Evita que IE11 cachee peticiones
		$.ajaxSetup({ cache: false })
	
		//$('.modificable').on('change input',initRequest);
		//$('#abortButton').hide();	
				
		$('#showOnlyActive').change(function() {
			listDevices(userId);
		});
		otp = getGetParam('otp');
		var browserInfo = getBrowserInfo();
		deviceDescription = browserInfo.name+ " "+browserInfo.version+ "("+navigator.platform+")";
		deviceCharacteristics = navigator.userAgent;
		/*
		new Fingerprint2().get(function(result){
			console.log("deviceId:"+ result);
			deviceId = result;
		});
		*/
		console.log ("deviceDescription: "+deviceDescription);
		console.log ("deviceCharacteristics: "+deviceCharacteristics);
	});
	
	/////////////////////
	////////	SSO METHODS
	/////////////////////
	function onIdentification(operation){
		console.log("SSO PAGE onIdentification");
		identificationPerformed({AuthenticationOperation:operation});
		identified = true;
	}
	function onLoad(){
		console.log("SSO PAGE onLoad");
		if (!identified){
			if (otp){
				recoverFailedIdentification (otp);
			} else {
				configureForm('notidentified');
			}
		}	
	}
	function onLogout(){
		console.log("SSO PAGE onLogout");
		configureForm('notidentified');
	}
	
		/////////////////////
	////////	
	/////////////////////
	
	function configureForm(mode){
		if (mode == 'notidentified'){
			$('#notIdentified').show();
			$('#identified').hide();
			$("#logged").hide();

		}else if (mode == 'identificationFailed'){
			$('#notIdentified').hide();
			$('#identified').show();
			$('#idOk').hide();
			$('#idFailed').show();
			$("#logged").hide();
			
		}else if (mode == 'notregistered'){
			$('#notIdentified').hide();
			$('#identified').show();
			$('#idOk').show();
			$('#idFailed').hide();
			$("#logged").hide();
			
		}  else if (mode =='logged'){
			$('#notIdentified').hide();
			$('#identified').hide();
			$("#logged").show();
			$("#newDevice").show();	
			$("#registeredDevice").hide();	
			$("#signedTransaction").hide();
		} else if (mode =='registeredDevice'){
			$('#notIdentified').hide();
			$('#identified').hide();
			$("#logged").show();
			$("#newDevice").hide();	
			$("#registeredDevice").show();	
			$("#signedTransaction").show();
		}	
	}
	
	function recoverFailedIdentification(otp){
		console.log("Identification failed. OTP with description = "+otp)
		ssls.login(otp).then(function (obj){
			identificationPerformed(obj);
		}).catch (function (result){
			console.log(result);
			configureForm('notidentified');
		});
	}
	
	
	function identificationPerformed(obj){
		console.log ("Identification performed with status: "+obj.AuthenticationOperation.status);
		//Muestra la información de la autenticación, sea correcta o no
		if (obj.AuthenticationOperation.status == 'SUCCESS') {
			var userId = obj.AuthenticationOperation.userId;
			var jwt = obj.AuthenticationOperation.jwt;
			if (jwt){
				console.log ("JWT: "+jwt);
			}
			
			infoSignature(obj);
			
			if (userId){
				console.log ("User registered with userId "+userId);
				configureForm('logged');
				
				login(userId, jwt,"JWT");
			} else {
				console.log ("User identified but not registered")
				configureForm('notregistered')
			}
			
		} else {
			console.log ("Identification failed: "+obj.AuthenticationOperation.error)
			infoSignature(obj);
			configureForm('identificationFailed');			
		}
		
		
	}
	
	function infoSignature(obj) {
		var status = obj.AuthenticationOperation.status;
		var error = "";		
		var infoSection ="";
		var alertClass = "";
	
		if  (status == "SUCCESS" || status=="UNKNOWN"){
			image = "<img src='img/checkmark.png'/>";
			status = "ID successful";
			alertClass = "alert alert-success well-sm";
		}else if  (status == "FAIL"){
			image = "<img src='img/no_entry.png'/>";
			status = "ID fail "+obj.AuthenticationOperation.error;
			alertClass = "alert alert-danger well-sm";
		}
		status = status +" ("+obj.AuthenticationOperation.mode+") perfomed at "+obj.AuthenticationOperation.date;
		
		var nameInfo = "Name: "+obj.AuthenticationOperation.name;
		if (obj.AuthenticationOperation.phone){
			nameInfo = nameInfo + " Phone: "+obj.AuthenticationOperation.phone;
		}
		if (obj.AuthenticationOperation.email){
			nameInfo = nameInfo +" Email: "+obj.AuthenticationOperation.email ;
		}
		if (obj.AuthenticationOperation.nif){
			idInfo = obj.AuthenticationOperation.nif;
		} else if (obj.AuthenticationOperation.eIdentifier){
			idInfo = obj.AuthenticationOperation.eIdentifier;
		} else if (obj.AuthenticationOperation.eidentifier){
			idInfo = obj.AuthenticationOperation.eidentifier;
		} else {
			idInfo = "";
		}
		
		jwtInfo = "JWT: "+obj.AuthenticationOperation.jwt;
		infoSection = 
			 "        <ul>"
			 +"          <li>ID: "+idInfo+"</li>"
		 	 +"          <li>"+nameInfo+"</li>"
		 	 +"          <li>"+jwtInfo+"</li>"
		 	 +"       </ul>";

		var section = "<div class='row'>"
						 +"   <div class='col-md-2'>"
						 +"      <span class='image'>"+image+"</span>"
						 +"    </div>"
						 +"    <div class='col-md-10'>"
						 +"      <h4>"+status+"</h4>"
						 +       infoSection
						 + "   </div>"
						 + "</div>";
		
		var text = $("<section id='identificationInfo'>"+section+"</section>");
		$('#identificationInfo').replaceWith(text);
	}
	
	
	
	
	function login (username,password,scheme){
		
		sslsUser = new SSLSignature(config.apiUrl,username,password,scheme);

		sslsUser.getUser().then (function(us){
			
			userConnected = us.User;
			userId = us.User.id;
			$("#pageTitle").html("Welcome to CryptoKeys, "+us.User.name+"!");
			
			console.log ("log user: "+userId);
			if (scheme != 'JWT'){
				
				//Autenticación basic, procedente de registro. Guardar token en SSO
				console.log(" Obtain JWT and store in  SSO localStorage");
				sslsUser.issueJWT(userId).then(function(jwtResponse){
					jwt = jwtResponse.JWT.data;
					console.log("Issued JWT token by server: "+jwt);
					//Guardar token en SSO
					sslssso.login(jwt);
					//Chequear claves				
					openCryptoKeyStore();
				}).catch (function (err){
					console.log(err);
					callFailed(err);
				});
			
			} else {
				//Chequear claves				
				openCryptoKeyStore();
			}
			
			return sslsUser.issueJWT(userId);
		}).then (function (jwtResponse){
			jwt = jwtResponse.JWT.data;
			console.log("Issued JWT token by server: "+jwt);
		}).catch (function (err){
			console.log(err);
			callFailed(err);
		});
		
	}
	
	function openCryptoKeyStore(){
		keyStore = new KeyStore();	
	    keyStore.open("CBKeyStore").then(function() {
	    	console.log ("KeyStore opened");
	    	//Buscamos si en el navegador hay una key asociada a la cuenta de usuario
	    	return keyStore.getKey("name",userId);
	    }).then (function (pkcs12Entry){
	    	console.log("Key exists. Validate with server signing and example text");
	    	validateCurrentKeyAndRequestIfNotValid(pkcs12Entry);
	    	
	    }).catch (function (err){
	    	console.log(err);
	    	console.log("Key does not exists. Enable button so user can request one");
	    	configureNewKeyForm();
	    	//requestAKey();
	    });
	}	
	
	
	
	function keyExists(pkcs12Entry){
		currentKey = pkcs12Entry;
		listDevices(userId);
		configureForm('registeredDevice');
    	window.location="#userAuthentication";
	}
	
	function requestAKey(){
		configureForm('logged');
		ssls.keyRequest(userConnected.id).then (function (kr){
			console.log ("key requested");
			keyRequest = kr;
			
		}).catch (function (err){
			console.log(err);
			var error = "No se ha podido solicitar una nueva clave privada";
			if (err && err.responseJSON ){
				error = error + ": "+err.responseJSON.error;
			} else if (err) {
				error = error + ": "+err.status+ "-"+err.statusText;
			}
			error = error + "\nCon este usuario no va a poder realizar operaciones. ¿Desea borrarlo y volver a registrarse?";
			
			if (confirm(error)) {
				ssls.deleteUser(userConnected.id).then (function (){
					console.log("User "+userConnected.id+" deleted");
					location.reload();
				}).catch (function (err){
					console.log("Error deleting user"+userConnected.id);
					location.reload();
				});
				
			} 
		});
	}	
	    
	function keyCreated(pkcs12Entry){
		currentKey = pkcs12Entry;
		configureForm('registeredDevice');
		listDevices(userId);
	}	

	function handleLogoutClick(){
		sslssso.logout();
	}
	function handleEnrollClick () {
		console.log("proceed to enroll ");
		//Genera un par de claves privada y pública
		var keys = forge.pki.rsa.generateKeyPair(1024);
					
		// convierte de Forge public key a formatos PEM y  DER para enviar a servidor. Esta parte sobraría con el envío de pkcs10, pero desde aquí es más fácil extraer cosas que en servidor. 
		var publicKeyPem = forge.pki.publicKeyToPem(keys.publicKey);
		var subjectPublicKeyInfo = forge.pki.publicKeyToAsn1(keys.publicKey);
		var publicKeyInfoDer = forge.asn1.toDer(subjectPublicKeyInfo).getBytes();
		var publicKeyb64 = forge.util.encode64(publicKeyInfoDer);
		
		//Crea una solicitud de certificado PKCS10
		var csr = createCSR(keys,"ES",userConnected.name,userConnected.id);
		//Pasa a PEM format
		var csrPem = forge.pki.certificationRequestToPem(csr);
		
		//Resto de datos del registro de clave. Incluye la clave pública y datos del dispositivo 
		keyRequest.KeyRequest.csrPem = csrPem;
		keyRequest.KeyRequest.deviceId = deviceId;	
		keyRequest.KeyRequest.deviceDescription = deviceDescription;	
		keyRequest.KeyRequest.deviceCharacteristics = deviceCharacteristics;
		keyRequest.KeyRequest.engine = "WEBCRYPTO";	
		keyRequest.KeyRequest.otp = $('#otp').val();
		keyRequest.KeyRequest.publicKey = publicKeyb64;
				
		
		//Envía petición a servidor, ID de operación, OTP respondido y CSR con la clave pública
		ssls.keyRegister(keyRequest.KeyRequest.userId,keyRequest.KeyRequest.id,keyRequest).then (function (csrResponse){
			console.log("CSR response from server");
			console.log(csrResponse);
    		var pkcsEntry = new PKCS12Entry();
    		pkcsEntry.fromCsrP7b(keys.privateKey,csrResponse.DeviceKey.certificatep7b);
    		pkcsEntry.name = userConnected.id;
    		pkcsEntry.keyId = csrResponse.DeviceKey.id;
    		pkcsEntry.keyName = userConnected.name;
    		return keyStore.importCertificate(pkcsEntry,false);
		}).then(function(pkcs12Entry) {
			console.log ("Imported CSR key, generated local, signed on server: "+pkcs12Entry.name);
    		keyCreated(pkcs12Entry);
		}).catch (function (err){
			console.log(err);
			enrollFailed(err);
		});
	}
	
	function enrollFailed(result){
		$('#newDeviceSend').hide();
		$('#newDeviceErrorMessage').text("La identificación no ha sido correcta: "+result.status+"-"+result.responseText);
		$('#newDeviceErrorMessage').show();
		$('#newDeviceError').show();
		
	}
	
	function configureNewKeyForm(){
		$('#otp').val(null);
		$('#newDeviceSend').hide();
		$('#newDeviceErrorMessage').text("");
		$('#newDeviceErrorMessage').hide();
		$('#resendOtp').text(" Habilitar CryptoKeys ");
		$('#newDeviceError').show();
		
		//requestAKey();
	}
	function configureBadKeyForm(){
		$('#otp').val(null);
		$('#newDeviceSend').hide();
		$('#newDeviceErrorMessage').text("La clave existe pero no es válida");
		$('#newDeviceErrorMessage').show();
		$('#resendOtp').text(" Solicitar nueva clave ");
		$('#newDeviceError').show();
		
		//requestAKey();
	}
	
	function handleResendClick(){
		$('#otp').val(null);
		$('#newDeviceError').hide();
		$('#newDeviceErrorMessage').text("");
		$('#resendOtp').text(" Reintentar ");
		$('#newDeviceSend').show();
		requestAKey();
	}
	
	function handleExecuteSignedTransactionClick(){
		
		if (!currentKey){
			showCheckResultMessage("No dispone de clave de firma. Por favor, validese primero.", "alert-warning");
			return;
		}
		
		//La clave privada solo se puede usar con pin?
		if (currentKey.pin){
			password_prompt("La clave de identificación requiere PIN para habilitar el uso. Introdúzcalo a continuación","Aceptar",320,300,executeSignedTransactionImpl);
		} else {
			executeSignedTransactionImpl();
		}
	}	
	function executeSignedTransactionImpl(pin){	
		var textToSign = "Authorization request text to sign";
		var message = "1. Signing challenge with a private key <br/>";

		var st = new SignatureToken();
    	st.webcryptosign(textToSign,currentKey,pin).then (function (signature){
    		message = message + "2. Sending signature to server<br/>";
    		var signatureB64 = forge.util.encode64(arrayBufferToString(signature));
    		console.log ("signedData: "+signatureB64);
    		var dataB64 = forge.util.encode64(textToSign);
    		var check ={KeyCheck:{data:dataB64,signature:signatureB64}};
    		
    		return ssls.userKeyCheck(userId,check);
    	}).then (function(){
    		message =  message +"3. Transaction validated";
    		showCheckResultMessage(message, "alert-success");
		}).catch (function (err){
			console.log(err);
			message =  message + "Signature not validated. Transaction can not be performed"
			var motivo = null;
			if (err && err.responseJSON)
				message = message +": " + err.responseJSON.error;
			else if (err)
				message = message +": " + err;
			showCheckResultMessage( message, "alert-danger");
		});
	} 
	
	function validateCurrentKeyAndRequestIfNotValid(pkcs12Entry){
		//La clave privada solo se puede usar con pin?. En ese caso se da por buena y ya la validaremos con la primera transacción
		if (pkcs12Entry.pin)
			return true;

		var textToSign = "Validating key";
		var pin = null;
		
		var st = new SignatureToken();
    	st.webcryptosign(textToSign,pkcs12Entry,pin).then (function (signature){
    		var signatureB64 = forge.util.encode64(arrayBufferToString(signature));
    		var dataB64 = forge.util.encode64(textToSign);
    		var check ={KeyCheck:{data:dataB64,signature:signatureB64}};
    		return ssls.userKeyCheck(userId,check);
    	}).then (function(){
    		console.log("The key is valid");    		
    		keyExists(pkcs12Entry);
		}).catch (function (err){
			console.log(err);
			console.log("The key is not valid. Deleting key for user: "+userId);
			keyStore.deleteKey(null,userId).then (function(){
				console.log("Invalid key deleted");
				currentKey = null;
				//requestAKey();
				configureBadKeyForm();
			});	
		});
	} 
	
	
	
	
	
	
	function doDeleteKey(){
		
		
		keyStore.deleteKey(null,userId).then(function (){
			console.log ("key deleted from keystore for user: "+userId);
			
			var currentKeyToRevoke = currentKey;
			if (currentKeyToRevoke && currentKeyToRevoke.keyId && !currentKeyToRevoke.revoked){
				ssls.keyRevoke(userId,currentKeyToRevoke.keyId).then(function(){
					console.log("Key revoked in server "+currentKeyToRevoke.keyId);
					listDevices(userId);
				}).catch (function (err){
					console.log (err);
					console.log("Error revoking key in server "+currentKeyToRevoke.keyId);
					listDevices(userId);
				});
			} else{
				listDevices(userId);
			}	
			$("#userId").val(null);
			currentKey = null;
			
		}).catch (function (err){
			console.log(err);
		});
		
		return 
	}
	

	function showCheckResultMessage(mensaje, alertType){
		if (!alertType){
			alertType = "alert-info"
		}	
		
		var text = "<div id='checkResultMessage' class='alert "+alertType+"' role='alert'>"+mensaje+"</div>";
		$('#checkResultMessage').replaceWith(text);	
	}
	
	function callFailed(result) {
		console.log(result);
		alert('Service call failed: ' + result.status + ' - ' + result.statusText + ' - ' +result.responseText);
		//showResponse ('Service call failed: ' + result.status + ' - ' + result.statusText + ' - ' +result.responseText);
	}
	
	
	function generateCSR(userConnected,keys){
		var CN = null;
		if (userConnected.nif)
			CN = userConnected.nif;
		else if (userConnected.email)
			CN = userConnected.email;
		var C = "ES";
		var SERIALNUMBER = userConnected.id;
		var extractable = false;
		
		//generate PKCS10 request
		var csr = createCSR(keys,C,CN,SERIALNUMBER);
		//Pasa a PEM format
		var csrPem = forge.pki.certificationRequestToPem(csr);
    	
		return csrPem;
	}	
		
	
	 function createCSR(keys, C,CN,SERIALNUMBER){
	    // create a certification request (CSR)
	    var csr = forge.pki.createCertificationRequest();
	    csr.publicKey = keys.publicKey;
	    csr.setSubject([{
	      	name: 'commonName',
	    	value: CN
	    }, {
	    	name: 'countryName',
	    	value: C
	    }, {
	    	name: 'serialName',
	    	value: SERIALNUMBER
	    }]);
	    // set (optional) attributes
	    /*
	    csr.setAttributes([{
	      name: 'challengePassword',
	      value: 'password'
	    }, {
	      name: 'unstructuredName',
	    	  value: 'SSL certificate, Inc.'
	    	}, {
	    	  name: 'extensionRequest',
	    	  extensions: [{
	    	    name: 'subjectAltName',
	    	    altNames: [{
	    	      // 2 is DNS type
	    	      type: 2,
	    	      value: 'test.domain.com'
	    	    }, {
	    	      type: 2,
	    	      value: 'other.domain.com',
	    	    }, {
	    	      type: 2,
	    	      value: 'www.domain.net'
	    	    }]
	    	  }]
	    	}]);
		*/
	    // sign certification request
	    csr.sign(keys.privateKey);

	    // verify certification request
	    var verified = csr.verify();
    	return csr;
    }
	 
	 
	 
	 function listDevices(userId){
		 console.log("listing keys");
		 ssls.keyList(userId).then(function(list) {
			console.log(list.DeviceKey);
			 $("#theDeviceList > tbody").empty();
			for (var i=0; i<list.DeviceKey.length; i++) {
	       		addToDeviceList (list.DeviceKey[i]);
	        }
	   	}).catch(function(err) {
	   		if (err.status!= 404)
	   			callFailed(err);
	    });
	 }
		
	function addToDeviceList(key){
		var id = key.id;
		var name = key.deviceDescription
		var actual = "";
		var deleteAction ="";
		var showOnlyActive = $('#showOnlyActive').is(':checked');

		console.log("add key to list id:"+id +  " name: "+name+ " revoked:"+key.revoked);
		//var keyStatus = "SI";
		//if (key.revoked)
		//	keyStatus = "Revocada";
		var keyStatus = "<img src='img/checkmark.png' alt='Clave activa' title='Clave activa' height='32'/>";
		if (key.revoked)
			keyStatus = "<img src='img/no_entry.png' alt='Clave revocada' title='Clave revocada' height='32'/>";
		
		var keyEngine = "<img src='img/w3c-icon.png' alt='WEBCRYPTO' title='WEBCRYPTO' height='32'/>";
		if (key.engine == 'ANDROID')
			keyEngine = "<img src='img/android-icon.png' alt='ANDROID' title='ANDROID' height='32'/>";
		else if (key.engine == 'IOS')
			keyEngine = "<img src='img/ios-icon.png' alt='ANDROID' title='ANDROID' height='32'/>";		
				
		
		if (currentKey && currentKey.keyId == key.id){
			name = name+ " [ACTUAL]";
			actual = "<img src='img/key-icon.png' alt='Clave privada' title='Private key' height='32'/>";
			//deleteAction = "	<li><a href='javascript:doDeleteKey()'>Eliminar del navegador</a></li>";
			deleteAction="doDeleteKey()";
		} else {
			deleteAction ="doRevokeKey(\""+id+"\")";
		}
		
		
		
		var keyActions = "<button type='button' class='btn btn-default' onclick="+deleteAction+" >"
			+"<span class='glyphicon glyphicon-trash' ></span> " 
			+  "</button>";
		
		if (key.revoked){
			keyActions = "";
		}
		
		  
		var tableElement = "<tr>"
		//	+ "<td><input type='radio' name='key' value='"+id+"' id='"+id+"'><label for='"+id+"'>"+name+"</label></td>"
			+ "<td>"+name+"</td>"
			+ "<td>"+actual+"</td>"
			+ "<td>"+keyEngine+"</td>"
			+ "<td>"+keyStatus+"</td>"
			+ "<td>"+keyActions+"</td>"
			+"</tr>";
		
		if (!showOnlyActive || !key.revoked)
			$('#theDeviceList').append(tableElement);
	}
	
	function doRevokeKey(selectedKeyId){
		//var selectedKeyId =$('input:radio[name=key]:checked').val();
		console.log ("Revoking key "+selectedKeyId);
		if (selectedKeyId){
			ssls.keyRevoke(userId,selectedKeyId).then(function(){
				listDevices(userId);
			}).catch(function(err) {
	        	alert("Could not delete key : " + err);
	    	});
			
		}
	}
	
	function handleRegisterDeviceClick(){
		var message = "Click to start mobile linking process";
		if (isMobile ){
			var link = makeRegisterLink(userId);
			var section = "<div id='checkResultMessage' class='alert alert-info' role='alert'>"
				 + message
				 + "<a href='"+link+"'  class='btn btn-default' target='_blank'>CryptoKeys app</a>"
				 +	"</div>";
			$('#checkRegisterMessage').replaceWith(section);			
			
		} else  {
			var  qrLink = config.apiUrl+"/account/"+userId+"/qr?userId="+userId+ "&jwt="+jwt;
		    $('#qrdevice').attr("src",qrLink);
		    $('#registerDeviceDialog').modal('show')  
		}
		
	}
	
	function handleRefreshDevicesClick(){
		listDevices(userId);
	}
	
	
	function handleExecuteSignedTransactionDoubleFactorClick(){
		var textToSign = "Double factor transaction";
		var request = { Authorization : { userId : userId, appKey: config.cryptobankingAppKey,channel:'PUSH',mode:'DIGITAL_SIGNATURE',message: textToSign }};
		
		ssls.postAuthorization(request).then (function(obj){
			authorizationResponse(obj);
			initTimer();
		}).catch (function (err){
			callFailed(err);
		});

	} 
	
	function checkCallStatus(){
		ssls.getAuthorization (authorizationId).then (function (obj){
			var status = obj.Authorization.status;
			
			if (isAuthorizationFinished(status))
				finishAuthorization(obj.Authorization);
		}).catch (function (result){
			callFailed(result);
		});
	}
	
	
	
	function authorizationResponse(obj) {
		authorizationId = obj.Authorization.id;
		console.log("authorization Id : "+authorizationId);
				
		$('#abortButton').show();	
		$('#sendTransactionDoubleFactor').hide();	
		$('#textToSignDoubleFactor').hide();	
		
		var message = "Requesting authorization to your linked device...";
		if (isMobile ){
			var link = makeAuthorizationLink(obj.Authorization);
			var section = "<div id='checkResultMessage' class='alert alert-info' role='alert'>"
				 + message
				 + "<a href='"+link+"'  class='btn btn-default' target='_blank'>Cryptokeys app</a>"
				 +	"</div>";
			$('#checkResultMessage').replaceWith(section);			
		} else  {
			showCheckResultMessage(message);	
		}
	}
	
	
	function handleDownloadAppClick(){
		   if (!isMobile){
			   $('#qrimage').attr("src",config.cryptobankingAppImage);
			   $('#downloadAndroidDialog').modal('show')  
		   } else  {
			   window.open(cryptobankingApp)
		   }
	   }
	
	function makeAuthorizationLink(authorization){
		var protocol = "cb";
		var appUrl = "com.aralink.cryptobanking.authorization";
		var p1 = "id="+authorization.id;
		//var p2 = "web="+webHost;
		var p2 = "web="+config.apiUrl;
		var p3 = "data="+authorization.dataToSign;
			
		var link = protocol + "://" + appUrl+ "?"+p1+"&"+p2+"&"+p3;
		console.log(link)
		return link;
	}
	
	function makeRegisterLink(userId){
		var protocol = "cb";
		var appUrl = "com.aralink.cryptobanking.register";
		var p1 = "userId="+userId;
		var p2 = "web="+config.apiUrl;
		var p3 = "jwt="+jwt;
		//p2 = "web=https://10.5.3.9:444/sslsignature";
			
		var link = protocol + "://" + appUrl+ "?"+p1+"&"+p2+"&"+p3;
		console.log(link)
		return link;
	}
	
	
	function isAuthorizationFinished(status) {
		return (status == "CANCEL" || status=="SUCCESS" || status =="FAIL")
	}
	function finishAuthorization(authorization) {
		cancelTimer();
		var mode = authorization.mode;
		var status = authorization.status;
		console.log ("Authorization status ="+status);
		
		var image;
		var alertType;
		if (status == "CANCEL"){
			image = "<img src='img/yield.png'/>";
			alertType = "alert-warning";
		}else if  (status == "SUCCESS"){
			image = "<img src='img/checkmark.png'/>";
			alertType = "alert-success";
		}else if  (status == "FAIL"){
			image = "<img src='img/no_entry.png'/>";
			alertType = "alert-danger";
		}else{ 
			image = "<img src='img/no_entry.png'/>";
			alertType = "alert-info";
		}	
		
		var section = "<div id='checkResultMessage'  class='alert "+alertType+"' role='alert'><h5>Respuesta obtenida </h5>"+image+"<h5>"+status+"</h5></section>";
		$('#checkResultMessage').replaceWith(section);	
		
		$('#abortButton').hide();
		$('#sendTransactionDoubleFactor').show();	
		//$('#textToSignDoubleFactor').show();	
	}	

	
	
	
	function doAbort(){
		finishAuthorization('CANCEL');
	}
	
	function handleAbortClick(){
		cancelTimer();		
		
		image = "<img src='img/yield.png'/>";
		var section = "<div id='checkResultMessage' class='alert alert-warning' role='alert'><h5>Resultado de la autorización</h5>"+image+"<h5>CANCEL</h5></div>";
		$('#checkResultMessage').replaceWith(section);
		
		$('#abortButton').hide();
		$('#sendTransactionDoubleFactor').show();	
		//$('#textToSignDoubleFactor').show();	
	}
	
	
	function initTimer(){
		timeout = 90;
		intervalId = window.setInterval(runTimer, 1000);
	}
	
	function runTimer(){
		var oElem = document.getElementById("otp");
		
		timeout = timeout - 1;
		$('#abortButton').html("Abortar ("+timeout+")");
		if (timeout < 0){
			$('#abortButton').html("Timeout");
			doAbort();
		} else {	
			//Cada 5 segundos check call status
			if (timeout % 5 == 0)
				checkCallStatus();
		}	
	}
	
	function cancelTimer(){
		clearInterval(intervalId);
	}
	
	/***************
	 * 
	 * Utilities
	 */
	
	function getGetParam (vr){
		var src = window.location.href;
		if (src != null) {
			var vrs = src.split('?');

			for (var x = 0, c = vrs.length; x < c; x++){	
				if (vrs[x].indexOf(vr) != -1){
					return decodeURI( vrs[x].split('=')[1] );
					break;
				};
			};
		}
		else {
			 return "";
		}
	};
	
	function getBrowserInfo(){
	    var ua=navigator.userAgent,tem,M=ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || []; 
	    if(/trident/i.test(M[1])){
	        tem=/\brv[ :]+(\d+)/g.exec(ua) || []; 
	        return {name:'IE',version:(tem[1]||'')};
	        }   
	    if(M[1]==='Chrome'){
	        tem=ua.match(/\bOPR\/(\d+)/)
	        if(tem!=null)   {return {name:'Opera', version:tem[1]};}
	        }   
	    M=M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
	    if((tem=ua.match(/version\/(\d+)/i))!=null) {M.splice(1,1,tem[1]);}
	    return {
	      name: M[0],
	      version: M[1]
	    };
	 }
	
	