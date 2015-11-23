/*
 * @include OpenLayers/Format/WKT.js
*/

Ext.namespace("GEOR.Addons");

GEOR.Addons.Overpass = Ext.extend(GEOR.Addons.Base, {
    win: null,
    addressField: null,
    layer: null,
    popup: null,
    _requestCount: 0,
    _format: null,

    /**
     * Method: init
     *
     * Parameters:
     * record - {Ext.data.record} a record with the addon parameters
     */
    init: function(record) {
		if (!this.target) {
            alert("Overpass addon config error: requires a target property !");
            return;
        }
		
        this._format = new OpenLayers.Format.OSMGeometry();
        this.layer = new OpenLayers.Layer.Vector("__georchestra_overpass", {
            displayInLayerSwitcher: false
        });
        this.map.addLayer(this.layer);
        this.addressField = this._createCbSearch();

		// create a button to be inserted in toolbar:
		this.components = this.target.insertButton(this.position, [
            '-', this.addressField, '-'
        ]);
		this.target.doLayout();
    },

    /**
     * Method: _readPosition
     * Extracts the gml:Point > gml:pos String from the incoming GeocodedAddress
     *
     * Parameters:
     * v - {String}
     * node - {XML} the XML data corresponding to one GeocodedAddress record
     *
     * Returns: {OpenLayers.Geometry.Point}
     */
    _readPosition: function(v, node) {
		var xmlText = new XMLSerializer().serializeToString(node);
		var parser = new DOMParser();
		var xmlDoc = parser.parseFromString(xmlText,"text/xml");
		var feature = this._format.read(xmlDoc);
        return feature[0];
    },
	
	_computeQuery: function(query) {
		var computedQuery = '';
		for (var i = 0, len = query.length; i < len; i++) {
			var letter = query[i];
			computedQuery += '[';
			computedQuery += query[i].toUpperCase();
			computedQuery += query[i];
			if( query[i] == 'a' || query[i] == 'A' )
				computedQuery += 'ÂÃÄÀÁÅàáâãäå';
			if( query[i] == 'e' || query[i] == 'E' )
				computedQuery += 'ÈÉÊËèéêë';
			if( query[i] == 'i' || query[i] == 'I' )
				computedQuery += 'ÌÍÎÏìíîï';
			if( query[i] == 'o' || query[i] == 'O' )
				computedQuery += 'ÒÓÔÕÖØòóôõöø';
			if( query[i] == 'u' || query[i] == 'U' )
				computedQuery += 'ÙÚÛÜùúûü';
			if( query[i] == 'y' || query[i] == 'Y' )
				computedQuery += 'Ýý';
			if( query[i] == 'n' || query[i] == 'N' )
				computedQuery += 'Ññ';
			computedQuery += ']';
		}
		return computedQuery;
	},

    /*
     * Method: _createCbSearch
     * Returns: {Ext.form.ComboBox}
     */
    _createCbSearch: function() {
		var fields = [
			{
				name: 'geometry',
				convert: this._readPosition.createDelegate(this)
			}
		].concat(this.options.GeocodedAddressFields);
		var storeOptions = {
			proxy: new Ext.data.HttpProxy({
				url: this.options.serviceURL,
				method: "POST"
			}),
			reader: new Ext.data.XmlReader({
				record: "way"
			}, fields),
			listeners: {
				"beforeload": function(store, options) {
					var params = store.baseParams;
					var query = 'way["name"~"'+this._computeQuery(params['query'])+'"]; out geom '+this.options.limit+';';
					store.baseParams = {
						data: query
					};
				},
				scope: this
			}
		};
		
		var store = new Ext.data.Store(storeOptions),

		tplResult = new Ext.XTemplate(
			'<tpl for="."><div class="x-combo-list-item" ext:qtip="'+this.options.comboTemplate+'">',
				this.options.comboTemplate,
			'</div></tpl>'
		);

		return new Ext.form.ComboBox({
			name: "address",
			width: 350,
			emptyText: OpenLayers.i18n('overpass.field_emptytext'),
			fieldLabel: OpenLayers.i18n('overpass.field_label'),
			store: store,
			loadingText: OpenLayers.i18n('Loading...'),
			queryDelay: 100,
			hideTrigger: true,
			selectOnFocus: true,
			tpl: tplResult,                      // template to display results
			queryParam: 'query',         // do not modify
			minChars: 3,                        // min characters number to
												 // trigger the search
			pageSize: 0,                         // removes paging toolbar
			autoScroll: true,
			listeners: {
				"select": this._onComboSelect,
				scope: this
			}
		});
    },
	
    _onComboSelect: function(combo, record) {
        this.layer.destroyFeatures();
        this.popup && this.popup.destroy();
        var bbox, srcFeature, destGeom, destFeature,
            from = new OpenLayers.Projection("EPSG:4326"),
            to = new OpenLayers.Projection(this.map.getProjection());

        if (!record.get("geometry")) {
            return;
        }
		
		srcFeature = record.data.geometry;
		destGeom = srcFeature.geometry.transform(from,to);
		destFeature = new OpenLayers.Feature.Vector(destGeom);
	
		this.map.zoomToExtent(destGeom.getBounds());
		if( this.map.getZoomForExtent(destGeom.getBounds()) > 22 )
			this.map.zoomTo(22);
	
		this.layer.addFeatures([destFeature]);
	
        this.popup = new GeoExt.Popup({
            location: destFeature,
            width: 300,
            map: this.map,
            html: new Ext.XTemplate(
                    '<div class="x-combo-list-item">',
                        this.options.comboTemplate,
                    '</div>'
                ).apply(record.data),
            anchorPosition: "top-left",
            bodyStyle: "padding: 5px;",
            collapsible: false,
            closable: true,
            closeAction: "hide",
            unpinnable: true,
            listeners: {
                "hide": function() {
                    this.layer.destroyFeatures();
                },
                scope: this
            },
            buttons: [{
                text: tr("zoom"),
                handler: function() {
                    this.map.zoomToExtent(this.layer.getDataExtent());
                },
                scope: this
            }]
        });
        this.popup.show();
    },

    /**
     * Method: showWindow
     */
    showWindow: function() {
        this.win.show();
        this.win.alignTo(
            Ext.get(this.map.div),
            "t-t",
            [0, 5],
            true
        );
    },

    /**
     * Method: destroy
     * Called by GEOR_tools when deselecting this addon
     */
    destroy: function() {
        this.win.hide();
        this.popup && this.popup.destroy();
        this.popup = null;
        this.layer = null;
        
        GEOR.Addons.Base.prototype.destroy.call(this);
    }
});
