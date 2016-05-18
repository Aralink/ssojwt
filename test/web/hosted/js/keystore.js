
	var ssls;
	var crypto = window.crypto || window.msCrypto;
	var keyStore;
	var cbKeyStore;
	var webcrypto = true;
	
	$(document).ready(function(){
		configureForm();
		
		checkWebCrypto();
		openWebCryptoKeyStore();
		openCryptoKeysKeyStore();
	    
	});
	
	function configureForm(){
	}
		
	
	function checkWebCrypto(){
		if (window.crypto && !window.crypto.subtle && window.crypto.webkitSubtle) {
	        window.crypto.subtle = window.crypto.webkitSubtle;
	    }
		if (!window.crypto &&  window.msCrypto){
			window.crypto = window.msCrypto;
		}
		
		if (!window.crypto || !window.crypto.subtle) {
			disableWebCrypto("Web Cryptographi API no soportada!");
	    }
	    
	    if (!window.indexedDB) {
			disableWebCrypto("IndexedDB no soportada!");
	    } 
	}
	
	function disableWebCrypto(message){
		webcrypto = false;
		$("#webcryptoAlert").text(message);
		$("#webcryptoAlert").show();
	}
	
	function openWebCryptoKeyStore(){
		if (webcrypto){
			 keyStore = new KeyStore();	
			 keyStore.open().then(function() {
			   	console.log ("KeyStore opened");
			    listKeyStore();
			 }).catch(function(err) {
			    alert("Could not open key store: " + err);
			 });		   
		}
	}
	function openCryptoKeysKeyStore(){
		if (webcrypto){
			 cbKeyStore = new KeyStore();	
			 cbKeyStore.open("CBKeyStore").then(function() {
			   	console.log ("CryptoKeyStore opened");
			    listCryptoKeyStore();
			 }).catch(function(err) {
			    alert("Could not open key store: " + err);
			 });		   
		}
	}
	
		
	function importPkcs12(file,password, extractable){
		console.log("importPkcs12 "+password + " extractable:"+extractable);
		var reader = new FileReader();
		reader.onload = function(e) { 				
			//var mime = convertMimetype(file.type);
			var contents = e.target.result;
			var pkcs12Bin = arrayBufferToString(contents)
			var pkcs12B64 = forge.util.encode64(pkcs12Bin);		
			
			
			keyStore.importKey(pkcs12B64,password,extractable).then(function(savedObject) {
	    		console.log ("Imported key: "+savedObject.name);
	    		$('#importCertificateModal').modal('hide')
	    		listKeyStore();
			}).catch(function(err) {
	            alert("Could not import pcks12: " + err);
	        });
		}	
		reader.readAsArrayBuffer(file);
	}
	
	function listKeyStore(){
		keyStore.listKeys().then(function(list) {
			$( "#keyList" ).empty();
			for (var i=0; i<list.length; i++) {
				$( "#keyList" ).append( 
						addToKeyList (list[i]));
        	}
   		 }).catch(function(err) {
        	alert("Could not list key store: " + err);
    	});
	}
	
	function addToKeyList(keystoreObject){
		var id = keystoreObject.id;
		var savedObject = keystoreObject.value;
		var name = escapeHTML(savedObject.name);
		console.log("add key to list id:"+id +  " name: "+name);
		
		var keyElement = 
			"<div class='radio'>" +
			"<label>"+
			"<input type='radio' name='key' value='"+id+"' id='"+id+"'>"+
		    name+
		    "</label>"+
		    "</div>";
		return keyElement;
		
	}
		
	
	function listCryptoKeyStore(){
		cbKeyStore.listKeys().then(function(list) {
			$( "#cryptoKeyList" ).empty();
			for (var i=0; i<list.length; i++) {
       			$( "#cryptoKeyList" ).append( 
       					addToCryptoKeyList (list[i]));
        	}
   		 }).catch(function(err) {
        	alert("Could not list key store: " + err);
    	});
	}
	
	function addToCryptoKeyList(keystoreObject){
		var id = keystoreObject.id;
		var savedObject = keystoreObject.value;
		var name = escapeHTML(savedObject.keyName);
		console.log("add key to list id:"+id +  " name: "+name);
		
		var keyElement = 
			"<div class='radio'>" +
			"<label>"+
			"<input type='radio' name='cryptokey' value='"+id+"' id='"+id+"'>"+
		    name+
		    "</label>"+
		    "</div>";
		return keyElement;
		
	}
	
	function escapeHTML(s) {
        return s.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
    }
	
		
	
	function handleDeleteClick(){
		var selectedKeyId = parseInt($('input:radio[name=key]:checked').val());
		console.log ("Deleting key "+selectedKeyId);
		if (selectedKeyId){
			keyStore.deleteKey(selectedKeyId).then(function(){
				listKeyStore();
			}).catch(function(err) {
	        	alert("Could not delete key : " + err);
	    	});
			
		}
	}
	function handleDeleteCryptoKeyClick(){
		var selectedKeyId = parseInt($('input:radio[name=cryptokey]:checked').val());
		console.log ("Deleting key "+selectedKeyId);
		if (selectedKeyId){
			cbKeyStore.deleteKey(selectedKeyId).then(function(){
				listCryptoKeyStore();
			}).catch(function(err) {
	        	alert("Could not delete key : " + err);
	    	});
			
		}
	}
	
	function handleImportPkcs12Click(){
		
		var file = document.getElementById('pkcs12File').files[0];
	    var password = $("#password").val();
	    var extractable = $('#extractable').is(':checked');
	    
		importPkcs12(file, password,extractable);
	}
	
	function handleExportClick(){
		var selectedKeyId = parseInt($('input:radio[name=key]:checked').val());
		var selectedKeyName;
		console.log ("Exporting key "+selectedKeyId);
		
		
		keyStore.getKey("id",selectedKeyId).
        then (function (pkcs12Entry){
        	selectedKeyName = pkcs12Entry.name;
    		console.log("exportKey:"+ selectedKeyName);
    		var password = window.prompt("Insert password for .p12","");
	    	return keyStore.exportKey (selectedKeyId,password);
        }).then(function(p12b64){
        	if (isIE())
        		downloadAsBlob(p12b64,selectedKeyName);
        	else {
        		var downloadLink = 'data:application/x-pkcs12;base64,' + p12b64;
        		window.location = downloadLink;
        	}
        }).catch (function( err){
        	alert("Error exporting key: "+err);
        });
		
	}
	
	function downloadAsBlob(p12b64,selectedKeyName){
		var blob = b64toBlob(p12b64,'application/x-pkcs12');
    	var name = selectedKeyName+ ".p12";
    	if (window.saveAs) {
    		window.saveAs(blob, name); 
    	} else { 
    		navigator.saveBlob = navigator.saveBlob || navigator.msSaveBlob || navigator.mozSaveBlob || navigator.webkitSaveBlob;
    		navigator.saveBlob(blob, name); 
    	}
	}
	
	 
	