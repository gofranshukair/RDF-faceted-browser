package org.deri.rdf.browser.facet;

import java.util.ArrayList;
import java.util.List;

import org.deri.rdf.browser.sparql.QueryEngine;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONWriter;

import com.google.common.collect.SetMultimap;

public class RdfSearchFacet implements RdfFacet {
	/*
	 * Configuration
	 */
	protected String _name;
	protected String _endpointVendor;
	protected String _property;
	protected boolean _invert;

	protected String _errorMessage;

	private String query;

	
	@Override
	public String getName() {
		return _name;
	}

	@Override
	public void computeChoices(String sparqlEndpoint, QueryEngine engine,
			String filter, SetMultimap<RdfFacet, RdfDecoratedValue> filters) {
		// nothing to do

	}

	@Override
	public void initializeFromJSON(JSONObject o) throws JSONException {
		_name = o.getString("name");
		_endpointVendor = o.getString("endpoint_vendor");
		_property = o.getString("property");
		_invert = o.has("invert") && o.getBoolean("invert");

		query = o.has("query")?o.getString("query"):"";
	}

	@Override
	public void write(JSONWriter writer) throws JSONException {
		writer.object();
		writer.key("name");
		writer.value(_name);
		writer.key("endpoint_vendor");
		writer.value(_endpointVendor);
		writer.key("property");
		writer.value(_property);
		writer.key("invert");
		writer.value(_invert);

		if (_errorMessage != null) {
			writer.key("error");
			writer.value(_errorMessage);
		} else {
			writer.key("query");
			writer.value(query);
		}

		writer.endObject();

	}

	@Override
	public boolean hasSelection() {
		return query != null && ! query.isEmpty();
	}

	@Override
	public List<RdfDecoratedValue> getSelection() {
		if (query == null || query.isEmpty()) {
			return new ArrayList<RdfDecoratedValue>();
		} else {
			ArrayList<RdfDecoratedValue> lst = new ArrayList<RdfDecoratedValue>();
			lst.add(new RdfDecoratedValue(query,true));
			return lst;
		}
	}

	@Override
	public String getResourceSparqlSelector(String varname, RdfDecoratedValue val) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String getLiteralSparqlSelector(String mainSelector, String varname, String auxVarName, RdfDecoratedValue val) {
		if(_endpointVendor.equals("Virtuoso")){
			return "?" + varname + " " + _property + " ?" + auxVarName + " . ?" + auxVarName + " bif:contains \"'" + val.getValue() + "*'\". ";
		}else{
			return "?" + varname + " " + _property + " ?" + auxVarName + " . FILTER regex(str(?" + auxVarName + "),'" + val.getValue() + "','i'). ";
		}
	}

	@Override
	public boolean isBlankSelected() {
		return false;
	}

}
