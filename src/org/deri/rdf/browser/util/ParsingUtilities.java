package org.deri.rdf.browser.util;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;

public class ParsingUtilities {

	 static public JSONObject evaluateJsonStringToObject(String s) throws JSONException {
	        if( s == null ) {
	            throw new IllegalArgumentException("parameter 's' should not be null");
	        }
	        JSONTokener t = new JSONTokener(s);
	        Object o = t.nextValue();
	        if (o instanceof JSONObject) {
	            return (JSONObject) o;
	        } else {
	            throw new JSONException(s + " couldn't be parsed as JSON object");
	        }
	    }

	    static public JSONArray evaluateJsonStringToArray(String s) throws JSONException {
	        JSONTokener t = new JSONTokener(s);
	        Object o = t.nextValue();
	        if (o instanceof JSONArray) {
	            return (JSONArray) o;
	        } else {
	            throw new JSONException(s + " couldn't be parsed as JSON array");
	        }
	    }
	    
	    static public String varname(String s){
	    	return s.toLowerCase().replaceAll("\\s+", "_").replaceAll("[^_a-zA-Z0-9]", "");
	    }
	    
	    static public Double replaceCommas(String s){
	    	//remove commas e.g. 2,799,300 becomes 2799300
	    	//exception 0,444 becomes 0.444
	    	Matcher m = p.matcher(s);
		    if (m.matches()){
		    	return Double.parseDouble(s.replace(",", "."));
		    }else{
		    	return Double.parseDouble(s.replaceAll(",", ""));
		    }
	    }
	    
	    static public String putCommasBack(Double d){
	    	return String.valueOf(d).replace(".", ",");
	    }
	    private static Pattern p = Pattern.compile("^0,\\d+");
}
