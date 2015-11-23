/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Format/OSM.js
 * @requires OpenLayers/Format/XML.js
 * @requires OpenLayers/Feature/Vector.js
 * @requires OpenLayers/Geometry/Point.js
 * @requires OpenLayers/Geometry/LineString.js
 * @requires OpenLayers/Geometry/Polygon.js
 * @requires OpenLayers/Projection.js
 */

/**  
 * Class: OpenLayers.Format.OSM-Geometry
 * OSM parser. Create a new instance with the 
 *     <OpenLayers.Format.OSM-Geometry> constructor.
 *
 * Inherits from:
 *  - <OpenLayers.Format.OSM>
 */
OpenLayers.Format.OSMGeometry = OpenLayers.Class(OpenLayers.Format.OSM, {
    /**
     * Method: getNodes
     * Return the node items from a doc.  
     *
     * Parameters:
     * doc - {DOMElement} node to parse tags from
     */
    getNodes: function(doc) {
        var node_list = doc.getElementsByTagName("nd");
        var nodes = {};
        for (var i = 0; i < node_list.length; i++) {
            var node = node_list[i];
            var id = node.getAttribute("ref");
            nodes[id] = {
                'lat': node.getAttribute("lat"),
                'lon': node.getAttribute("lon"),
                'node': node
            };
        }
        return nodes;
    },

    CLASS_NAME: "OpenLayers.Format.OSMGeometry" 
});     