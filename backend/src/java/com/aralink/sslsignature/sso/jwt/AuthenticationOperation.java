package com.aralink.sslsignature.sso.jwt;

import java.io.StringReader;
import java.util.HashMap;
import java.util.Map;




import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.jsonwebtoken.Claims;



public class AuthenticationOperation {
	
	private Map<String,String> params = new HashMap<String,String>();
	
	/**
	 * FAIL operation
	 * @param e error produced parsing or validating JWT
	 */
	public AuthenticationOperation(Exception e){
		params.put("status", "FAIL");
		params.put("error", e.getMessage());
	}
	
	/**
	 * Success operation.
	 * Return all fields parsed
	 * @param the body of JWT
	 */
	public AuthenticationOperation(Claims body){
		params.put("status", "SUCCESS");
		
		for (String key: body.keySet()){
			Object value = body.get(key);
			if (value instanceof String){
				params.put(key, (String)value);
			}	
		}
	}
	
	/**
	 * JSON Coder. 
	 * Use jackson or your preferred dependendy 
	 * @return
	 */
	public String toJSON(){
		
		StringBuffer buf = new StringBuffer();
		buf.append("{");
		String prefix = "";
		for (String key:params.keySet()){
			buf.append(prefix).append("\"").append(key).append("\":\"").append(params.get(key)).append("\"");
			prefix=",";
		}
		
		buf.append("}");
		return buf.toString();
	}
	
}
