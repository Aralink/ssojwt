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
2. Open a new tab in your browser with [this URL](https://desarrollo.sslsignature.com/sso/standalone/index.html). You will see that you ar logged in and the content of the JWT token
3. Now, here is the magic, open sso.html from the local demo, and you will see that you are registered with the same user

