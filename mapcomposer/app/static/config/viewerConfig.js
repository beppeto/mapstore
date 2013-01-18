{
    "geoStoreBase":"http://localhost:8080/geostore/rest/",
    "proxy":"/http_proxy/proxy/?url=",
    "xmlJsonTranslate": "http://localhost:8080/xmlJsonTranslate/",
    "gsSources": {
        "google": {
            "ptype": "gxp_googlesource"
        }
    },
    "map":{
        "projection": "EPSG:900913",
        "units": "m",
        "maxExtent": [
            -20037508.34, -20037508.34,
            20037508.34, 20037508.34
        ],
        "layers": [{
            "source": "google",
            "title": "Google Hybrid",
            "name": "HYBRID",
            "group": "background"
        }],
        "center": [1250000.000000, 5370000.000000],
        "zoom": 5
    },
	
	"customTools":[
		{
			"actions": ["->"], 
			"actionTarget": "paneltbar"
		}, {
			"ptype": "gxp_googlegeocoder",
			"outputConfig": {
				"emptyText": "Google GeoCoder"
			},
			"outputTarget":"paneltbar",
			"index": 26
		}
	]
}
