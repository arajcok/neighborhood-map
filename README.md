# Neighborhood Map Application
This is a single page application featuring a map of a neighborhood. The application adds functionality to this map by including highlighted locations, third-party data about those locations, and various ways to browse the content. This includes map markers to identify specific locations, a search function to easily discover these locations, and a listview to support simple browsing of all locations.

## Run
In order for this application to run successfully, the user must first obtain a Google Maps API key, and insert it as the value of the `key` parameter in `index.html`. Then, open up `index.html` in a browser.

## Files
#### app.js
This file initializes the map and handles various information on the page through the use of the Knockout framework. This file also issues an AJAX call to Wikipedia (the application's 3rd party API source) to obtain Wikipedia article links that are related to the locations.

#### index.html
This file contains all the HTML for the page. It uses Knockout's declarative bindings to associate DOM elements with model data.

#### style.css
This file contians all the CSS for the page. It also includes several media queries to achieve a responsive design.