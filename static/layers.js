$(document).ready(function () {
	$.ajax({
		url: "/devices",
		dataType: "json",
		success: function (data) {
			var mapData = {
				div: "map",
				allOverlays: true,
				layers: [
					new OpenLayers.Layer.OSM(),
					//new OpenLayers.Layer.Google("Google Streets")
				],
			};
			data.devices.map(function (device) {
				var l = new OpenLayers.Layer.Vector(device.path, {
					strategies: [
						new OpenLayers.Strategy.Fixed(),
						new OpenLayers.Strategy.Refresh({force: true, active: true, interval: 1000})
					],
					protocol: new OpenLayers.Protocol.HTTP({
						url: "/kml?devices=" + escape(device.path),
						format: new OpenLayers.Format.KML({
							extractStyles: true,
							extractAttributes: true,
							maxDepth: 2
						})
					}),
					style: {
						'strokeWidth': 5,
						'strokeColor': '#ff0000'
					}
				});
				l.events.register("loadend", l, function() {
					//console.log(l.features[0].geometry.components[0].x)
					//console.log(l.features[0].geometry.components[l.features[0].geometry.components.length-1].x)
					var feature = new OpenLayers.Feature.Vector(
						new OpenLayers.Geometry.Point(l.features[0].geometry.components[l.features[0].geometry.components.length-1].x, l.features[0].geometry.components[l.features[0].geometry.components.length-1].y),
						{
							description: "Description"
						},
						{
							externalGraphic : './marker.png',
							graphicWidth    : 45,
							graphicHeight   : 70,
							graphicXOffset  : -18,
							graphicYOffset  : -70
						}
					);
					l.addFeatures(feature);
				});
				mapData.layers.push(l);
			});
			var map = new OpenLayers.Map(mapData);
			map.addControl(new OpenLayers.Control.LayerSwitcher());
			map.setCenter(new OpenLayers.LonLat(10.447683, 51.163375).transform('EPSG:4326', 'EPSG:3857'), 6);
		}
	});
});
