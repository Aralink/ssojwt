package com.aralink.sslsignature.sso.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.UnsupportedJwtException;



import java.security.Key;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;


import java.util.Map;



public class JWTManager {
	public final static  SignatureAlgorithm DEFAULT_HMAC_SIGNATURE_ALGORITHM = SignatureAlgorithm.HS256;
	public final static  SignatureAlgorithm DEFAULT_HMAC_KEY_ALGORITHM = SignatureAlgorithm.HS512;

	private HMACKeyContainer hmacKeyContainer;
	private String issuer = "JWT SAMPLE ISSUER";
	private int expirationTimeInHours = 24;
	
	public JWTManager(HMACKeyContainer hmacKeyContainer){
		this.hmacKeyContainer = hmacKeyContainer;
	}
	
	public String getIssuer() {
		return issuer;
	}

	public void setIssuer(String issuer) {
		this.issuer = issuer;
	}

	public int getExpirationTimeInHours() {
		return expirationTimeInHours;
	}

	public void setExpirationTimeInHours(int expirationTimeInHours) {
		this.expirationTimeInHours = expirationTimeInHours;
	}



	private  Date exp (int calendar,int len){
		GregorianCalendar gc = new GregorianCalendar();
		gc.add(calendar,len);
		Date expires = gc.getTime();
		return expires;
	}

	private boolean isExpired(Claims body, Date actual){
		return body.getExpiration().before(actual);
	}


	private boolean isExpired(Claims body){
		return isExpired(body,new Date());
	}
	
	
	public String issueJWT(@SuppressWarnings("rawtypes") Map extra){

		//get hmac signature key 
		Key key = hmacKeyContainer.getHmacKey();

		String subject = "none";
		//Get required subject ID
		if (extra.get("sub") != null)
			subject = ((String[])extra.get("sub"))[0];
		
		//Build token
		JwtBuilder builder =  Jwts.builder()
				.setSubject(subject)
				.setIssuer(getIssuer())
				.setIssuedAt(new java.util.Date())
				.setExpiration(exp (Calendar.HOUR,getExpirationTimeInHours()));
				
		
		//Body with extra fields
		for (Object extKey: extra.keySet()){
			if (!extKey.equals("sub"))
				builder.claim((String)extKey,((String[])extra.get(extKey))[0]);
		}		

		String token = builder.signWith(JWTManager.DEFAULT_HMAC_SIGNATURE_ALGORITHM, key).compact();

		return token;
	}

	
	

	public Claims validateJWT ( String jwtToken)throws Exception{

		//Get signature key
		Key key = hmacKeyContainer.getHmacKey();

		try{
			//Check signature and parse body
			Claims body = Jwts.parser().setSigningKey(key).parseClaimsJws(jwtToken).getBody();

			//Check expiration
			if (isExpired(body))
				throw new Exception ( "key expired");

			return body;
		}catch 	(UnsupportedJwtException e){
			System.err.println("Bad JWT token: "+e.getMessage());
			throw new Exception ( " Bad JWT token");
		}catch 	(MalformedJwtException e){
			System.err.println("Bad JWT token: "+e.getMessage());
			throw new Exception ( " Bad JWT token");
		}catch 	(IllegalArgumentException e){
			System.err.println("Bad JWT token: "+e.getMessage());
			throw new Exception ( " Bad JWT token");
		}catch 	(SignatureException e){
			System.err.println(" BAD PUBLIC KEY");
			throw new Exception ( "Bad signature in JWT token");
		} catch (ExpiredJwtException e){
			System.err.println("Expired JWT token: "+e.getMessage());
			throw new Exception ( "Expired JWT token: "+e.getMessage());
		}

	}
	
}
