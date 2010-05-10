/*
TODO:
- language select box on the top right corner
- reload original page on top right
*/

var special = new RegExp(/([ \f\n\r\t\v\u00A0\u2028\u2029,:;\-~\.\(\)\[\]\{\}\\\/?\!]+)/);

var langs = {
	"de" : [ "German", "http://dict.cc?s=" ],
	"pt" : [ "Portuguese", "" ],
}

var curlang = "";

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
	console.log("click");
	if (ev.button != 0) {
		return;
	}
	ev.preventDefault();
	var o = $(ev.target);
	var pos = o.position();
	var s = o.text();
	google.language.translate(s, curlang, "en", function(res) {
		makePopup(res.translation,
							pos.top,
							pos.left + o.innerWidth()/2);
	});
}

makeBlocks = function(target) {
	var text = target.text();
	google.language.detect(text.substr(0, 128), function(res) {
		var l = langs[res.language];
		if (!l) {
			l = [ res.language, "" ];
		}
		curlang = res.language;
		$("#sourcelang").text(l[0]);
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
				if (l[1]) {
					d.attr("href", l[1] + s);
				} else {
					d.attr("href", "");
				}
				d.click(wordClick);
				target.append(d);
			}
		}
	});
};

processText = function(node) {
	var skip = 0;
	var split = node.split(special);
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
					skip += 1;
				} else {
					target.append(enter[j]);
				}
			}
		} else {
			console.log(s);
			var d = $("<a>" + s + "</a>");
			if (true) {
				d.attr("href", "http://" + s);
			} else {
				d.attr("href", "");
			}
			d.click(wordClick);
			target.append(d);
			skip += 1;
		}
	}
	return 0;
};

prepareElements = function(node) {
	var skip = 0;
  if (node.nodeType == 3) {
		skip += processText(node);
  }
  else if (node.nodeType == 1 && 
					 node.childNodes && 
					 !/(script|style)/i.test(node.tagName)) {
		for (var i = 0; i < node.childNodes.length; ++i) {
			i += prepareElements(node.childNodes[i]);
		}
  }
  return skip;
};

clearPage = function() {
	$("a").removeAttr("href");
	$("*").each(function() {
		$(this).unbind("click");
	});
};


run = function() {
	clearPage();
	prepareElements($("body").get(0));
};

run();
