//Import GEE Feature Collection (Somaliland kml)
var geometry = ee.FeatureCollection('users/japhethjapho7/New_study_area');

// Create image collection of S-2 imagery for the perdiod 2016-2018
var S2 = ee.ImageCollection('COPERNICUS/S2')

//filter start and end date
.filterDate('2016-04-01', '2020-05-31')

//filter according to drawn boundary
.filterBounds(geometry);

// Function to mask cloud from built-in quality band
// information on cloud
var maskcloud1 = function(image) {
var QA60 = image.select(['QA60']);
return image.updateMask(QA60.lt(1));
};

// Function to calculate and add an NDVI band
var addNDVI = function(image) {
return image.addBands(image.normalizedDifference(['B8', 'B4']));
};

// Add NDVI band to image collection
var S2 = S2.map(addNDVI);
// Extract NDVI band and create NDVI median composite image
var NDVI = S2.select(['nd']);
var NDVImed = NDVI.median(); //I just changed the name of this variable ;)

// Create palettes for display of NDVI
var ndvi_pal = ['#d73027', '#f46d43', '#fdae61', '#fee08b', '#d9ef8b',
'#a6d96a'];

// Create a time series chart.
var plotNDVI = ui.Chart.image.seriesByRegion(S2, geometry,ee.Reducer.mean(),
'nd',500,'system:time_start', 'system:index')
              .setChartType('LineChart').setOptions({
                title: 'NDVI short-term time series',
                hAxis: {title: 'Date'},
                vAxis: {title: 'NDVI'}
});

// Display.
print(plotNDVI);

// Display NDVI results on map
Map.addLayer(NDVImed.clip(geometry), {min:-0.5, max:0.9, palette: ndvi_pal}, 'NDVI');



// To export to your Google Drive
   Export.image.toDrive({
   image:NDVI,
   description: 'NDVI2016', // task name to be shown in the Tasks tab
   fileNamePrefix: 's2Filt',
   scale: 10,// filename to be saved in the Google Drive   scale: 10, // the spatial resolution of the image
   region: geometry,
   maxPixels: 1e13
 });
