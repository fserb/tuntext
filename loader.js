/*
we first load jquery, then google API then language API then our script.
*/

if (!window['apiLoaded']) {
  window.apiLoaded = function() {
    google.load("language", "1", { "callback" : function() {
			$(document).ready(function() {  
				var sc = document.createElement('script');
				sc.src = 'http://localhost:8080/tuntext.js';
				sc.type = "text/javascript";
				document.getElementsByTagName('body')[0].appendChild(sc);
			})}});
	};
}
	
if (!window['loadGoogle']) {
	loadGoogle = function() {
		if (!window['google']) {
			var s = document.createElement('script');
			s.src = 'http://www.google.com/jsapi?callback=apiLoaded';
			s.type = "text/javascript";
			document.getElementsByTagName('body')[0].appendChild(s);
		} else {
			apiLoaded();
		}
	};
}


if (!window['jQuery']) {
  var sc = document.createElement('script');
  sc.src = 'http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js';
  sc.type = "text/javascript";
	sc.onload = loadGoogle;
  document.getElementsByTagName('body')[0].appendChild(sc);
} else {
	loadGoogle();
}

