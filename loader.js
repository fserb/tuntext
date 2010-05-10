if (!window['apiLoaded']) {
  window.apiLoaded = function() {
    google.load("language", "1", { "callback" : function() {
			$(document).ready(function() {  
				var sc = document.createElement('script');
				sc.src = '../tuntext.js?t=' + Date();
				sc.type = "text/javascript";
				document.getElementsByTagName('body')[0].appendChild(sc);
			})}});
	};
}
	
if (!window['jQuery']) {
  var sc = document.createElement('script');
  sc.src = 'http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js';
  sc.type = "text/javascript";
	sc.onload = function() {
		if (!window['google']) {
			var s = document.createElement('script');
			s.src = 'http://www.google.com/jsapi?callback=apiLoaded';
			s.type = "text/javascript";
			document.getElementsByTagName('body')[0].appendChild(s);
		} else {
			apiLoaded();
		};
	};
  document.getElementsByTagName('body')[0].appendChild(sc);
}

