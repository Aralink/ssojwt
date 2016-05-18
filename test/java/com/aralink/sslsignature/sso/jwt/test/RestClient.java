package com.aralink.sslsignature.sso.jwt.test;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Map;

import javax.xml.bind.DatatypeConverter;


public class RestClient {
	private static final String CONTENT_TYPE_OCTET_STREAM =	"application/octet-stream";
	private static final String CONTENT_TYPE_JSON =	"application/json";
	private static final String CONTENT_TYPE_FORM =	"application/x-www-form-urlencoded";
	
	private String baseurl;
	private String user;
	private String password;

	public RestClient (String url){
		setUrl(url);
	}

	public RestClient (String url, String user, String password){
		setUrl(url);
		setUser(user);
		setPassword(password);		
	}


	public String getUrl() {
		return baseurl;
	}
	public void setUrl(String url) {
		this.baseurl = url;
	}
	public String getUser() {
		return user;
	}
	public void setUser(String user) {
		this.user = user;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}



	public String postJson(String uri, String jsonRequest) throws IOException{

		HttpURLConnection conn = getConnection("POST",uri,CONTENT_TYPE_JSON);
		conn.connect();
		SimpleConsoleLogger.debug("request body: "+jsonRequest);
		upload(conn,jsonRequest.getBytes());

		return processJsonResponse(conn);
	} 
	
	public String postForm(String uri, Map<String, String> formParams) throws IOException{

		HttpURLConnection conn = getConnection("POST",uri,CONTENT_TYPE_FORM);
		conn.connect();
		String request = serialize(formParams);
		SimpleConsoleLogger.debug("request body: "+formParams);
		upload(conn,request.getBytes());

		return processJsonResponse(conn);
	} 

	public String post(String uri) throws IOException{

		HttpURLConnection conn = getConnection("POST",uri,CONTENT_TYPE_JSON);
		conn.connect();
		return processJsonResponse(conn);
	} 

	public String get(String uri) throws IOException{

		HttpURLConnection conn = getConnection("GET",uri,CONTENT_TYPE_JSON);
		conn.setRequestProperty("Accept", CONTENT_TYPE_JSON);
		conn.connect();
		return processJsonResponse(conn);

	} 

	public InputStream getStream(String uri) throws IOException{

		HttpURLConnection conn = getConnection("GET",uri,CONTENT_TYPE_JSON);
		conn.connect();
		return processStreamResponse(conn);

	} 

	public String delete(String uri) throws IOException{

		HttpURLConnection conn = getConnection("DELETE",uri,CONTENT_TYPE_JSON);
		conn.connect();
		return processJsonResponse(conn);
	} 

	public String postStream(String uri, byte data[])throws  IOException{

		HttpURLConnection conn = getConnection("POST",uri,CONTENT_TYPE_OCTET_STREAM);
		conn.connect();
		upload(conn,data);
		return processJsonResponse(conn);
	}

	private String processJsonResponse(HttpURLConnection conn)throws IOException{

		int statusCode = conn.getResponseCode();
		SimpleConsoleLogger.info("response code: "+statusCode);
		if (statusCode == 200 ||statusCode == 201 ||statusCode == 204) {
			//OK
			InputStream is = conn.getInputStream();
			String responseString = read(is);
			SimpleConsoleLogger.debug("response body: "+responseString);
			return responseString;
		} else {
			InputStream is =conn.getErrorStream();
			String error = read(is);

			throw new IOException(error);
		}
	}

	private InputStream processStreamResponse(HttpURLConnection conn)throws IOException{

		//Recibe respuesta
		int statusCode = conn.getResponseCode();
		SimpleConsoleLogger.info("response code: "+statusCode);
		if (statusCode == 200 ||statusCode == 201) {
			InputStream is = conn.getInputStream();
			return is;
		} else {
			InputStream is =conn.getErrorStream();
			String error = read(is);

			throw new IOException(error);
		}
	}

	private void upload(HttpURLConnection conn, byte data[]) throws IOException{
		OutputStream os = conn.getOutputStream();
		os.write(data);
		os.flush();
		os.close();
	}

	private HttpURLConnection getConnection(String method,String uri, String contentType) throws IOException{
		String URL = baseurl + uri; 
		SimpleConsoleLogger.info(method+" "+URL);
		SimpleConsoleLogger.debug("username:"+user+ " PASSWORD:"+password);
		URL url = new URL(URL);
		HttpURLConnection conn = (HttpURLConnection)url.openConnection();
		conn.setRequestMethod(method);
		if ("POST".equals(method))
			conn.setDoOutput(true);

		if (user != null){
			String basicAuth = "Basic " + DatatypeConverter.printBase64Binary((user+":"+password).getBytes());
			conn.setRequestProperty ("Authorization", basicAuth);
			conn.setRequestProperty("Content-Type",contentType);
		}
		return conn;

	}  

	private static String read(InputStream in) throws IOException{

		InputStreamReader is = new InputStreamReader(in);
		StringBuilder sb=new StringBuilder();
		BufferedReader br = new BufferedReader(is);
		String read = br.readLine();

		while(read != null) {
			sb.append(read);
			read =br.readLine();

		}
		is.close();

		return sb.toString();
	}
	
	private static String serialize(Map<String,String> params){
		StringBuffer buf = new StringBuffer();
		
		String prefix = "";
		for (String key:params.keySet()){
			buf.append(prefix).append(key).append("=").append(params.get(key));
			prefix="&";
		}		
		
		return buf.toString();
	}


}
