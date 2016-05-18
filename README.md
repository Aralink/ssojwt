# Multidomain Single sign-on with Json Web Tokens (JWT)
> Federate your websites using only javascript

Access to several web sites with a unique identification. Uses JSON Web Tokens (RFC7519) to represent the information exchanged between the identification provider (IDP) and service provider (SP). The JWT is shared and synchronized among all your websites through the browser local storage without need of server session

## How does it work
You have an excellent introduction to JWT in (https://jwt.io/introduction/) and use in a single sign-on on our website (spanish) (https://produccion.sslsignature.com/web/sso.html)

## Getting started
> With hosted version (it is free)

Define on page a `<meta>` field to indicate the sslsignature accountId
```
<meta name="ssls.accountId" content="5995a3c9-678b-4338-a674-362af68b9ef9" />
```
Include javascript
```
<script src="https://produccion.sslsignature.com/sslsignature/resources/js/sslssso.js"></script>
```
Create a function to receive the authenticated user
```
function onIdentification(operation){
    console.log("eidentifier: "+ operation.eIdentifier);
    console.log("name: "+ operation.name);
    console.log("jwt: "+ operation.jwt);
}
```
Identifícate aquí y comprueba que en tu página estás logueado, o bien accede a la página de demostración https://demo.aralink.com/sso

