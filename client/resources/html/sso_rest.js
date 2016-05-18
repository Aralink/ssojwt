	
function RestClient (host,accountId,apiKey,scheme){
	"use strict";
	
    //this.host = host;
    //this.accountId = accountId;
	//this.apiKey = apiKey;
	scheme = _validateScheme(scheme);

	
	
	
	this.validateJWT = function (jwt,fulfill,reject){
		//var uri = host+'/sso/' + accountId + '/jwt';
		var uri = host;
		var request = {'jwt':jwt};
		return _postFormNoJQuery(uri,request,fulfill,reject);
	};
	
	function _validateScheme(scheme){
		if (!scheme)
			scheme = "Basic";

		if ( !(scheme == 'Basic' || scheme == 'JWT' || scheme == 'CJWT' ))
			throw "Scheme " + scheme + "not valid";
		
		return scheme;
	}
	
	function _makeAuth(scheme, user, password) {
		var tok = user + ':' + password;
		var hash;
		if (window.btoa){
			hash = btoa(tok);
		} else  {
			hash = Base64.encode(tok);
		}	
		return scheme + " " + hash;
	}
	
	function _get(url,fulfill,reject){
			var contentType = "application/json; charset=utf-8";		
			
			log(LogLevels.INFO, "GET "+url+ " "+contentType);
			
			$.support.cors = true;
			$.ajax({
				type: "GET", //GET or POST or PUT or DELETE verb
				url: url, // Location of the service	
				crossdomain: true,
				contentType: contentType,		
				accepts: { text: "application/json" },
				dataType: "json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", _makeAuth(scheme, accountId,apiKey));
				}
			}).done(function (response)	{	
				response = _decodeJson(response);
				fulfill(response);
			}).fail(function (err)	{
				reject(err);
			});
	}
	
	
	
	function _post(url, request,fulfill,reject){
		
			var contentType = "application/json; charset=utf-8";
			var jsondata = null;
			if (request)
				jsondata = JSON.stringify(request, null, 4);
			
			log(LogLevels.INFO, "POST "+url+ " "+contentType);
			log(LogLevels.DEBUG, "  Request: "+jsondata);
		
			$.support.cors = true;
			$.ajax({
				type: "POST", //GET or POST or PUT or DELETE verb
				url: url, // Location of the service
				data: jsondata, //Data sent to server
				contentType: contentType,			
				crossdomain: true,
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", _makeAuth(scheme, accountId,apiKey));
				}
			}).done(function (response)	{
				
				response = _decodeJson(response);
				fulfill(response);
			}).fail(function (err)	{
				reject(err);
			});
		
		
	}
	
	function _postForm(url, request,fulfill,reject){
		//return new Promise(function(fulfill, reject) {
			//var contentType = "application/json; charset=utf-8";
			var contentType = "application/x-www-form-urlencoded";
			var jsondata = null;
			if (request)
				jsondata = JSON.stringify(request, null, 4);
			
			log(LogLevels.INFO, "POST "+url+ " "+contentType);
			log(LogLevels.DEBUG, "  Request: "+jsondata);
		
			$.support.cors = true;
			$.ajax({
				type: "POST", //GET or POST or PUT or DELETE verb
				url: url, // Location of the service
				data: request, //Data sent to server
				contentType: contentType,			
				crossdomain: true,
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", _makeAuth(scheme, accountId,apiKey));
				}
			}).done(function (response)	{
				
				response = _decodeJson(response);
				fulfill(response);
			}).fail(function (err)	{
				reject(err);
			});
		//});
		
	}
	
	function _postFormNoJQuery(url, request,fulfill,reject){
		
			var contentType = "application/x-www-form-urlencoded";
			var jsondata = null;
			if (request)
				jsondata = JSON.stringify(request, null, 4);
			
			log(LogLevels.INFO, "POST "+url+ " "+contentType);
			log(LogLevels.DEBUG, "  Request: "+jsondata);
			
			_ajax.post(
					url,
					request,
					function (response)	{
						
						response = _decodeJson(response);
						fulfill(response);
					});
	}
	
	function _delete(url,fulfill,reject){
		
			var contentType = "application/json; charset=utf-8";
			var jsondata = null;

			log(LogLevels.INFO, "DELETE "+url+ " "+contentType);
		
			$.support.cors = true;
			$.ajax({
				type: "DELETE", //GET or POST or PUT or DELETE verb
				url: url, // Location of the service
				data: jsondata, //Data sent to server
				contentType: contentType,			
				crossdomain: true,
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", _makeAuth(scheme, accountId,apiKey));
				}
			}).done(function (response)	{
				response = _decodeJson(response);
				fulfill(response);
			}).fail(function (err)	{
				reject(err);
			});
	}
	
	
	function _isAbv(value) {
		var ArrayBufferView = Object.getPrototypeOf(Object.getPrototypeOf(new Uint8Array)).constructor;
	    return value instanceof ArrayBufferView;
	}
	function _isAb(value) {
	    return value && value instanceof ArrayBuffer && value.byteLength;
	}
	
	function _postStream(url, data,fulfill,reject){
		
			var contentType = "application/octet-stream";
		
			log(LogLevels.INFO, "POST "+url+ " "+contentType);
			log(LogLevels.DEBUG, data);
			
			if (!_isAbv(data) &&  !_isAb(data))
				throw "data is not an ArrayBuffer";
			
			$.support.cors = true;
			$.ajax({
				type: "POST", //GET or POST or PUT or DELETE verb
				url: url, // Location of the service
				data: data, //Data sent to server
				contentType: contentType,
				processData: false,
				crossdomain: true,
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", _makeAuth(scheme, accountId,apiKey));
				}
			}).done(function (response)	{
				response = _decodeJson(response);
				fulfill(response);
			}).fail(function (err)	{
				reject(err);
			});
		
	}
	
	function _decodeJson(response) {
		if (response){
			var jsonresponse = response; 
			if (typeof response === 'object')
				jsonresponse = JSON.stringify(response, null, 4);
			log(LogLevels.DEBUG, "  Response: "+jsonresponse);
			var obj = JSON.parse( jsonresponse );
			return obj;
		}else {
			log(LogLevels.DEBUG, "  Response: NULL");
			return;
		}
	}
	
	function _convertMimetype(mimetype){
		if (mimetype == 'gallery/manual')
			return 'application/pdf';
		else if (mimetype == 'application/binary')
			return 'application/pdf';
		return mimetype;
	 }
	
	var _ajax = {};
	_ajax.x = function () {
	    if (typeof XMLHttpRequest !== 'undefined') {
	        return new XMLHttpRequest();
	    }
	    var versions = [
	        "MSXML2.XmlHttp.6.0",
	        "MSXML2.XmlHttp.5.0",
	        "MSXML2.XmlHttp.4.0",
	        "MSXML2.XmlHttp.3.0",
	        "MSXML2.XmlHttp.2.0",
	        "Microsoft.XmlHttp"
	    ];

	    var xhr;
	    for (var i = 0; i < versions.length; i++) {
	        try {
	            xhr = new ActiveXObject(versions[i]);
	            break;
	        } catch (e) {
	        }
	    }
	    return xhr;
	};

	_ajax.send = function (url, callback, method, data, async) {
	    if (async === undefined) {
	        async = true;
	    }
	    var x = _ajax.x();
	    x.open(method, url, async);
	    x.onreadystatechange = function () {
	        if (x.readyState == 4) {
	            callback(x.responseText);
	        }
	    };
	    if (method == 'POST') {
	        x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	    }
	    x.send(data);
	};

	_ajax.get = function (url, data, callback, async) {
	    var query = [];
	    for (var key in data) {
	        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
	    }
	    _ajax.send(url + (query.length ? '?' + query.join('&') : ''), callback, 'GET', null, async);
	};

	_ajax.post = function (url, data, callback, async) {
	    var query = [];
	    for (var key in data) {
	        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
	    }
	    _ajax.send(url, callback, 'POST', query.join('&'), async);
	};
	
	

};


