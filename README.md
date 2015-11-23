Overpass ADDON
===============

author: @jusabatier

The addon config should look like this:
```
{
	"id": "overpass_0",
	"name": "Overpass",
	"title": {
		"en": "Overpass search (OSM)",
		"es": "Buscar a través Overpass (OSM)",
		"fr": "Recherche via Overpass (OSM)"
	},
	"description": {
		"en": "Overpass search (OSM)",
		"es": "Buscar a través Overpass (OSM)",
		"fr": "Recherche via Overpass (OSM)"
	},
	"options": {
		"serviceURL": "http://overpass-api.de/api/interpreter",
		"target": "tbar_11",
		"limit": 100
	},
	"preloaded": true
}
```

Options
========

Mandatory options:
 * **serviceURL** - points to the overpass service to use
 * **limit** - maximum number of results
