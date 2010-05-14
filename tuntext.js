/*
TODO:
- language select box on the top right corner
- black covers whole page
- strip page content
*/

var basepath = "http://localhost:8080/"

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
	if (draggingFrom == -1) return;
	var idx = findChildIndex(ev.pageX, ev.pageY);
	console.log("up: " + draggingFrom + " - " + (idx+1));
	
	var txt = "";
	$("#tuntext_content a").slice(draggingFrom, idx+1).each(function() {
		txt += $(this).text() + " ";
	});
	txt = $.trim(txt);
	var first = $("#tuntext_content a").eq(draggingFrom);
	var last = $("#tuntext_content a").eq(idx);
	var pos = first.position();
	var width = Math.max(first.innerWidth(),
											 last.position().left + last.innerWidth() - pos.left);
	google.language.translate(txt, curlang, "en", function(res) {
		$("#tuntext_content a").removeClass("selected");
		makePopup(res.translation,
							pos.top,
							pos.left + width/2);
	});
	draggingFrom = -1;
};

wordMove = function(ev) {
	if (draggingFrom == -1) return;
	var idx = findChildIndex(ev.pageX, ev.pageY);

	$("#tuntext_content a").removeClass("selected");
	if (idx != -1) {
		$("#tuntext_content a").slice(draggingFrom, idx+1).addClass("selected");
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

	var style = $("<link>");
	style.attr("rel", "stylesheet");
	style.attr("type", "text/css");
	style.attr("href", basepath + "tuntext.css");
	$("body").append(style);

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
	if (!text) {
		//alert("No text selected");
		//return;
		text = "Teheran (nhz) ~ Ein Kleriker aus der schönen Stadt Teheran, welche des öfteren unter Erdbeben zu leiden hat, behauptete doch, dass öffentlich zur Schau getragene Busen dafür verantwortlich seien.\nAufgeschreckt gaben wir unseren Seismologen sofort den Auftrag diesen, nicht von der Hand zu weisenden Zusammenhang, wissenschaftlich zu untersuchen. In Australien und Kanada wurden Trägerinnen eines Busens aufgefordert diesen zu zeigen. Die Nadeln der Seismologen schlugen aber keinen Millimeter aus. Auch die Redakteure der NHZ, welche ihre Gattinnen oder Lebensgefährtinnen baten bei der Wahrheitsfindung zu helfen, konnten keine Erbeben feststellen.\nMit ganz viel Vertrauen in unsere Untersuchungen können wir allen Frauen mitteilen\n\nBusen haben vielleicht auf die Erdbeerernte Einfluss,\naber garantiert nicht auf Erdbeben!";
	} 

	Tuntext(text);

};

RunSelection();
