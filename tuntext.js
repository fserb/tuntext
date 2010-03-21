google.load("language", "1");
google.load("jquery", "1.4.2");

special = new RegExp(/([ \f\n\r\t\v\u00A0\u2028\u2029,:;\-\.\(\)\[\]\{\}\\\/?\!]+)/);

makePopup = function(text, x, y) {
	$("#pop span").text(text);
	var pop = $("#pop");
	pop.css("top", x - pop.innerHeight() - 10 + "px");
	pop.css("left", y - pop.innerWidth()/2 +"px");
	pop.show();
	var w = pop.innerWidth();
	$("#pop .popab, #pop .popa").css("left", w/2 - 6);
}

wordClick = function(ev) {
	if (ev.button != 0) {
		return;
	}
	ev.preventDefault();
	var o = $(ev.target);
	var pos = o.position();
	var s = o.text();
	google.language.translate(s, "de", "en", function(res) {
		makePopup(res.translation,
							pos.top,
							pos.left + o.innerWidth()/2);
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
	makePopup("hello this is a much bigger", 200, 300);
	makeBlocks($("#text"));
};

google.setOnLoadCallback(run);
