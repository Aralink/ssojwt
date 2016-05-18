package com.aralink.sslsignature.sso.jwt.test;

public class SimpleConsoleLogger {
	public enum Level {	ERROR, WARN, INFO, DEBUG,TRACE}
	/*
	public enum Level {
		ERROR(0), WARN(1), INFO(2), DEBUG(3),TRACE(4);
		private final int id;
		Level(int id) { this.id = id; }
    	public int getValue() { return id; }	
	};
	 */
	private static Level level = Level.INFO;
	public static void setLevel (Level l){
		level = l;
	}
	public static Level getLevel(){
		return level;
	}

	public static void info(String message){
		log(Level.INFO,message);
	}
	public static void error(String message){
		log(Level.ERROR,message);
	}
	public static void warn(String message){
		log(Level.WARN,message);
	}
	public static void debug(String message){
		log(Level.DEBUG,message);
	}
	public static void trace(String message){
		log(Level.TRACE,message);
	}

	public static void log(Level level, String message){
		log(level,message,null);
	}
	public static void log(Level level, String message, Throwable throwable){
		if (level.ordinal() <= getLevel().ordinal()){
			System.out.println(level.name()+ " "+message);
			if (throwable != null)
				throwable.printStackTrace();
		}
	}

}
