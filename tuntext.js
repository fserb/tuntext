// TunText - by Fernando Serboncini

var $ = jQuery;

var TT_FROMLANG;
var TT_TOLANG;
var TT_ORIGINAL_TEXT;

var TT_SPECIAL = new RegExp(/([ \f\n\r\t\v\u00A0\u2028\u2029,:;\-~\.\(\)\[\]\{\}\\\/?\!]+)/);

var TT_LANGS = {
	"af": [ "Afrikaans", "" ],
	"sq": [ "Albanian", "" ],
	"ar": [ "Arabic", "" ],
	"be": [ "Belarusian", "" ],
	"bg": [ "Bulgarian", "" ],
	"zh": [ "Chinese", "" ],
	"zh-CN": [ "Chinese (simp)", "" ],
	"zh-TW": [ "Chinese (trad)", "" ],
	"hr": [ "Croatian", "" ],
	"cs": [ "Czech", "" ],
	"da": [ "Danish", "" ],
	"nl": [ "Dutch", "" ],
	"en": [ "English", "http://dictionary.reference.com/browse/" ],
	"et": [ "Estonian", "" ],
	"tl": [ "Filipino", "" ],
	"fi": [ "Finnish", "" ],
	"fr": [ "French", "http://www.le-dictionnaire.com/definition.php?mot=" ],
	"gl": [ "Galician", "" ],
	"de": [ "German", "http://dict.cc?s=" ],
	"el": [ "Greek", "" ],
	"iw": [ "Hebrew", "" ],
	"hi": [ "Hindi", "" ],
	"hu": [ "Hungarian", "" ],
	"is": [ "Icelandic", "" ],
	"id": [ "Indonesian", "" ],
	"ga": [ "Irish", "" ],
	"it": [ "Italian", "" ],
	"ja": [ "Japanese", "" ],
	"ko": [ "Korean", "" ],
	"lv": [ "Latvian", "" ],
	"lt": [ "Lithuanian", "http://lietuviu-anglu.xb.lt/angliskai.php?w=" ],
	"mk": [ "Macedonian", "" ],
	"ms": [ "Malay", "" ],
	"ml": [ "Malayalam", "" ],
	"mt": [ "Maltese", "" ],
	"no": [ "Norwegian", "" ],
	"fa": [ "Persian", "" ],
	"pl": [ "Polish", "" ],
	"pt": [ "Portuguese", "http://aulete.uol.com.br/site.php?mdl=aulete_digital&op=loadVerbete&palavra=" ],
	"ro": [ "Romanian", "" ],
	"ru": [ "Russian", "" ],
	"sr": [ "Serbian", "" ],
	"sk": [ "Slovak", "" ],
	"sl": [ "Slovenian", "" ],
	"es": [ "Spanish", "http://www.wordreference.com/definicion/" ],
	"sw": [ "Swahili", "" ],
	"sv": [ "Swedish", "" ],
	"th": [ "Thai", "" ],
	"tr": [ "Turkish", "" ],
	"uk": [ "Ukrainian", "" ],
	"vi": [ "Vietnamese", "" ],
	"cy": [ "Welsh", "" ],
	"yi": [ "Yiddish", "" ],
}

makeLanguageSelect = function(obj) {
	obj.append($("<option></option"));
	for (l in TT_LANGS) {
		var o = $("<option></option>");
		o.attr("value", l);
		o.text(TT_LANGS[l][0]);
		obj.append(o);
	}
}

makePopup = function(text, x, y) {
	$("#tuntext_pop span").html(unescape(text));
	var pop = $("#tuntext_pop");
	pop.css("left", x - pop.innerWidth()/2 +"px");
	pop.css("top", y - pop.innerHeight() - 10 + "px");
	pop.show();
	var w = pop.innerWidth();
	$("#tuntext_pop .tuntext_popab, #tuntext_pop .tuntext_popa")
		.css("left", w/2 - 6);
}

wordClick = function(ev) {
	ev.stopPropagation();
	if (ev.button != 0) {
		return;
	}
	ev.preventDefault();
	var o = $(ev.target);
	var pos = o.position();
	var s = o.text();
	google.language.translate(s, TT_FROMLANG, TT_TOLANG, function(res) {
		makePopup(res.translation,
							pos.left + o.innerWidth()/2,
							pos.top + $("#tuntext").scrollTop());
	});
}

findChildIndex = function(x, y) {
	console.log("fci: " + x + ", " + y);
	var objs = $("#tuntext_content a");

	var low = 0, high = objs.length - 1;
	var i, o, comp;
	var pos;

	while (low <= high) {
		i = parseInt((low + high)/2, 10);
		o = objs.eq(i);

		pos = o.position();
		pos.width = o.width();
		pos.height = o.height();

		console.log("  obj: " + pos.left + ", " + pos.top + " - " + pos.width + " - " + pos.height);

		if (y < pos.top) {
			high = i - 1; continue;
		} else if ((y - pos.top) > pos.height) {
			low = i + 1; continue;
		} else {
			if (x < pos.left) {
				high = i - 1; continue;
			} else if ((x - pos.left) > pos.width) {
				low = i + 1; continue;
			} else {
				return i;
			}
		}
	}
	return -1;
}

var draggingFrom = -1;
var draggingTo = -1;

clearDragging = function(reset) {
	var from = draggingFrom;
	if (from < 0) {
		from = -from;
	}
	if (from == draggingTo) {
		$("#tuntext_content a").removeClass("selected");
	} else if (from < draggingTo) {
		$("#tuntext_content a").slice(from, draggingTo+1)
			.removeClass("selected");
	} else {
		$("#tuntext_content a").slice(draggingTo, from+1)
			.removeClass("selected");
	}
	if (reset) {
		draggingFrom = draggingTo = -1;
	}
}

wordUp = function(ev) {
	wordMove(ev);
	if (draggingFrom < 0) {
		return;
	}

	if (draggingFrom == draggingTo) {
		clearDragging(true);
		return;
	}

	var start = draggingFrom;
	var end = draggingTo;
	if (end < start) {
		start = draggingTo;
		end = draggingFrom;
	}
	clearDragging(true);
	
	var txt = "";
	$("#tuntext_content a").slice(start, end+1).each(function() {
		txt += $(this).text() + " ";
	});
	txt = $.trim(txt);
	if (txt.length == 0) {
		return;
	}

	var first = $("#tuntext_content a").eq(start);
	var last = $("#tuntext_content a").eq(end);
	var pos = first.position();
	var width = Math.max(first.innerWidth(),
											 last.position().left + last.innerWidth() - pos.left);
	google.language.translate(txt, TT_FROMLANG, TT_TOLANG, function(res) {
		makePopup(res.translation,
							pos.left + width/2,
							pos.top + $("#tuntext").scrollTop());
	});
};

wordMove = function(ev) {
	if (draggingFrom < 0) return;
	var idx = findChildIndex(ev.layerX || ev.pageX, ev.layerY || ev.pageY);
	var start = draggingFrom;
	var end = idx;
	if (end < start) {
		start = idx;
		end = draggingFrom;
	}
	if (idx != -1) {
		clearDragging(false);
		$("#tuntext_content a").slice(start, end+1).addClass("selected");
		draggingTo = idx;
	}
};

wordDown = function(ev) {
	ev.preventDefault();
 	draggingFrom = findChildIndex(ev.layerX || ev.pageX, ev.layerY || ev.pageY);
};

LoadText = function(text) {
	TT_ORIGINAL_TEXT = text;
	var l = TT_LANGS[TT_FROMLANG];
	var link;
	if (l) {
		link = l[1];
	} else {
		link = "";
	}
	text = $.trim(text);
	var target = $("#tuntext_content");
	var split = text.split(TT_SPECIAL);
	target.empty();
	for(var i = 0; i < split.length; ++i) {
		var s = split[i];
		if (s.length == 0) {
			continue;
		}
		if (s.match(TT_SPECIAL)) {
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
			if (link) {
				d.attr("href", link + s);
			} else {
				d.attr("href",
							 "http://www.google.com/images?hl=" + TT_FROMLANG + "&q=" + s);
			}
			d.click(wordClick);
			target.append(d);
		}
	}
	target.show();
}

LoadTextLanguage = function(text) {
	text = $.trim(text);
	if (TT_FROMLANG) {
		LoadText(text);
	} else {
		google.language.detect(text.substr(0, 512), function(res) {
			TT_FROMLANG = res.language;
			$("#tuntext_fromlang").val(res.language);
			LoadText(text);
		});
	}
};

HoldEvent = function(ev) {
	ev.stopPropagation();
	$("#tuntext_pop").hide();
}

ChangeFromLanguage = function(ev) {
	$("#tuntext_pop").hide();
	TT_FROMLANG = $("#tuntext_fromlang").val();
	LoadText(TT_ORIGINAL_TEXT);
}

ChangeToLanguage = function(ev) {
	$("#tuntext_pop").hide();
	TT_TOLANG = $("#tuntext_tolang").val();
}

Prepare = function() {
	var old_scroll_position = $(window).scrollTop();
	if ($("#tuntext").length != 0) {
		$(window).scrollTop(0);
		$("html").css("overflow", "hidden");
		$("#tuntext_pop").hide();
		$("#tuntext").show();
		return;
	}
	var old_html_overflow = $("html").css("overflow");
	
	// force all flash to go below.
	$("embed").attr("wmode", "transparent");
	$("object").append($("<param>")
										 .attr("name", "wmode")
										 .attr("value", "transparent"));


	// block scrolling on the main document
	$(window).scrollTop(0);
	$("html").css("overflow", "hidden");

	var main = $("<div id='tuntext'></div>");
	main.click(function() {
		$(this).hide();
		$(window).scrollTop(old_scroll_position);
		$("html").css("overflow", old_html_overflow);
	});
	$("body").append(main);

  var bar = $("<div id='tuntext_bar'><h1>" +
              "<a href='http://fserb.com.br/tuntext'>TunText</a> " +
              "by Fernando Serboncini</h1></div>");
	var bar_lang = $("<div id='tuntext_bar_lang'></div>");

	var from_lang = $("<select id='tuntext_fromlang'></select>");
	from_lang.click(HoldEvent);
	from_lang.change(ChangeFromLanguage);
	makeLanguageSelect(from_lang);
	var to_lang = $("<select id='tuntext_tolang'></select>");
	to_lang.click(HoldEvent);
	to_lang.change(ChangeToLanguage);
	makeLanguageSelect(to_lang);
	to_lang.val("en");
	TT_TOLANG = "en";
	bar_lang.append("from ");
	bar_lang.append(from_lang);
	bar_lang.append(" to ");
	bar_lang.append(to_lang);

	bar.append(bar_lang);	
	main.append(bar);

	var content = $("<div id='tuntext_content'></div>");
	content.hide();
	content.mousedown(wordDown);
	content.mouseup(wordUp);
	content.mousemove(wordMove);
	content.click(HoldEvent);
	main.append(content);

	var pop = $("<div id='tuntext_pop'><span></span>" +
							"<div class='tuntext_popab'></div>" +
							"<div class='tuntext_popa'></div></div>");
	pop.click(HoldEvent);
	main.append(pop);
	google.language.getBranding(bar.find('h1').get(0));
}

Tuntext = function(text) {
	Prepare();
	LoadTextLanguage(text);
};

RunSelection = function() {
	var text = window.getSelection().toString();
	if (text) {
		Tuntext(text);
	}
};

if (window['FullTunTextLoader']) {
	FullTunTextLoader();
} else {
	RunSelection();
}
