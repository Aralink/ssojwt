package com.aralink.sslsignature.sso.jwt;


import io.jsonwebtoken.impl.crypto.MacProvider;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Key;

import javax.crypto.spec.SecretKeySpec;



public class HMACKeyContainer {

	
	private Key key;
	
	public HMACKeyContainer()throws IOException{
		this(null);
	}
	public HMACKeyContainer(String keyFile) throws IOException{
		if (keyFile == null || keyFile.length()==0){
	    	 keyFile = "jwthmac.key";
	    }
		
		Path path = Paths.get(keyFile);
		if (!path.toFile().exists()){
			//File not exists. Create new File
			generateKey(path);
		} else  {
			//Reads the HMAC key from file
			byte[] data = Files.readAllBytes(path);	
			key = hmacKeyFromEncoded(data);
			System.out.println("init HMAC key from file: "+path.toAbsolutePath());
		}		
		
	}
	public Key getHmacKey(){
		return key;
	}
	private Key generateKey(Path path) throws IOException{
		//path..createNewFile();
		key = MacProvider.generateKey(JWTManager.DEFAULT_HMAC_KEY_ALGORITHM);
		byte data[] = key.getEncoded();
		Files.write(path, data);
		System.out.println("created new HMAC key in file: "+path.toAbsolutePath());
		return key;
	}	
	
	public static Key hmacKeyFromEncoded(byte encodedHmacKey[]){
		if (encodedHmacKey != null && encodedHmacKey.length>0){
			Key key = new SecretKeySpec(encodedHmacKey,JWTManager.DEFAULT_HMAC_KEY_ALGORITHM.getJcaName());
			return key;
		}
		return null;
	}
	
}
