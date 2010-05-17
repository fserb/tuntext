/*
TODO:
- language select box on the top right corner (from and to)
- black covers whole page
- add more language links
- create proper main page with link to bookmarklet and text field
- add "tuntext" somewhere on the final page
*/

var special = new RegExp(/([ \f\n\r\t\v\u00A0\u2028\u2029,:;\-~\.\(\)\[\]\{\}\\\/?\!]+)/);

var langs = {
	"de" : [ "German", "http://dict.cc?s=" ],
	"pt" : [ "Portuguese", "" ],
}

var curlang = "";

makePopup = function(text, x, y) {
	$("#tuntext_pop span").text(text);
	var pop = $("#tuntext_pop");
	pop.css("top", x - pop.innerHeight() - 10 + "px");
	pop.css("left", y - pop.innerWidth()/2 +"px");
	pop.show();
	var w = pop.innerWidth();
	$("#tuntext_pop .tuntext_popab, #tuntext_pop .tuntext_popa")
		.css("left", w/2 - 6);
}

wordClick = function(ev) {
	console.log("click");
	ev.stopPropagation();
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

findChildIndex = function(x, y) {
	var found = -1;
	$("#tuntext_content a").each(function(index) {
		var pos = $(this).position();
		if ( x > pos.left && 
				 y > pos.top &&
				 (x - pos.left) < $(this).width() &&
				 (y - pos.top) < $(this).height()) {
			found = index;
		}
	});
	return found;
}

var draggingFrom = -1;

wordUp = function(ev) {
	if (draggingFrom == -1) {
		return;
	}
	var idx = findChildIndex(ev.pageX, ev.pageY);

	if (idx == draggingFrom) {
		draggingFrom = -1;
		$("#tuntext_content a").removeClass("selected");
		return;
	}
	var start = draggingFrom;
	var end = idx;
	if (idx < draggingFrom) {
		start = idx;
		end = draggingFrom;
	}
	draggingFrom = -1;
	console.log("up: " + start + " - " + (end+1));
	
	var txt = "";
	$("#tuntext_content a").slice(start, end+1).each(function() {
		txt += $(this).text() + " ";
	});
	txt = $.trim(txt);
	if (txt.length == 0) {
		$("#tuntext_content a").removeClass("selected");
		return;
	}
	var first = $("#tuntext_content a").eq(start);
	var last = $("#tuntext_content a").eq(end);
	var pos = first.position();
	var width = Math.max(first.innerWidth(),
											 last.position().left + last.innerWidth() - pos.left);
	google.language.translate(txt, curlang, "en", function(res) {
		$("#tuntext_content a").removeClass("selected");
		makePopup(res.translation,
							pos.top,
							pos.left + width/2);
	});
};

wordMove = function(ev) {
	if (draggingFrom == -1) return;
	var idx = findChildIndex(ev.pageX, ev.pageY);
	var start = draggingFrom;
	var end = idx;
	if (idx < draggingFrom) {
		start = idx;
		end = draggingFrom;
	}

	$("#tuntext_content a").removeClass("selected");
	if (idx != -1) {
		$("#tuntext_content a").slice(start, end+1).addClass("selected");
	}


};

wordDown = function(ev) {
	ev.preventDefault();
	var idx = findChildIndex(ev.pageX, ev.pageY);
	if (idx != -1) {
		draggingFrom = idx;
	}
};

LoadText = function(text) {
	text = $.trim(text);
	google.language.detect(text.substr(0, 128), function(res) {
		var target = $("#tuntext_content");
		var l = langs[res.language];
		if (!l) {
			l = [ res.language, "" ];
		}
		curlang = res.language;
		//$("#sourcelang").text(l[0]);
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
		target.show();
	});
};

Prepare = function() {
	if ($("#tuntext").length != 0) {
		$("#tuntext_pop").hide();
		$("#tuntext").show();
		return;
	}
	
	// force all flash to go below.
	$("embed").attr("wmode", "transparent");

	var main = $("<div id='tuntext'></div>");
	main.click(function() {
		$(this).hide();
	});
	$("body").append(main);

	var content = $("<div id='tuntext_content'></div>");
	content.hide();
	content.mousedown(wordDown);
	content.mouseup(wordUp);
	content.mousemove(wordMove);
	content.click(function(ev) {
		ev.stopPropagation();
		$("#tuntext_pop").hide();
	});
	main.append(content);

	var pop = $("<div id='tuntext_pop'><span></span>" +
							"<div class='tuntext_popab'></div>" +
							"<div class='tuntext_popa'></div></div>");
	pop.click(function(ev) {
		ev.stopPropagation();
		$("#tuntext_pop").hide();
	});
	main.append(pop);
}

Tuntext = function(text) {
	Prepare();
	LoadText(text);
};

RunSelection = function() {
	var text = window.getSelection().toString();
	if (text) {
		Tuntext(text);
	}
};

RunSelection();
