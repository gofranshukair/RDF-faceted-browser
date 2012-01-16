var rdf_engine = {};

var RdfBrowser = {
	facets_URL : "facets.json",
	initialize:function(endpointUrl,mainResourcesSelector){
		var rightPanelDiv = $('#right-panel');
		var leftPanelDiv = $('#left-panel');
		var viewPanelDiv = $('#view-panel');
		var summaryDiv = $('#summary-bar');
		var pageSizeControlsDiv = $('.viewpanel-pagesize');
		var pageControlsDiv = $('.viewpanel-paging');
		this._engine = new RdfBrowsingEngine(endpointUrl,mainResourcesSelector,viewPanelDiv,leftPanelDiv,summaryDiv,pageSizeControlsDiv,pageControlsDiv);
		rdf_engine = this._engine;
		resize(rightPanelDiv,leftPanelDiv,viewPanelDiv);
		var self = this;
		$.ajax({
				url:self.facets_URL,
				success:function(facets_data){
					self._engine.addFacets(jQuery.parseJSON(facets_data));
				}
				});
	}
};

$(function(){
	var params = window.location.search;
	var r = {};
	if (params.length > 1) {
        params = params.substr(1).split("&");
        $.each(params, function() {
            pair = this.split("=");
            r[pair[0]] = unescape(pair[1]).replace(/[\\+]/g," ");
        });
    }
	var endpointUrl = r["endpointUrl"];
	if(!endpointUrl){
		//redirect
		window.location.href = "configure.html";
		return;
	}
	var mainResourcesSelector = r["mainResourcesSelector"];
	if(!mainResourcesSelector){
		mainResourcesSelector = "?x a <http://www.w3.org/ns/dcat#Dataset>. ";
	}
	RdfBrowser.initialize(endpointUrl,mainResourcesSelector);
});

function resize(rightPanelDiv,leftPanelDiv,viewPanelDiv) {
	
	
    var header = $("#header");
    
    var leftPanelWidth = 300;
    var width = $(window).width();
    var top = $("#header").outerHeight();
    var height = $(window).height() - top;
    
    var leftPanelPaddings = leftPanelDiv.outerHeight(true) - leftPanelDiv.height();
    leftPanelDiv
        .css("top", top + "px")
        .css("left", "0px")
        .css("height", (height - leftPanelPaddings) + "px")
        .css("width", leftPanelWidth + "px");
        
    var rightPanelVPaddings = rightPanelDiv.outerHeight(true) - rightPanelDiv.height();
    var rightPanelHPaddings = rightPanelDiv.outerWidth(true) - rightPanelDiv.width();
    rightPanelDiv
        .css("top", top + "px")
        .css("left", leftPanelWidth + "px")
        .css("height", (height - rightPanelVPaddings) + "px")
        .css("width", (width - leftPanelWidth - rightPanelHPaddings) + "px");
    
    viewPanelDiv.height((height  - rightPanelVPaddings) + "px");
    
}

RdfBrowser.update = function(onlyFacets){
	rdf_engine.update(onlyFacets);
};