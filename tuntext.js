google.load("language", "1");
google.load("jquery", "1.4.2");

special = new RegExp(/([ \f\n\r\t\v\u00A0\u2028\u2029,:;\-\.\(\)\[\]\{\}\\\/?\!]

wordClick = function(ev) {
	if (ev.button != 0) {
		return;
	}
	ev.preventDefault();
	var s = $(ev.target).text();
	google.language.translate(s, "de", "en", function(res) {
		$(work).html(res.translation);
	});
}

makeBlocks = function(target) {
	var text = target.text();
	var split = text.split(special);
	target.empty();
	for(var i = 0; i < split.length; ++i) {
		var s = split[i];
		if (s.length == 0) {
			continue;
		}
		if (s.match(special)) {
			var enter = s.split(/(\n)/);
			for (var j = 0; j < enter.length; ++j) {
				if (enter[j] == "\n") {
					target.append("<p>");
				} else {
					target.append(enter[j]);
				}
			}
		} else {
			var d = $("<a>" + s + "</a>");
			d.attr("href", "http://dict.cc?s=" + s);
			d.click(wordClick);
			target.append(d);
		}

	}
};


function run() {
	makeBlocks($("#text"));
};

google.setOnLoadCallback(run);