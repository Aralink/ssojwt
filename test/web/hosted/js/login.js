
var uAg = navigator.userAgent.toLowerCase();
var isMobile = !!uAg.match(/android|iphone|ipad|ipod|blackberry|symbianos/i);

var config;

var webcrypto = true;
var webcryptoError;

var keyStore;
var keyStoreList;

var cbKeyStore;
var cbKeyStoreList;





$(function () {
	$("[data-toggle='tooltip']").tooltip();
});

	function start(conf){
		config = conf;
		ssls = new SSLSignature(config.apiUrl, config.accountId, config.apiKey,config.tokenType);
	}

	$(document).ready(function(){
		configureForm();
		
		if (isWebCryptoEnabled()){
			checkWebCrypto();
			openWebCryptoKeyStore();
		}
		if (isCryptoKeysEnabled()){
			checkCryptoKeys();
			openCryptoKeysKeyStore();
		}	
	});	
	
	function configureForm(){
		$("#webcryptoOff").hide();
		$("#cryptokeysOff").hide();
		
		if (!isCertificateEnabled()){
			$("#idByCert").hide();
		}	
		if (!isClaveEnabled()){
			$("#idByClave").hide();
		}
		if (!isWebCryptoEnabled()){
			$("#webcryptoListOn").hide();
			$("#webcryptoOff").hide();
		}	
		if (!isCryptoKeysEnabled()){
			$("#cryptokeysListOn").hide();
			$("#cryptokeysOff").hide();
		}
		if (!isPasswordEnabled()){
			$("#idByPassword").hide();
		}		

		if (config.siteTitle){
			$("#siteTitle").text(config.siteTitle);
		}
		if (config.siteDescription){
			$("#siteDescription").text(config.siteDescription);
		}
	}
	
	function isWebCryptoEnabled(){
		return  !(config.signInOptions && config.signInOptions.indexOf("WEBCRYPTO") == -1);
	}
	function isCryptoKeysEnabled(){
		return  !(config.signInOptions && config.signInOptions.indexOf("CRYPTOKEYS") == -1);
	}
	function isCertificateEnabled(){
		return  !(config.signInOptions && config.signInOptions.indexOf("CERTIFICATE") == -1);
	}
	function isClaveEnabled(){
		return  !(config.signInOptions && config.signInOptions.indexOf("CLAVE") == -1);
	}
	function isPasswordEnabled(){
		return  !(config.signInOptions && config.signInOptions.indexOf("PASSWORD") == -1);
	}
	
	function checkWebCrypto(){
		if (!window.crypto || !window.crypto.subtle) {
			disableWebCrypto("Web Cryptographi API no soportada!");
	    }
	    
	    if (!window.indexedDB) {
			disableWebCrypto("IndexedDB no soportada!");
	    } 
	}
	function checkCryptoKeys(){
		if (!window.crypto || !window.crypto.subtle) {
			disableCryptoKeys("Web Cryptographi API no soportada!");
	    }
	    
	    if (!window.indexedDB) {
			disableCryptoKeys("IndexedDB no soportada!");
	    } 
	}
	
	function disableWebCrypto(message){
		webcrypto = false;
		webcryptoError = message;
		
		$("#webcryptoOff").attr('title', message).tooltip('fixTitle').tooltip('show');
		$("#webcryptoOff").show();
		
		$("#webcryptoListOn").hide();
	}
	
	function disableCryptoKeys(message){
		webcrypto = false;
		webcryptoError = message;
		
		$("#cryptokeysOff").attr('title', message).tooltip('fixTitle').tooltip('show');
		$("#cryptokeysOff").show();		
		
		$("#cryptokeysOn").hide();
		$("#cryptokeysListOn").hide();
	}
	
	function enableWebCrypto(list){
		keyStoreList = list;
		$('#webcryptoList').empty();
		for (var i=0; i<list.length; i++) {
			console.log("key "+i+ " id:"+list[i].id +  " name: "+list[i].value.name+ " keyId: "+list[i].value.keyId+ " keyName: "+list[i].value.keyName);
			id = list[i].id;
			name = list[i].value.name;
			$("#webcryptoList").append("<li><a href='javascript:loginByWebCryptoId("+id+")'>"+name+"</a></li>");
		}
		$('#webcryptoListOn').show();
	}
	
	function enableCryptoKeys(list){
		cbKeyStoreList = list;
		if (list.length == 1 ){
			console.log("key "+0+ " id:"+list[0].id +  " userId: "+list[0].value.name+ " keyId: "+list[0].value.keyId+ " keyName: "+list[0].value.keyName);
			userId = list[0].value.name;
			keyName = list[0].value.keyName;
			$("#cryptokeysOn").attr("onclick","javascript:loginByCryptoId(\""+userId+"\")");
			$('#cryptokeysOn').show();
			$('#cryptokeysListOn').hide();
		} else {
			$('#cryptokeysList').empty();
			for (var i=0; i<list.length; i++) {
				console.log("key "+i+ " id:"+list[i].id +  " userId: "+list[i].value.name+ " keyId: "+list[i].value.keyId+ " keyName: "+list[i].value.keyName);
				userId = list[i].value.name;
				keyName = list[i].value.keyName;
				$("#cryptokeysList").append("<li><a href='javascript:loginByCryptoId(\""+userId+"\")'>"+keyName+"</a></li>");
			}
			$('#cryptokeysListOn').show();
			$('#cryptokeysOn').hide();
		}	
	}
	
	function openWebCryptoKeyStore(){
	    if (webcrypto){
	    	console.log("1. Init WebCrypto KeyStore");
	    	keyStore = new KeyStore();	
	    	keyStore.open().then(function() {
	    		console.log ("  WebCrypto KeyStore opened");
	    		return  keyStore.listKeys();
		    }).then(function(list) {
		        console.log("Existen WebCrypto claves: "+list.length);
		        if (list.length == 0){
		        	disableWebCrypto("No hay certificados disponibles");
		        } else  {
		        	enableWebCrypto(list);		 
		        	
		        }    
		        
	    	}).catch(function(err) {
	    		disableWebCrypto("Could not open key store: "+err);
	    	});
	    }
	}    
	
	
	function openCryptoKeysKeyStore(){
	 	if (webcrypto){
	    	console.log("2. Init CryptoKeys KeyStore");
	    	cbKeyStore = new KeyStore();
	    	cbKeyStore.open("CBKeyStore").then(function() {
	    		console.log ("  CryptoKeys KeyStore opened");
	    		return  cbKeyStore.listKeys();
		    }).then(function(list) {
		        console.log("Existen CryptoKeys claves: "+list.length);
		        if (list.length == 0){
		        	disableCryptoKeys("No hay claves disponibles");
		        } else  {
		        	enableCryptoKeys(list);		        	
		        }
	    	}).catch(function(err) {
	    		disableCryptoKeys("Could not open key store: "+err);
	    	});
	    }	
	}

	
	function loginByCert () {
		var loginUrl = config.apiUrl + '/sso/'+config.accountId+'/idByCert?p=1' + buildRedirect();
		doRedirect(loginUrl);		
	}

	function loginByClave () {
		var loginUrl = config.apiUrl + '/sso/'+config.accountId+'/idByClave?p=1' + buildRedirect();
		//doRedirect(loginUrl);
		window.location.href = loginUrl;
	}	
	
	function loginByWebCrypto () {
		console.log("loginByWebCrypto");
		console.log(Date.now());
		var textToSign = "Solicitud de autorizacion";
		var pin;
		
		//Box y Document a firmar. Por defecto XML
		
		var content = "<login></login>";
		var filename = "login.xml";
		var name = "login";
		var mimetype = "application/xml";
		var contentB64 = forge.util.encode64( content);
		
		//TODO: Usar firma b�sica enviando el X509-->Solo una llamada a servidor
		// O bien optimizar teniendo el fichero b�sico ya en servidor con un ID--> solo se utiliza 
		
		
		var boxRequest = { EvidenceBox: 	{ name: "Login"	} };
		ssls.postBox(boxRequest).then (function (box){
			boxId = box.EvidenceBox.id;
			console.log("Box creada: "+boxId);
			var documentRequest = { Evidence:{name: name,filename: filename, mimetype: mimetype, type: "DOCUMENT", content:contentB64}};
			return ssls.postDocument(boxId, null,documentRequest);
		}).then(function (document){
			documentId = document.Evidence.id;
			console.log("Documento creado: "+documentId);
			var params ={};
		    params.showKeystore = function(){window.location = "keystore.html" };
			return keyStore.selectClientCertificate();
		}).then (function (currentKey){   
			console.log ("Selected certificate to sign: "+currentKey.name)
			var signatureParams = { signatureLevel: 'XAdES_BASELINE_B',	signaturePackaging: 'ENVELOPED',digestAlgorithm : 'SHA256'};
			var token = new SignatureToken (ssls);
		    return token.sign(documentId,currentKey, signatureParams);
		}).then(function(signature) {
			var signatureId = signature.Evidence.id;
        	console.log ("signature performed: "+signature.Evidence.id);
        	var loginUrl = config.apiUrl + '/sso/'+config.accountId+'/idBySignature?signatureId='+signatureId+buildRedirect();
        	
        	doRedirect(loginUrl);
    		//window.location.href = loginUrl;
		}).catch (function (result){
			console.log(result);
			showMessage("Error en la identificación: "+result.message);
		});
		
	}	
	
	function loginByWebCryptoId (keyId) {
		console.log("loginByWebCryptoID "+keyId);
		var textToSign = "Solicitud de autorizaci�n";
		var pin;
		
		//Box y Document a firmar. Por defecto XML
		
		var content = "<login></login>";
		var filename = "login.xml";
		var name = "login";
		var mimetype = "application/xml";
		var contentB64 = forge.util.encode64( content);
		
		//TODO: Usar firma b�sica enviando el X509-->Solo una llamada a servidor
		// O bien optimizar teniendo el fichero b�sico ya en servidor con un ID--> solo se utiliza 
		
		
		var boxRequest = { EvidenceBox: 	{ name: "Login"	} };
		ssls.postBox(boxRequest).then (function (box){
			boxId = box.EvidenceBox.id;
			console.log("Box creada: "+boxId);
			var documentRequest = { Evidence:{name: name,filename: filename, mimetype: mimetype, type: "DOCUMENT", content:contentB64}};
			return ssls.postDocument(boxId, null,documentRequest);
		}).then(function (document){
			documentId = document.Evidence.id;
			console.log("Documento creado: "+documentId);
		    return keyStore.getKey("id",keyId);
		}).then (function (currentKey){   
			console.log ("Selected certificate to sign: "+currentKey.name)
			var signatureParams = { signatureLevel: 'XAdES_BASELINE_B',	signaturePackaging: 'ENVELOPED',digestAlgorithm : 'SHA256'};
			var token = new SignatureToken (ssls);
		    return token.sign(documentId,currentKey, signatureParams);
		}).then(function(signature) {
			var signatureId = signature.Evidence.id;
        	console.log ("signature performed: "+signature.Evidence.id);
        	
        	var loginUrl = config.apiUrl + '/sso/'+config.accountId+'/idBySignature?signatureId='+signatureId+buildRedirect();
        	doRedirect(loginUrl);
        	
    		//window.location.href = loginUrl;
		}).catch (function (result){
			console.log(result);
			showMessage("Error en la identificación: "+result.message);
		});
		
	}	
	
	function loginByCryptoId(userId){
		console.log(userId);
		
		console.log ("Iniciando cryptoId con userId: "+userId);
		cbKeyStore.getKey("name",userId).then (function (currentKey){
			var jwtHeader = {"alg":"RS256"};
		    var jwtPayload = {"sub":userId, "exp":(Date.now()/1000 + 60)}; 
		    var pin;		   
		    
		    return JWT.sign(jwtHeader,jwtPayload,currentKey,pin);
		}).then (function (token){
		   	console.log("JWT: "+token);
		   	
		   	var loginUrl = config.apiUrl + '/sso/'+config.accountId+'/idByCryptoKey?userId='+userId+'&jwt='+token+buildRedirect();
        	doRedirect(loginUrl);
/*
		   	var sslsUser = new SSLSignature(apiUrl,userId,token,"CJWT");

			return sslsUser.getUser();
		}).then(function (us){
			var	userConnected = us.User;
			console.log (userConnected);*/
	 	}).catch (function (result){
		    console.log(result);
		    showMessage("Error en la identificación: "+result.message);
		 });
	}
	
	function loginByUserPwd(){
		var username = $('#username').val();
		var password = $('#password').val();

		if ( !username){
			alert('Please, insert your user name');
			return;
		}		
		
		if ( !password){
			alert('Please, insert your password');
			return;
		}
		
		var sslsUser = new SSLSignature(config.apiUrl,username,password);

		sslsUser.getUser().then (function(us){
			userId = us.User.id;
			console.log ("login user: "+userId);
			return sslsUser.issueJWT(userId);
		}).then (function (jwtResponse){
			jwt = jwtResponse.JWT.data;
			console.log("Issued JWT token by server: "+jwt);
			
		   	var loginUrl = config.apiUrl + '/sso/'+config.accountId+'/idByJWT?userId='+userId+'&jwt='+jwt+buildRedirect();
        	doRedirect(loginUrl);
    		//window.location.href = loginUrl;

    		
		}).catch (function (result){
			console.log(result);
			showMessage("Error en la identificación "+result.status + ' - ' + result.statusText + ' - ' +result.responseText)
		});
	}
	
	function doRedirect(url){

		console.log("redirecting to: "+url);
		//window.location.href = url;
		
		var iframe = document.createElement('iframe');
		iframe.style.display = "none";
		iframe.src = url;
		iframe.id = 'ssls.login.iframe';
		document.body.appendChild(iframe);
	}
	 
	 function buildRedirect(){
		 if (config && config.signInSuccessUrl){
			 return '&redirect.url=' + config.signInSuccessUrl;
		 } else {
			 return '';
		 }
		
		 
	 }
	 
	 function onIdentification(operation){
			var userId = operation.userId;
			if (userId){
				console.log ("[PAGE SSO] User logged with userId "+userId);
			} else {
				console.log ("[PAGE SSO] User logged but not registered");
			}
			console.log("[PAGE] eidentifier: "+ operation.eIdentifier);
			console.log("[PAGE] name: "+ operation.name);
			console.log("[PAGE] jwt: "+ operation.jwt);
		}
		function onLoad(){
			console.log ("[PAGE SSO] Loaded");
		}
		function onLogout(){
			console.log("[PAGE SSO] logout");			
		}

	function showMessage(message){
		alert(message);
	}
	
