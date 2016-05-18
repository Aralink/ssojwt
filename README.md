# Multidomain Single sign-on with Json Web Tokens (JWT)
> Federate your websites using only javascript

Access to several web sites with a unique identification. Uses JSON Web Tokens (RFC7519) to represent the information exchanged between the identification provider (IDP) and service provider (SP). The JWT is shared and synchronized among all your websites through the browser local storage without need of server session

## How does it work
You have an excellent introduction to JWT in (https://jwt.io/introduction/) and use in a single sign-on on our website (spanish) (https://produccion.sslsignature.com/web/sso.html)

## Getting started
> With hosted version (it is free)

Define on page a `<meta>` field to indicate the sslsignature accountId
```
<meta name="ssls.accountId" content="jwtdemo" />
```
Include javascript
```
<script src="https://produccion.sslsignature.com/sso/resources/js/sslssso.js"></script>
```
Create a function to receive the authenticated user
```
function onIdentification(operation){
    console.log("eidentifier: "+ operation.eIdentifier);
    console.log("name: "+ operation.name);
    console.log("jwt: "+ operation.jwt);
}
```
Now, we are going to see it in action (download the demo for the third step)

1. Create a JWT [here](https://desarrollo.sslsignature.com/sso/standalone/index.html). This would be done in your login form
2. Open a new tab in your browser with [this URL](https://desarrollo.sslsignature.com/sso/standalone/sso.html). You will see that you ar logged in and the content of the JWT token
3. Now, here is the magic, open sso.html from the local demo, and you will see that you are registered with the same user

##Install
### Content of the repository
* /backend  -->The sample server
* /build    -->Build scripts
* /client   -->Javascript library for your pages
* /dist     -->Precompiled sso.war to deploy javascript, sample server and demos on a container like tomcat
* /test     -->Demo pages (hosted and standalone) and a java sample client to issue/validate tokens

### Javascript library
Simply copy the library 'sslssso.js' and its dependencies on a web server. 
{yourserver.com}/{ssopath}/js/sslssso.js
{yourserver.com}/{ssopath}/html/sso.html
sslssso will access sso.html and related .js, therefore expect to find this structure

Include a javascript reference in your page to sslssso.js
```
<script src="{yourserver.com}/{ssopath}/js/sslssso.js"></script>
```
or use hosted
```
<script src="https://produccion.sslsignature.com/sso/resources/js/sslssso.js"></script>
```
### Backend server
The signature key to issue tokens (and validate) must be well protected, usually on the server. You can use a hosted account from SSLSignature (free of charges) or issue tokens from your own server. The project includes a sample server with autogenerated HMAC keys

####Use your own server
Yo need to provide a REST service to validate the JWT from the client side
```
POST /{ssoValidationUri} HTTPS
Content-Type=application/x-www-form-urlencoded
Host: yourserver.com
jwt={jwt}
```
The answer must have code 200, status = FAILED / SUCCESS, and the JWT parsed fields in JSON format
```
{"status":"SUCCESS","name":"theName","eidentifier":"theEidentifier"}
```
Configure the custom validation URL in the <meta> tags of the page or using javascript 
```
<meta name="ssls.validationUrl" content="{yourserver.com}/{ssoValidationUri}" />
<meta name="ssls.validate" content="true"/>

var ssls_validationUrl={yourserver.com}/{ssoValidationUri};
```
If you do not want the tokens are validated on the client side, set validate = false. Then no server configuration is needed, and sslssso.js only will decode jwt token and check expiration on the client side.

####Use the sample server
Take care that it is only an example and it is not intended for a production system

Deploy sso.war in a J2EE container like tomcat. The first time you run the HMAC signing key will be created in a file called jwt.hmac (configure location in WEB-INF/web.xml)

The JWT validation service will be available on {yourserver.com}/sso/jwt
The sample server also allow you to issue JWT. Invoke the service providing the fields to be included in JWT
```
POST /sso/jwt HTTPS
Content-Type=application/x-www-form-urlencoded
Host: yourserver.com
sub=123456&eidentifier=john.smith&name=John+Smith&phone=34+661661661&email=john.smith%40mycompany.com&other=...
```
The response will be the JWT string
```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTYiLCJpc3MiOiJKV1QgU0FNUExFIElTU1VFUiIsImlhdCI6MTQ2MzU4MTg4MSwiZXhwIjoxNDYzNjY4MjgxLCJwaG9uZSI6IjM0IDY2MTY2MTY2MSIsIm90aGVyIjoiLi4uIiwiZWlkZW50aWZpZXIiOiJqb2huLnNtaXRoIiwiZW1haWwiOiJqb2huLnNtaXRoQG15Y29tcGFueS5jb20iLCJuYW1lIjoiSm9obiBTbWl0aCJ9.eaihxfyO8zWJJm0o97T6p-Cql9oe6n_3SLj0MphGbBA
```
Configure expiration or issuer in JWTServlet class. 

####Use the hosted server
The SSLSignature could issue and validate the JWT for your system. You need an account. After that, the configuration is simple as shown in 'Getting started'.

To issue a new token after a successful authentication in your system invoke this service. Provide a JSON with your required fields. 
```
POST /sslsignature/account/jwt HTTPS
Authorization=Basic ...
Content-Type=application/json
Host: produccion.sslsignature.com
{
   sub: "yourInternalId",
   eidentifier: "yourUserIdentifier",
   name: "user name",
   other: "other..."
}
```
Also is needed an authorization header (basic http auth) in the way `Basic Base64(accountId:apiKey)`. The string 'Basic' followed by the base64 encoding of the provided accountId, ':' and apiKey
