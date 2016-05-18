package com.aralink.sslsignature.sso.jwt;

import io.jsonwebtoken.Claims;

import java.io.IOException;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


@SuppressWarnings("serial")
public class JWTServlet extends HttpServlet {

	private HMACKeyContainer hmacKeyContainer;
	private JWTManager jwtManager;

	public void init(ServletConfig config) throws ServletException {
		super.init(config);
		String keyFile = config.getInitParameter("keyFile");
//		String issuer = config.getInitParameter("issuer");
		
		try{
			//Init HMAC key from file. If it not exists, creates a new one
			hmacKeyContainer = new HMACKeyContainer(keyFile);
			jwtManager = new JWTManager (hmacKeyContainer);
			
		}catch (IOException e){
			throw new ServletException(e);
		} 

		System.out.println("servlet init: "+keyFile);
	}

	public void doOptions(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException  {
		System.out.println("OPTIONS REQUESTS ");
		response.addHeader("Access-Control-Allow-Origin", "*");
	}
	
	public void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException  {
		doPost(request,response);
	}

	public void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException  {

		String jwt = request.getParameter("jwt");
		if (jwt != null){
			AuthenticationOperation result = null;
			//validateToken
			try{
				Claims body = jwtManager.validateJWT(jwt);
				//Validation successful
				result = new AuthenticationOperation(body);
				System.out.println("JWT validation SUCCESS for SUB: "+body.getSubject());
			}catch (Exception e){
				//Validation fail
				result = new AuthenticationOperation(e);
				System.err.println("JWT validation failed: "+e.getMessage());
			}
			
			//Response JSON & enable CORS 
			response.setContentType("application/json");
			response.addHeader("Access-Control-Allow-Origin", "*");
			System.out.println(result.toJSON());
			response.getWriter().print(result.toJSON());
		} else {
			
			//Issue new token
			jwt = jwtManager.issueJWT(request.getParameterMap());
			System.out.println("Issued new JWT "+jwt);
			
			//Response TEXT & enable CORS
			response.setContentType("text/html");	
			response.addHeader("Access-Control-Allow-Origin", "*");
			response.getWriter().print(jwt);
		}
	}
	
	public void destroy()  {
		// do nothing.
	}
	

}