function RdfBrowsingEngine(sparqlEndpointUrl,mainResourcesSelector,resourcesDiv, facetsDiv, summaryDiv, pageSizeControlsDiv, pagingControlsDiv, facetConfigs) {
	this._sparqlEndpointUrl = sparqlEndpointUrl;
	this._mainResourcesSelector = mainResourcesSelector;
    this._resourcesDiv = resourcesDiv;
    this._facetsDiv = facetsDiv;
    this._summaryDiv = summaryDiv;
    this._pageSizeControls = pageSizeControlsDiv;
    this._pagingControls = pagingControlsDiv;
    
    this._facets = [];
    this._limit = 10; this._offset = 0;
    this._filtered = 0;
}

RdfBrowsingEngine.prototype.getJSON = function() {
	var self = this;
    var a = {
    	sparqlEndpointUrl: self._sparqlEndpointUrl,
    	mainResourcesSelector: unescape(self._mainResourcesSelector),
        facets: []
    };
    for (var i = 0; i < this._facets.length; i++) {
        var facet = this._facets[i];
        a.facets.push(facet.facet.getJSON());
    }
    return a;
};

RdfBrowsingEngine.prototype.viewResources = function(resources){
	var getValue = function(obj, key){
		if(obj[key]){
				return obj[key][0];
		}else{
			return "";
		}
	};
	var self = this;
	this._resourcesDiv.empty();
	for(var i=0;i<resources.length;i++){
		var r = resources[i];
		TemplateEngine.viewResource(r,this._resourcesDiv);
	}
	
	self._pageSizeControls.empty().append($('<span></span>').html('Show: '));
	var sizes = [ 5, 10, 25, 50 ];
    var renderPageSize = function(index) {
        var pageSize = sizes[index];
        var a = $('<a href="javascript:{}"></a>')
            .addClass("viewPanel-pagingControls-page")
            .appendTo(self._pageSizeControls);
        if (pageSize == self._limit) {
            a.text(pageSize).addClass("selected");
        } else {
            a.text(pageSize).addClass("action").click(function(evt) {
                self._limit = pageSize;
                self.getResources();
            });
        }
    };
    for (var i = 0; i < sizes.length; i++) {
        renderPageSize(i);
    }

    
    self._pagingControls.empty();
    var from = (self._offset + 1);
   	var to = self._filtered?Math.min(self._filtered, self._offset + self._limit):'??';
    
    var firstPage = $('<a href="javascript:{}">&laquo; first</a>').appendTo(self._pagingControls);
    var previousPage = $('<a href="javascript:{}">&lsaquo; previous</a>').appendTo(self._pagingControls);
    if (self._offset > 0) {
        firstPage.addClass("action").click(function(evt) { self._onClickFirstPage(this, evt); });
        previousPage.addClass("action").click(function(evt) { self._onClickPreviousPage(this, evt); });
    } else {
        firstPage.addClass("inaction");
        previousPage.addClass("inaction");
    }
    
    $('<span>').addClass("viewpanel-pagingcount").html(" " + from + " - " + to + " ").appendTo(self._pagingControls);
    
    var nextPage = $('<a href="javascript:{}">next &rsaquo;</a>').appendTo(self._pagingControls);
    var lastPage = $('<a href="javascript:{}">last &raquo;</a>').appendTo(self._pagingControls);
    if (self._filtered===0 || self._offset + self._limit < self._filtered) {
        nextPage.addClass("action").click(function(evt) { self._onClickNextPage(this, evt); });
        lastPage.addClass("action").click(function(evt) { self._onClickLastPage(this, evt); });
    } else {
        nextPage.addClass("inaction");
        lastPage.addClass("inaction");
    }
    
	
};

RdfBrowsingEngine.prototype.viewHeader = function(){
	var self = this;
	$('<span></span>').text(self._filtered + ' matching datasets').prependTo(this._summaryDiv.empty());
};

RdfBrowsingEngine.prototype.addFacet = function(type, config, options) {
    var elmt = this._createFacetContainer();
    var facet;
    facet = new RdfPropertyListFacet(elmt, config, options);
    
    this._facets.push({ elmt: elmt, facet: facet });
    
    this.update();
};

RdfBrowsingEngine.prototype.addFacets = function(facets) {
	for(var i=0;i<facets.length;i++){
    	var elmt = this._createFacetContainer();
    	var facet;
    	facet = new RdfPropertyListFacet(elmt, facets[i].config);
    
    	this._facets.push({ elmt: elmt, facet: facet });
	}
	
	this.update();
};

RdfBrowsingEngine.prototype._createFacetContainer = function() {
    return $('<li></li>').addClass("facet-container").attr("id","facet-" + this._facets.length).hide().appendTo(this._facetsDiv.find('.facets-container'));
};

RdfBrowsingEngine.prototype.update = function(onlyFacets) {
	var self = this;
	for(var i=0;i<self._facets.length;i++){
		self._facets[i].facet.setLoadingState();
	}
	$.post(
	        "compute-facets",
	        { "rdf-engine": JSON.stringify(this.getJSON(true)) },
	        function(data) {
	        	self._sparqlEndpointUrl = data.sparqlEndpointUrl;
	        	var facetData = data.facets;
	            for (var i = 0; i < facetData.length; i++) {
	                self._facets[i].facet.updateState(facetData[i]);
	            }
	            
	            
	        },"json");
	if(onlyFacets!==true){
		this.getResources(0);
		$.post("count-resources",{"rdf-engine": JSON.stringify(this.getJSON(true))},function(data){
			self._filtered = data.filtered;
			self.viewHeader();
		},"json");
	}
	
};

RdfBrowsingEngine.prototype._onClickFirstPage = function(){
	this.getResources(0);
};
RdfBrowsingEngine.prototype._onClickPreviousPage = function(elmt, evt) {
	this.getResources(this._offset - this._limit);
};
RdfBrowsingEngine.prototype._onClickNextPage = function(elmt, evt) {
	this.getResources(this._offset + this._limit);
};
RdfBrowsingEngine.prototype._onClickLastPage = function(elmt, evt) {
	this.getResources(Math.floor(this._filtered / this._limit) * this._limit);
};

RdfBrowsingEngine.prototype.getResources = function(start,onDone) {
	var self = this;
	if(!start){start=0;}
	var dismissBusy = DialogSystem.showBusy();
	$.post("get-resources?limit=" + this._limit + "&offset=" + start,{"rdf-engine": JSON.stringify(this.getJSON(true))},function(data){
		self._limit = data.limit;
    	self._offset = data.offset;
    	TemplateEngine.__loadConfig(function(){self.viewResources(data.resources, $('#view-panel'));});
		dismissBusy();
	},"json");
};