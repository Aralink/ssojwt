
var config;
	
	function start(conf){
		config = conf;
	}
	
	
	
	function onIdentification(operation){
		console.log("SSO PAGE onIdentification");
		authenticationPerformed(operation);		
	}
	function onLoad(){
		console.log("SSO PAGE onLoad");
	}
	function onLogout(){
		console.log("SSO PAGE onLogout");
	}
	
	
	function handleCreateJWTClick(){
		
		var params = $('#jwtForm').serialize();
		console.log("POST "+config.url);
		console.log(params);
		$.post(
				config.url, 
				params,
				function(jwt) {
					console.log("JWT: "+jwt);
					//Store JWT in browser SSO
					sslssso.login(jwt);
                });
		
	}	
		
	
	
	