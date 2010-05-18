// we first load jquery, then google API then language API then our script.

(function() {
if (!window['TuntextAPILoaded']) {
  window.TuntextAPILoaded = function() {
    google.load('language', '1', { 'callback' : function() {
			$(document).ready(function() {  
				var sc = document.createElement('script');
				sc.src = './tuntext.js';
				sc.type = 'text/javascript';
				document.getElementsByTagName('head')[0].appendChild(sc);
				sc = document.createElement('link');
				sc.rel = 'stylesheet';
				sc.type = 'text/css';
				sc.href = './tuntext.css';
				document.getElementsByTagName('head')[0].appendChild(sc);
			})}});
	};
}
	
if (!window['loadGoogle']) {
	loadGoogle = function() {
		if (!window['google']) {
			var s = document.createElement('script');
			s.src = 'http://www.google.com/jsapi?callback=TuntextAPILoaded';
			s.type = 'text/javascript';
			document.getElementsByTagName('head')[0].appendChild(s);
		} else {
			TuntextAPILoaded();
		}
	};
}


if (!window['jQuery']) {
  var sc = document.createElement('script');
  sc.src = 'http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js';
  sc.type = 'text/javascript';
	sc.onload = loadGoogle;
  document.getElementsByTagName('head')[0].appendChild(sc);
} else {
	loadGoogle();
}

})();