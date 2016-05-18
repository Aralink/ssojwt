
var config = {
        apiUrl: 'https://produccion.sslsignature.com/sslsignature',
        accountId: '5995a3c9-678b-4338-a674-362af68b9ef9'
};
var ssls = null;
	
	function start(conf){
		config = conf;
		ssls = new SSLSignature(config.apiUrl, config.accountId, config.apiKey,config.tokenType);
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
	
	
	function showRegisterMessage(message,alertClass){
		if (!alertClass){
			alertClass = "alert alert-info well-sm";
		} 
	
		$('#identifiedUser').show();
		$('#identifiedUser').text(message);
		$('#identifiedUser').attr("class",alertClass);
	}
	
	
	function handleRegisterUserClick(){
		var username = $('#usernameSignup').val();
		var nif = $('#nifSignup').val(); // Solo cryptokeys
		var email = $('#emailSignup').val();
		var phone = $('#phoneSignup').val();
		var password = $('#passwordSignup').val();
		var password2 = $('#passwordSignup2').val();

		if ( !username){
			showRegisterMessage("Insert username","alert alert-warning well-sm");
			return;
		}		
		if ( !phone){
			showRegisterMessage("Insert a phone number","alert alert-warning well-sm");
			return;
		}	
		if ( !email ){
			showRegisterMessage("Insert an email","alert alert-warning well-sm");
			return;
		}
		if ( !password){
			showRegisterMessage("Insert password","alert alert-warning well-sm");
			return;
		}	
		if ( password != password2){
			showRegisterMessage("Passwords do not match","alert alert-warning well-sm");
			return;
		}
		
		var userToRegister = {User:{
			phone:phone,
			name:username,
			email:email,
			nif:nif,
			password:password
		}};
		
		proceedToRegister(userToRegister);
	}	
		
	function proceedToRegister(userToRegister){
		//Register user on SSLSignature server
		ssls.registerUser(userToRegister).then (function(createdUser){
			userId = createdUser.User.id;
			console.log ("User created: "+userId);
			//Issue JWT Id token for created user
			return ssls.issueJWT(userId);
		}).then (function (jwtResponse){
			jwt = jwtResponse.JWT.data;
			console.log("Issued JWT token by server: "+jwt);
			
			//Store JWT in browser sSO
			sslssso.login(jwt);
			alert ("User registered with ID "+userId);
			if (config.registerSuccessUrl){
				window.location.href = config.registerSuccessUrl;
			}
		}).catch (function (err){
			showRegisterError(err);
		});
	}
	
	function showRegisterError(err){
		console.log(err);
		var error = "No se ha podido registrar el usuario";
		if (err && err.responseJSON ){
			error = error + ": "+err.responseJSON.error;
		} else if (err) {
			error = error + ": "+err.status+ "-"+err.statusText;
		}	
		alert (error);
	}
	
	
	function authenticationPerformed(operation){
		var userId = operation.userId;
		var jwt = operation.jwt;
		if (userId){
			console.log ("User registered with userId "+userId);
			showRegisterMessage ("User registere");
		} else {
			console.log ("User  is not registered");
			var name = operation.name;
			var email = operation.email;
			var nif = operation.eIdentifier;
			if (operation.nif){
				nif = operation.nif;
			} 
			console.log ("name: "+name + " nif:"+nif)
			$('#usernameSignup').val(name);
			$('#nifSignup').val(nif);
			$('#emailSignup').val(email);
		}
		
		
	}
	
	
	
	