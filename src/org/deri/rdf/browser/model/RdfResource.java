package org.deri.rdf.browser.model;


import java.util.Collection;
import java.util.Map.Entry;

import org.json.JSONException;
import org.json.JSONWriter;

import com.google.common.collect.HashMultimap;
import com.google.common.collect.SetMultimap;

public class RdfResource {

	protected final String uri;
	protected SetMultimap<String, String> properties = HashMultimap.create(); 
	
	public RdfResource(String uri){
		this.uri = uri;
	}

	public String getUri() {
		return uri;
	}

	public SetMultimap<String, String> getProperties() {
		return properties;
	}
	
	@Override
	public int hashCode() {
		return uri.hashCode();
	}

	@Override
	public boolean equals(Object obj) {
		if(obj==null) return false;
		
		if(obj.getClass().equals(this.getClass())){
			return this.getUri().equals( ((RdfResource)obj).getUri());
		}
		return false;
	}
	
	public void write(JSONWriter writer) throws JSONException{
		writer.object();
		writer.key("@"); writer.value(this.uri);
		for(Entry<String, Collection<String>> entry:properties.asMap().entrySet()){
			writer.key(entry.getKey());
			writer.array();
			for(String v:entry.getValue()){
				writer.value(v);
				
			}
			writer.endArray();
		}
		
		writer.endObject();
	}
	
}
