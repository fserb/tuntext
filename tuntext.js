// TunText - by Fernando Serboncini

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
	//console.log("popup " + x + ", " + y);
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
	google.language.translate(txt, TT_FROMLANG, TT_TOLANG, function(res) {
		$("#tuntext_content a").removeClass("selected");
		makePopup(res.translation,
							pos.left + width/2,
							pos.top + $("#tuntext").scrollTop());
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
