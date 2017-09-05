/*
**    Copyright 2009 Sogame
**
**    This file is part of Dummy Lipsum.
**
**    Dummy Lipsum is free software: you can redistribute it and/or modify
**    it under the terms of the GNU General Public License as published by
**    the Free Software Foundation, either version 3 of the License, or
**    (at your option) any later version.
**
**    Dummy Lipsum is distributed in the hope that it will be useful,
**    but WITHOUT ANY WARRANTY; without even the implied warranty of
**    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
**    GNU General Public License for more details.
**
**    You should have received a copy of the GNU General Public License
**    along with Dummy Lipsum. If not, see <http://www.gnu.org/licenses/>.
*/


var DummyLipsum = {
	initialized: false,
	
	ED_TYPE_TINYMCE:  1,
	ED_TYPE_XINHA:    2,
	ED_TYPE_NICEDIT:  3,
	ED_TYPE_EPOZ:     4,
	ED_TYPE_KUPU:     5,
	
	_orig_text: "",
	_def_prefs: Array(),
//	_dl_prefs: Array(),
	
	_baseURL: "http://www.lipsum.com/feed/xml",
	_url_num: "amount",
	_url_type: "what",
	_url_start: "start",
	_url_punctuation: "punctuation",
	
	types_values: new Array("paras", "words", "bytes", "lists"),
	start_value_yes: "yes",
	start_value_no: "no",
	punctuation_value_yes: "yes",
	punctuation_value_no: "no",
	
	fetching_delay: 400,
	fetching_iter: 0,
	inputs_global: new Array(1),

	
	init: function() {
		window.removeEventListener("load", DummyLipsum.init, true);
		
		// Default Values
		DummyLipsum._def_prefs["num_items"] = 3;
		DummyLipsum._def_prefs["items_type"] = 0;
		DummyLipsum._def_prefs["with_lorem"] = false;
		DummyLipsum._def_prefs["with_punctuation"] = true;
		DummyLipsum._def_prefs["show_tags"] = false;
		DummyLipsum._def_prefs["autocopy"] = false;
		DummyLipsum._def_prefs["replace_chars"] = "";
		DummyLipsum._def_prefs["replace_ratio"] = 0;
		// Text Editor default values
		DummyLipsum._def_prefs["num_items_te"] = 3;
		DummyLipsum._def_prefs["items_type_te"] = 0;
		DummyLipsum._def_prefs["with_lorem_te"] = false;
		DummyLipsum._def_prefs["with_punctuation_te"] = true;
		DummyLipsum._def_prefs["autocopy_te"] = false;
		DummyLipsum._def_prefs["replace_chars_te"] = "";
		DummyLipsum._def_prefs["replace_ratio_te"] = 0;
		// Text Field default values
		DummyLipsum._def_prefs["num_items_tf"] = 6;
		DummyLipsum._def_prefs["items_type_tf"] = 1;
		DummyLipsum._def_prefs["with_lorem_tf"] = false;
		DummyLipsum._def_prefs["with_punctuation_tf"] = true;
		DummyLipsum._def_prefs["show_tags_tf"] = false;
		DummyLipsum._def_prefs["autocopy_tf"] = false;
		DummyLipsum._def_prefs["auto_size_first_tf"] = true;
		DummyLipsum._def_prefs["replace_chars_tf"] = "";
		DummyLipsum._def_prefs["replace_ratio_tf"] = 0;
		// Text Area default values
		DummyLipsum._def_prefs["num_items_ta"] = 1;
		DummyLipsum._def_prefs["items_type_ta"] = 0;
		DummyLipsum._def_prefs["with_lorem_ta"] = false;
		DummyLipsum._def_prefs["with_punctuation_ta"] = true;
		DummyLipsum._def_prefs["show_tags_ta"] = false;
		DummyLipsum._def_prefs["autocopy_ta"] = false;
		DummyLipsum._def_prefs["auto_size_first_ta"] = true;
		DummyLipsum._def_prefs["replace_chars_ta"] = "";
		DummyLipsum._def_prefs["replace_ratio_ta"] = 0;
		
//		DummyLipsum._dl_prefs = DummyLipsum.loadPrefs();
		
		DummyLipsum.initialized = true;
		
		DummyLipsum._dlSetToggleMenuItemEvent();
	},
	
	
	onMenuItemCommand: function() {
		window.open("chrome://dummylipsum/content/newwin.xul", "Dummy Lipsum Generator", "chrome,centerscreen,resizable");
	},
	
	
	onToolbarButtonCommand: function() {
		window.open("chrome://dummylipsum/content/newwin.xul", "Dummy Lipsum Generator", "chrome,centerscreen,resizable");
	},
	
	
	addSpecialChars: function(body, pref_suffix) {
		var _dl_prefs = DummyLipsum.loadPrefs();
		var rep_chars = _dl_prefs["replace_chars" + pref_suffix].split(",");
		var rep_chars_len = rep_chars.length;
		var rep_ratio = _dl_prefs["replace_ratio" + pref_suffix];
		
		if ((rep_ratio > 0) && (_dl_prefs["replace_chars" + pref_suffix].length > 0)) {
			var len = body.length;
			var i;
			var inside_tag = false;
			for (i=0; i<len; i++) {
				inside_tag = DummyLipsum.isTag(body, i, inside_tag);
				if (!inside_tag && DummyLipsum.isRepChar(body[i], rep_ratio) && (Math.round(Math.random() * 100) <= rep_ratio)) {
					body = DummyLipsum.setCharAt(body, i, rep_chars[DummyLipsum.randomInRange(0, rep_chars_len - 1)]);
				}
			}
		}
		
		return body;
	},
	
	
	randomInRange: function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},
	
	
	setCharAt: function(str, index, ch) {
		return str.substr(0, index) + ch + str.substr(index + 1);
	},
	
	
	isTag: function(str, index, old_status) {
		if (str[index] == "<") {
			return true;
		}
		else if (old_status && (index > 0) && (str[index-1] != ">")) {
			return true;
		}
		return false;
	},
	
	
	isRepChar: function(c, ratio) {
		if ((c >= "a") && (c <= "z")) {
			return true;
		}
		else if ((ratio >= 100) && ((c >= "A") && (c <= "Z"))) {
			return true;
		}
		return false;
	},
	
	
	getFetchingLabel: function() {
		return document.getElementById("bundle_dummylipsum").getString("dl_fetching");
	},
	
	
	rebuidTags: function(str, what) {
		if (what == "lists") {
			str = str.replace(/\r/g, "");
			str = str.replace(/\n/g, "</li>\n</ul>\n</p>\n\n<p>\n<ul>\n<li>");
			str = str.replace(/\. /g, ".</li>\n<li>");
			str = str.replace(/! /g, "!</li>\n<li>");
			str = str.replace(/\? /g, "?</li>\n<li>");
			str = '<p>\n<ul>\n<li>' + str + '</li>\n</ul>\n</p>';
			str = str.replace(/<li><\/li>\n/g, "");
		}
		else {
			str = str.replace(/\r/g, "");
			str = str.replace(/\n/g, "\n</p>\n\n<p>\n");
			str = "<p>\n" + str + "\n</p>";
		}
		return str;
	},
	
	
	getWhatFromURL: function(url) {
		var p1 = url.indexOf("what=", 0);
		var p2 = url.indexOf("&", p1 + 1);
		return url.substring(p1 + 5, p2);
	},
	
	
	loadPrefs: function() {
		var arr = Array();
		try {
			var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
			// Default Values
			if (prefs.prefHasUserValue("dummylipsum.num_items")) {
				arr["num_items"] = prefs.getIntPref("dummylipsum.num_items");
			}
			else {
				prefs.setIntPref("dummylipsum.num_items", DummyLipsum._def_prefs["num_items"]);
				arr["num_items"] = DummyLipsum._def_prefs["num_items"];
			}

			if (prefs.prefHasUserValue("dummylipsum.items_type")) {
				arr["items_type"] = prefs.getIntPref("dummylipsum.items_type");
			}
			else {
				prefs.setIntPref("dummylipsum.items_type", DummyLipsum._def_prefs["items_type"]);
				arr["items_type"] = DummyLipsum._def_prefs["items_type"];
			}

			if (prefs.prefHasUserValue("dummylipsum.with_lorem")) {
				arr["with_lorem"] = prefs.getBoolPref("dummylipsum.with_lorem");
			}
			else {
				prefs.setBoolPref("dummylipsum.with_lorem", DummyLipsum._def_prefs["with_lorem"]);
				arr["with_lorem"] = DummyLipsum._def_prefs["with_lorem"];
			}

			if (prefs.prefHasUserValue("dummylipsum.with_punctuation")) {
				arr["with_punctuation"] = prefs.getBoolPref("dummylipsum.with_punctuation");
			}
			else {
				prefs.setBoolPref("dummylipsum.with_punctuation", DummyLipsum._def_prefs["with_punctuation"]);
				arr["with_punctuation"] = DummyLipsum._def_prefs["with_punctuation"];
			}

			if (prefs.prefHasUserValue("dummylipsum.show_tags")) {
				arr["show_tags"] = prefs.getBoolPref("dummylipsum.show_tags");
			}
			else {
				prefs.setBoolPref("dummylipsum.show_tags", DummyLipsum._def_prefs["show_tags"]);
				arr["show_tags"] = DummyLipsum._def_prefs["show_tags"];
			}

			if (prefs.prefHasUserValue("dummylipsum.autocopy")) {
				arr["autocopy"] = prefs.getBoolPref("dummylipsum.autocopy");
			}
			else {
				prefs.setBoolPref("dummylipsum.autocopy", DummyLipsum._def_prefs["autocopy"]);
				arr["autocopy"] = DummyLipsum._def_prefs["autocopy"];
			}

			if (nsPreferences.mPrefService.prefHasUserValue("dummylipsum.replace_chars")) {
				arr["replace_chars"] = nsPreferences.getLocalizedUnicharPref("dummylipsum.replace_chars");
			}
			else {
				nsPreferences.setUnicharPref("dummylipsum.replace_chars", DummyLipsum._def_prefs["replace_chars"]);
				arr["replace_chars"] = DummyLipsum._def_prefs["replace_chars"];
			}

			if (prefs.prefHasUserValue("dummylipsum.replace_ratio")) {
				arr["replace_ratio"] = prefs.getIntPref("dummylipsum.replace_ratio");
			}
			else {
				prefs.setIntPref("dummylipsum.replace_ratio", DummyLipsum._def_prefs["replace_ratio"]);
				arr["replace_ratio"] = DummyLipsum._def_prefs["replace_ratio"];
			}

			// Text Editor default values
			if (prefs.prefHasUserValue("dummylipsum.num_items_te")) {
				arr["num_items_te"] = prefs.getIntPref("dummylipsum.num_items_te");
			}
			else {
				prefs.setIntPref("dummylipsum.num_items_te", DummyLipsum._def_prefs["num_items_te"]);
				arr["num_items_te"] = DummyLipsum._def_prefs["num_items_te"];
			}

			if (prefs.prefHasUserValue("dummylipsum.items_type_te")) {
				arr["items_type_te"] = prefs.getIntPref("dummylipsum.items_type_te");
			}
			else {
				prefs.setIntPref("dummylipsum.items_type_te", DummyLipsum._def_prefs["items_type_te"]);
				arr["items_type_te"] = DummyLipsum._def_prefs["items_type_te"];
			}

			if (prefs.prefHasUserValue("dummylipsum.with_lorem_te")) {
				arr["with_lorem_te"] = prefs.getBoolPref("dummylipsum.with_lorem_te");
			}
			else {
				prefs.setBoolPref("dummylipsum.with_lorem_te", DummyLipsum._def_prefs["with_lorem_te"]);
				arr["with_lorem_te"] = DummyLipsum._def_prefs["with_lorem_te"];
			}

			if (prefs.prefHasUserValue("dummylipsum.with_punctuation_te")) {
				arr["with_punctuation_te"] = prefs.getBoolPref("dummylipsum.with_punctuation_te");
			}
			else {
				prefs.setBoolPref("dummylipsum.with_punctuation_te", DummyLipsum._def_prefs["with_punctuation_te"]);
				arr["with_punctuation_te"] = DummyLipsum._def_prefs["with_punctuation_te"];
			}

			if (prefs.prefHasUserValue("dummylipsum.autocopy_te")) {
				arr["autocopy_te"] = prefs.getBoolPref("dummylipsum.autocopy_te");
			}
			else {
				prefs.setBoolPref("dummylipsum.autocopy_te", DummyLipsum._def_prefs["autocopy_te"]);
				arr["autocopy_te"] = DummyLipsum._def_prefs["autocopy_te"];
			}

			if (nsPreferences.mPrefService.prefHasUserValue("dummylipsum.replace_chars_te")) {
				arr["replace_chars_te"] = nsPreferences.getLocalizedUnicharPref("dummylipsum.replace_chars_te");
			}
			else {
				nsPreferences.setUnicharPref("dummylipsum.replace_chars_te", DummyLipsum._def_prefs["replace_chars_te"]);
				arr["replace_chars_te"] = DummyLipsum._def_prefs["replace_chars_te"];
			}

			if (prefs.prefHasUserValue("dummylipsum.replace_ratio_te")) {
				arr["replace_ratio_te"] = prefs.getIntPref("dummylipsum.replace_ratio_te");
			}
			else {
				prefs.setIntPref("dummylipsum.replace_ratio_te", DummyLipsum._def_prefs["replace_ratio_te"]);
				arr["replace_ratio_te"] = DummyLipsum._def_prefs["replace_ratio_te"];
			}

			// Text Field default values
			if (prefs.prefHasUserValue("dummylipsum.num_items_tf")) {
				arr["num_items_tf"] = prefs.getIntPref("dummylipsum.num_items_tf");
			}
			else {
				prefs.setIntPref("dummylipsum.num_items_tf", DummyLipsum._def_prefs["num_items_tf"]);
				arr["num_items_tf"] = DummyLipsum._def_prefs["num_items_tf"];
			}

			if (prefs.prefHasUserValue("dummylipsum.items_type_tf")) {
				arr["items_type_tf"] = prefs.getIntPref("dummylipsum.items_type_tf");
			}
			else {
				prefs.setIntPref("dummylipsum.items_type_tf", DummyLipsum._def_prefs["items_type_tf"]);
				arr["items_type_tf"] = DummyLipsum._def_prefs["items_type_tf"];
			}

			if (prefs.prefHasUserValue("dummylipsum.with_lorem_tf")) {
				arr["with_lorem_tf"] = prefs.getBoolPref("dummylipsum.with_lorem_tf");
			}
			else {
				prefs.setBoolPref("dummylipsum.with_lorem_tf", DummyLipsum._def_prefs["with_lorem_tf"]);
				arr["with_lorem_tf"] = DummyLipsum._def_prefs["with_lorem_tf"];
			}

			if (prefs.prefHasUserValue("dummylipsum.with_punctuation_tf")) {
				arr["with_punctuation_tf"] = prefs.getBoolPref("dummylipsum.with_punctuation_tf");
			}
			else {
				prefs.setBoolPref("dummylipsum.with_punctuation_tf", DummyLipsum._def_prefs["with_punctuation_tf"]);
				arr["with_punctuation_tf"] = DummyLipsum._def_prefs["with_punctuation_tf"];
			}

			if (prefs.prefHasUserValue("dummylipsum.show_tags_tf")) {
				arr["show_tags_tf"] = prefs.getBoolPref("dummylipsum.show_tags_tf");
			}
			else {
				prefs.setBoolPref("dummylipsum.show_tags_tf", DummyLipsum._def_prefs["show_tags_tf"]);
				arr["show_tags_tf"] = DummyLipsum._def_prefs["show_tags_tf"];
			}

			if (prefs.prefHasUserValue("dummylipsum.autocopy_tf")) {
				arr["autocopy_tf"] = prefs.getBoolPref("dummylipsum.autocopy_tf");
			}
			else {
				prefs.setBoolPref("dummylipsum.autocopy_tf", DummyLipsum._def_prefs["autocopy_tf"]);
				arr["autocopy_tf"] = DummyLipsum._def_prefs["autocopy_tf"];
			}

			if (prefs.prefHasUserValue("dummylipsum.auto_size_first_tf")) {
				arr["auto_size_first_tf"] = prefs.getBoolPref("dummylipsum.auto_size_first_tf");
			}
			else {
				prefs.setBoolPref("dummylipsum.auto_size_first_tf", DummyLipsum._def_prefs["auto_size_first_tf"]);
				arr["auto_size_first_tf"] = DummyLipsum._def_prefs["auto_size_first_tf"];
			}

			if (nsPreferences.mPrefService.prefHasUserValue("dummylipsum.replace_chars_tf")) {
				arr["replace_chars_tf"] = nsPreferences.getLocalizedUnicharPref("dummylipsum.replace_chars_tf");
			}
			else {
				nsPreferences.setUnicharPref("dummylipsum.replace_chars_tf", DummyLipsum._def_prefs["replace_chars_tf"]);
				arr["replace_chars_tf"] = DummyLipsum._def_prefs["replace_chars_tf"];
			}

			if (prefs.prefHasUserValue("dummylipsum.replace_ratio_tf")) {
				arr["replace_ratio_tf"] = prefs.getIntPref("dummylipsum.replace_ratio_tf");
			}
			else {
				prefs.setIntPref("dummylipsum.replace_ratio_tf", DummyLipsum._def_prefs["replace_ratio_tf"]);
				arr["replace_ratio_tf"] = DummyLipsum._def_prefs["replace_ratio_tf"];
			}

			// Text Area default values
			if (prefs.prefHasUserValue("dummylipsum.num_items_ta")) {
				arr["num_items_ta"] = prefs.getIntPref("dummylipsum.num_items_ta");
			}
			else {
				prefs.setIntPref("dummylipsum.num_items_ta", DummyLipsum._def_prefs["num_items_ta"]);
				arr["num_items_ta"] = DummyLipsum._def_prefs["num_items_ta"];
			}

			if (prefs.prefHasUserValue("dummylipsum.items_type_ta")) {
				arr["items_type_ta"] = prefs.getIntPref("dummylipsum.items_type_ta");
			}
			else {
				prefs.setIntPref("dummylipsum.items_type_ta", DummyLipsum._def_prefs["items_type_ta"]);
				arr["items_type_ta"] = DummyLipsum._def_prefs["items_type_ta"];
			}

			if (prefs.prefHasUserValue("dummylipsum.with_lorem_ta")) {
				arr["with_lorem_ta"] = prefs.getBoolPref("dummylipsum.with_lorem_ta");
			}
			else {
				prefs.setBoolPref("dummylipsum.with_lorem_ta", DummyLipsum._def_prefs["with_lorem_ta"]);
				arr["with_lorem_ta"] = DummyLipsum._def_prefs["with_lorem_ta"];
			}

			if (prefs.prefHasUserValue("dummylipsum.with_punctuation_ta")) {
				arr["with_punctuation_ta"] = prefs.getBoolPref("dummylipsum.with_punctuation_ta");
			}
			else {
				prefs.setBoolPref("dummylipsum.with_punctuation_ta", DummyLipsum._def_prefs["with_punctuation_ta"]);
				arr["with_punctuation_ta"] = DummyLipsum._def_prefs["with_punctuation_ta"];
			}

			if (prefs.prefHasUserValue("dummylipsum.show_tags_ta")) {
				arr["show_tags_ta"] = prefs.getBoolPref("dummylipsum.show_tags_ta");
			}
			else {
				prefs.setBoolPref("dummylipsum.show_tags_ta", DummyLipsum._def_prefs["show_tags_ta"]);
				arr["show_tags_ta"] = DummyLipsum._def_prefs["show_tags_ta"];
			}

			if (prefs.prefHasUserValue("dummylipsum.autocopy_ta")) {
				arr["autocopy_ta"] = prefs.getBoolPref("dummylipsum.autocopy_ta");
			}
			else {
				prefs.setBoolPref("dummylipsum.autocopy_ta", DummyLipsum._def_prefs["autocopy_ta"]);
				arr["autocopy_ta"] = DummyLipsum._def_prefs["autocopy_ta"];
			}

			if (prefs.prefHasUserValue("dummylipsum.auto_size_first_ta")) {
				arr["auto_size_first_ta"] = prefs.getBoolPref("dummylipsum.auto_size_first_ta");
			}
			else {
				prefs.setBoolPref("dummylipsum.auto_size_first_ta", DummyLipsum._def_prefs["auto_size_first_ta"]);
				arr["auto_size_first_ta"] = DummyLipsum._def_prefs["auto_size_first_ta"];
			}

			if (nsPreferences.mPrefService.prefHasUserValue("dummylipsum.replace_chars_ta")) {
				arr["replace_chars_ta"] = nsPreferences.getLocalizedUnicharPref("dummylipsum.replace_chars_ta");
			}
			else {
				nsPreferences.setUnicharPref("dummylipsum.replace_chars_ta", DummyLipsum._def_prefs["replace_chars_ta"]);
				arr["replace_chars_ta"] = DummyLipsum._def_prefs["replace_chars_ta"];
			}

			if (prefs.prefHasUserValue("dummylipsum.replace_ratio_ta")) {
				arr["replace_ratio_ta"] = prefs.getIntPref("dummylipsum.replace_ratio_ta");
			}
			else {
				prefs.setIntPref("dummylipsum.replace_ratio_ta", DummyLipsum._def_prefs["replace_ratio_ta"]);
				arr["replace_ratio_ta"] = DummyLipsum._def_prefs["replace_ratio_ta"];
			}
			
			return arr;
		}
		catch(e) {
			alert("Preferences error\n" + e.name + ": " + e.message);
			return arr;
		}
	},
	
	
	showPrefsValues: function(doc) {
		if (!DummyLipsum.initialized) {
			DummyLipsum.init();
		}
		
		var _dl_prefs = DummyLipsum.loadPrefs();
		var elem;
		// Default Values
		elem = doc.getElementById("num_items");
		elem.value = _dl_prefs["num_items"];

		var item = doc.getElementById("items_type_" + _dl_prefs["items_type"]);
		elem = doc.getElementById("items_type");
		elem.selectedItem = item;

		elem = doc.getElementById("with_lorem");
		if (_dl_prefs["with_lorem"])
			elem.checked = true;
		else
			elem.checked = false;

		elem = doc.getElementById("with_punctuation");
		if (_dl_prefs["with_punctuation"])
			elem.checked = true;
		else
			elem.checked = false;

		elem = doc.getElementById("show_tags");
		if (_dl_prefs["show_tags"])
			elem.checked = true;
		else
			elem.checked = false;

		elem = doc.getElementById("autocopy");
		if (elem != null) {
			// Only exists on preferences window
			if (_dl_prefs["autocopy"])
				elem.checked = true;
			else
				elem.checked = false;
		}
		
		elem = doc.getElementById("rep_chars");
		if (elem != null) {
			// Only exists on preferences window
			elem.value = _dl_prefs["replace_chars"];
		}

		elem = doc.getElementById("rep_ratio");
		if (elem != null) {
			// Only exists on preferences window
			elem.value = _dl_prefs["replace_ratio"];
		}
		
		// Text Editor default values
		elem = doc.getElementById("num_items_te");
		if (elem != null) {
			// Only exists on preferences window
			elem.value = _dl_prefs["num_items_te"];

			var item = doc.getElementById("items_type_" + _dl_prefs["items_type_te"] + "_te");
			elem = doc.getElementById("items_type_te");
			elem.selectedItem = item;

			elem = doc.getElementById("with_lorem_te");
			if (_dl_prefs["with_lorem_te"])
				elem.checked = true;
			else
				elem.checked = false;

			elem = doc.getElementById("with_punctuation_te");
			if (_dl_prefs["with_punctuation_te"])
				elem.checked = true;
			else
				elem.checked = false;

			elem = doc.getElementById("autocopy_te");
			if (_dl_prefs["autocopy_te"])
				elem.checked = true;
			else
				elem.checked = false;
		}
		
		elem = doc.getElementById("rep_chars_te");
		if (elem != null) {
			// Only exists on preferences window
			elem.value = _dl_prefs["replace_chars_te"];
		}

		elem = doc.getElementById("rep_ratio_te");
		if (elem != null) {
			// Only exists on preferences window
			elem.value = _dl_prefs["replace_ratio_te"];
		}
		
		// Text Field default values
		elem = doc.getElementById("num_items_tf");
		if (elem != null) {
			// Only exists on preferences window
			elem.value = _dl_prefs["num_items_tf"];

			var item = doc.getElementById("items_type_" + _dl_prefs["items_type_tf"] + "_tf");
			elem = doc.getElementById("items_type_tf");
			elem.selectedItem = item;

			elem = doc.getElementById("with_lorem_tf");
			if (_dl_prefs["with_lorem_tf"])
				elem.checked = true;
			else
				elem.checked = false;

			elem = doc.getElementById("with_punctuation_tf");
			if (_dl_prefs["with_punctuation_tf"])
				elem.checked = true;
			else
				elem.checked = false;

			elem = doc.getElementById("show_tags_tf");
			if (_dl_prefs["show_tags_tf"])
				elem.checked = true;
			else
				elem.checked = false;

			elem = doc.getElementById("autocopy_tf");
			if (_dl_prefs["autocopy_tf"])
				elem.checked = true;
			else
				elem.checked = false;

			elem = doc.getElementById("auto_size_first_tf");
			if (_dl_prefs["auto_size_first_tf"])
				elem.checked = true;
			else
				elem.checked = false;
		}
		
		elem = doc.getElementById("rep_chars_tf");
		if (elem != null) {
			// Only exists on preferences window
			elem.value = _dl_prefs["replace_chars_tf"];
		}

		elem = doc.getElementById("rep_ratio_tf");
		if (elem != null) {
			// Only exists on preferences window
			elem.value = _dl_prefs["replace_ratio_tf"];
		}
		
		// Text Area default values
		elem = doc.getElementById("num_items_ta");
		if (elem != null) {
			// Only exists on preferences window
			elem.value = _dl_prefs["num_items_ta"];

			var item = doc.getElementById("items_type_" + _dl_prefs["items_type_ta"] + "_ta");
			elem = doc.getElementById("items_type_ta");
			elem.selectedItem = item;

			elem = doc.getElementById("with_lorem_ta");
			if (_dl_prefs["with_lorem_ta"])
				elem.checked = true;
			else
				elem.checked = false;

			elem = doc.getElementById("with_punctuation_ta");
			if (_dl_prefs["with_punctuation_ta"])
				elem.checked = true;
			else
				elem.checked = false;

			elem = doc.getElementById("show_tags_ta");
			if (_dl_prefs["show_tags_ta"])
				elem.checked = true;
			else
				elem.checked = false;

			elem = doc.getElementById("autocopy_ta");
			if (_dl_prefs["autocopy_ta"])
				elem.checked = true;
			else
				elem.checked = false;

			elem = doc.getElementById("auto_size_first_ta");
			if (_dl_prefs["auto_size_first_ta"])
				elem.checked = true;
			else
				elem.checked = false;
		}
		
		elem = doc.getElementById("rep_chars_ta");
		if (elem != null) {
			// Only exists on preferences window
			elem.value = _dl_prefs["replace_chars_ta"];
		}

		elem = doc.getElementById("rep_ratio_ta");
		if (elem != null) {
			// Only exists on preferences window
			elem.value = _dl_prefs["replace_ratio_ta"];
		}
	},
	
	
	dlSetFocus: function(elem_id) {
		var elem = document.getElementById(elem_id);
		elem.focus();
	},
	
	
	replaceAll: function(streng, soeg, erstat) {
		var st = streng;
		if (soeg.length == 0)
			return st;
		var idx = st.indexOf(soeg);
		while (idx >= 0) {
			st = st.substring(0, idx) + erstat + st.substr(idx + soeg.length);
			idx = st.indexOf(soeg);
		}
		return st;
	},
	
	
	updateTags: function() {
		var body = '';
		var elem = document.getElementById('show_tags');
		if (elem.checked) {
			body = DummyLipsum.removeTags(DummyLipsum._orig_text);
		}
		else {
			body = DummyLipsum.removeAttributes(DummyLipsum._orig_text);
		}
		DummyLipsum.setText(body);
	},
	
	
	generateDummy: function() {
		try {
			var _dl_prefs = DummyLipsum.loadPrefs();
			var _request = null;
			var elem;
			var num;
			var type;
			var start;
			var punctuation;

			elem = document.getElementById("num_items");
			num = parseInt(elem.value)
			if (num == 'NaN')
				num = _dl_prefs["num_items"];
			num = DummyLipsum._url_num + "=" + num;

			elem = document.getElementById("items_type");
			type = DummyLipsum._url_type + "=" + DummyLipsum.types_values[elem.selectedItem.value];

			elem = document.getElementById("with_lorem");
			start = DummyLipsum._url_start + "=" + ((elem.checked) ? DummyLipsum.start_value_yes : DummyLipsum.start_value_no);

			elem = document.getElementById("with_punctuation");
			punctuation = DummyLipsum._url_punctuation + "=" + ((elem.checked) ? DummyLipsum.punctuation_value_yes : DummyLipsum.punctuation_value_no);

			var url = DummyLipsum._baseURL + "?" + num + "&" + type + "&" + start + "&" + punctuation;

			DummyLipsum.windowStartLoading();
			
			_request = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);
			_request.open("GET", url, true);
			_request.overrideMimeType("text/xml");
			_request.onload = function() { DummyLipsum._onGenerateLoad(this.responseXML, this.status) };
			_request.onerror = function() { DummyLipsum._onGenerateError(this.statusText) };
			_request.send(null);
		}
		catch (e) {
			DummyLipsum.windowStopLoading();
			DummyLipsum.setText("Error\n" + e.name + ": " + e.message);
		}
	},


	_onGenerateLoad: function(aResponse, aStatus) {
		try {
			var _dl_prefs = DummyLipsum.loadPrefs();
			
			var button;
			var body = "";
			
			DummyLipsum.windowStopLoading();
			if (!aResponse || aStatus > 200) {
				var error = "Error";
				if (aResponse)
					error += "\nResponse: " + aResponse;
				error += "\nStatus: " + aStatus;
				DummyLipsum.setText(error);
				return;
			}

			//body = aResponse.getElementById("lipsum").innerHTML;
			var nodes = aResponse.getElementsByTagName("lipsum");
			if (nodes.length <= 0) {
				DummyLipsum.setText("Error");
				return;
			}
			else {
				body = nodes[0].firstChild.nodeValue;
			}
			if (body.length == 0) {
				DummyLipsum.setText("Error");
				return;
			}
			
			body = DummyLipsum.rebuidTags(body, DummyLipsum.getWhatFromURL(aResponse.baseURI));
			
			body = DummyLipsum.addSpecialChars(body, "");
			DummyLipsum._orig_text = body;

			var elem = document.getElementById("show_tags");
			if (!elem.checked) {
				body = DummyLipsum.removeTags(body);
			}
			else {
				body = DummyLipsum.removeAttributes(body);
			}
			DummyLipsum.setText(body);
			button = document.getElementById("copy_button");
			button.disabled = false;

			if (_dl_prefs["autocopy"]) {
				DummyLipsum.copyDummy();
			}
		}
		catch(e) {
			DummyLipsum.windowStopLoading();
			DummyLipsum.setText("Error\n" + e.name + ": " + e.message);
		}
	},


	_onGenerateError: function(error) {
		DummyLipsum.windowStopLoading();
		DummyLipsum.setText("Error\n" + error);
	},


	setText: function(text) {
		var area = document.getElementById("dummy_text");
		area.value = text;
	},


	windowStartLoading: function() {
		var bar = document.getElementById("load_progress");
		bar.style.visibility = "visible";
	},


	windowStopLoading: function() {
		var bar = document.getElementById("load_progress");
		bar.style.visibility = "hidden";
	},


	copyDummy: function() {
		try{
			//var clipboard = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
			var clipboard = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
			var area = document.getElementById("dummy_text");
			clipboard.copyString(area.value);
		}
		catch(e) {
			alert("Error\n" + e.name + ": " + e.message);
		}
	},


	copyDummyContext: function(txt) {
		try{
			//var clipboard = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
			var clipboard = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
			clipboard.copyString(txt);
		}
		catch(e) {
			alert("Error\n" + e.name + ": " + e.message);
		}
	},


	removeTags: function(text) {
		text = DummyLipsum.replaceAll(text, "\n", "");
		text = DummyLipsum.replaceAll(text, '<p>', "\n");
		text = DummyLipsum.replaceAll(text, '<p xmlns="http://www.w3.org/1999/xhtml">', "\n");
		text = DummyLipsum.replaceAll(text, "</p>", "\n");
		text = DummyLipsum.replaceAll(text, "<ul>", "");
		text = DummyLipsum.replaceAll(text, "</ul>", "");
		text = DummyLipsum.replaceAll(text, "<li>", "");
		text = DummyLipsum.replaceAll(text, "</li>", "\n");
		text = DummyLipsum.replaceAll(text, "\n\n\n", "\n\n");
		if (text.charAt(0) == "\n")
			text = text.replace("\n", "");
		return text;
	},


	removeAttributes: function(text) {
		text = DummyLipsum.replaceAll(text, '<p xmlns="http://www.w3.org/1999/xhtml">', "<p>");
		if (text.charAt(0) == "\n")
			text = text.replace("\n", "");
		return text;
	},
	
	
	saveOptions: function() {
		try {
			var _dl_prefs = DummyLipsum.loadPrefs();
			var elem;
			var num;
			var val;
			var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);

			// Default Values
			elem = document.getElementById('num_items');
			num = parseInt(elem.value);
			if (num == 'NaN') {
				num = _dl_prefs["num_items"];
			}
			prefs.setIntPref("dummylipsum.num_items", num);

			elem = document.getElementById("items_type");
			prefs.setIntPref("dummylipsum.items_type", elem.selectedItem.value);

			elem = document.getElementById("with_lorem");
			val = (elem.checked) ? true : false;
			prefs.setBoolPref("dummylipsum.with_lorem", val);

			elem = document.getElementById("with_punctuation");
			val = (elem.checked) ? true : false;
			prefs.setBoolPref("dummylipsum.with_punctuation", val);

			elem = document.getElementById("show_tags");
			val = (elem.checked) ? true : false;
			prefs.setBoolPref("dummylipsum.show_tags", val);

			elem = document.getElementById("autocopy");
			val = (elem.checked) ? true : false;
			prefs.setBoolPref("dummylipsum.autocopy", val);
		
			elem = document.getElementById("rep_chars");
			nsPreferences.setUnicharPref("dummylipsum.replace_chars", elem.value);

			elem = document.getElementById('rep_ratio');
			num = parseInt(elem.value);
			if (num == 'NaN') {
				num = _dl_prefs["replace_ratio"];
			}
			else {
				if (num < 0) {
					num = 0;
				}
				else if (num > 100) {
					num = 100;
				}
			}
			prefs.setIntPref("dummylipsum.replace_ratio", num);
		
			// Text Editor default values
			elem = document.getElementById('num_items_te');
			num = parseInt(elem.value);
			if (num == 'NaN') {
				num = _dl_prefs["num_items_te"];
			}
			prefs.setIntPref("dummylipsum.num_items_te", num);

			elem = document.getElementById("items_type_te");
			prefs.setIntPref("dummylipsum.items_type_te", elem.selectedItem.value);

			elem = document.getElementById("with_lorem_te");
			val = (elem.checked) ? true : false;
			prefs.setBoolPref("dummylipsum.with_lorem_te", val);

			elem = document.getElementById("with_punctuation_te");
			val = (elem.checked) ? true : false;
			prefs.setBoolPref("dummylipsum.with_punctuation_te", val);

			elem = document.getElementById("autocopy_te");
			val = (elem.checked) ? true : false;
			prefs.setBoolPref("dummylipsum.autocopy_te", val);
		
			elem = document.getElementById("rep_chars_te");
			nsPreferences.setUnicharPref("dummylipsum.replace_chars_te", elem.value);

			elem = document.getElementById('rep_ratio_te');
			num = parseInt(elem.value);
			if (num == 'NaN') {
				num = _dl_prefs["replace_ratio_te"];
			}
			else {
				if (num < 0) {
					num = 0;
				}
				else if (num > 100) {
					num = 100;
				}
			}
			prefs.setIntPref("dummylipsum.replace_ratio_te", num);

			// Text Field default values
			elem = document.getElementById('num_items_tf');
			num = parseInt(elem.value);
			if (num == 'NaN') {
				num = _dl_prefs["num_items_tf"];
			}
			prefs.setIntPref("dummylipsum.num_items_tf", num);

			elem = document.getElementById("items_type_tf");
			prefs.setIntPref("dummylipsum.items_type_tf", elem.selectedItem.value);

			elem = document.getElementById("with_lorem_tf");
			val = (elem.checked) ? true : false;
			prefs.setBoolPref("dummylipsum.with_lorem_tf", val);

			elem = document.getElementById("with_punctuation_tf");
			val = (elem.checked) ? true : false;
			prefs.setBoolPref("dummylipsum.with_punctuation_tf", val);

			elem = document.getElementById("show_tags_tf");
			val = (elem.checked) ? true : false;
			prefs.setBoolPref("dummylipsum.show_tags_tf", val);

			elem = document.getElementById("autocopy_tf");
			val = (elem.checked) ? true : false;
			prefs.setBoolPref("dummylipsum.autocopy_tf", val);

			elem = document.getElementById("auto_size_first_tf");
			val = (elem.checked) ? true : false;
			prefs.setBoolPref("dummylipsum.auto_size_first_tf", val);
		
			elem = document.getElementById("rep_chars_tf");
			nsPreferences.setUnicharPref("dummylipsum.replace_chars_tf", elem.value);

			elem = document.getElementById('rep_ratio_tf');
			num = parseInt(elem.value);
			if (num == 'NaN') {
				num = _dl_prefs["replace_ratio_tf"];
			}
			else {
				if (num < 0) {
					num = 0;
				}
				else if (num > 100) {
					num = 100;
				}
			}
			prefs.setIntPref("dummylipsum.replace_ratio_tf", num);

			// Text Area default values
			elem = document.getElementById('num_items_ta');
			num = parseInt(elem.value);
			if (num == 'NaN') {
				num = _dl_prefs["num_items_ta"];
			}
			prefs.setIntPref("dummylipsum.num_items_ta", num);

			elem = document.getElementById("items_type_ta");
			prefs.setIntPref("dummylipsum.items_type_ta", elem.selectedItem.value);

			elem = document.getElementById("with_lorem_ta");
			val = (elem.checked) ? true : false;
			prefs.setBoolPref("dummylipsum.with_lorem_ta", val);

			elem = document.getElementById("with_punctuation_ta");
			val = (elem.checked) ? true : false;
			prefs.setBoolPref("dummylipsum.with_punctuation_ta", val);

			elem = document.getElementById("show_tags_ta");
			val = (elem.checked) ? true : false;
			prefs.setBoolPref("dummylipsum.show_tags_ta", val);

			elem = document.getElementById("autocopy_ta");
			val = (elem.checked) ? true : false;
			prefs.setBoolPref("dummylipsum.autocopy_ta", val);

			elem = document.getElementById("auto_size_first_ta");
			val = (elem.checked) ? true : false;
			prefs.setBoolPref("dummylipsum.auto_size_first_ta", val);
		
			elem = document.getElementById("rep_chars_ta");
			nsPreferences.setUnicharPref("dummylipsum.replace_chars_ta", elem.value);

			elem = document.getElementById('rep_ratio_ta');
			num = parseInt(elem.value);
			if (num == 'NaN') {
				num = _dl_prefs["replace_ratio_ta"];
			}
			else {
				if (num < 0) {
					num = 0;
				}
				else if (num > 100) {
					num = 100;
				}
			}
			prefs.setIntPref("dummylipsum.replace_ratio_ta", num);
			
			window.close();
		}
		catch(e) {
			alert("Preferences error\n" + e.name + ": " + e.message);
		}
	},


	_dlSetToggleMenuItemEvent: function() {
		//window.removeEventListener("load", _dlSetToggleMenuItemEvent, true);
		var elem = document.getElementById("contentAreaContextMenu")
		if (elem != null) {
			elem.addEventListener("popupshowing", DummyLipsum._dlToggleMenuItems, false);
		}
	},


	_dlToggleMenuItems: function() {
		var elem;
		var onInput = gContextMenu.onTextInput;
		
		elem = document.getElementById("dummy_lipsum_context_separator");
		elem.hidden = !onInput;
		elem = document.getElementById("dummy_lipsum_context");
		elem.hidden = !onInput;
	},


	contextDummyLipsum: function() {
		var targetInput = gContextMenu.target;
		
		// Reload preferences
		var _dl_prefs = DummyLipsum.loadPrefs();

		if ((targetInput.type != null) && (targetInput.type == 'text')) {
			// Input field
			DummyLipsum.fillInput(targetInput);
		}
		else if ((targetInput.type != null) && (targetInput.type == 'textarea')) {
			// Text area
			DummyLipsum.fillTextArea(targetInput);
		}
		else {
			// Check HTML editors
			var contentWrapper = new XPCNativeWrapper(window._content, 'doc');
			
			if (contentWrapper.wrappedJSObject.tinyMCE != null) {
				// tinyMCE
				DummyLipsum.fillEditor(contentWrapper.wrappedJSObject.tinyMCE, DummyLipsum.ED_TYPE_TINYMCE);
			}
			else if (contentWrapper.wrappedJSObject.xinha_editors != null) {
				// Xinha
				for (var i in contentWrapper.wrappedJSObject.xinha_editors) {
					if (contentWrapper.wrappedJSObject.xinha_editors[i].editorIsActivated()) {
						// Get activated editor
						DummyLipsum.fillEditor(contentWrapper.wrappedJSObject.xinha_editors[i], DummyLipsum.ED_TYPE_XINHA);
						break;
					}
				}
			}
			else if (contentWrapper.wrappedJSObject.EpozElement != null) {
				// Epoz
				DummyLipsum.fillEditor(contentWrapper.wrappedJSObject.EpozElement, DummyLipsum.ED_TYPE_EPOZ);
			}
			else if (contentWrapper.wrappedJSObject.kupu != null) {
				// Kupu
				DummyLipsum.fillEditor(contentWrapper.wrappedJSObject.kupu, DummyLipsum.ED_TYPE_KUPU);
			}
	// XXXXXXXXXXXXXXXXXXXXXXX
	// XXXXXXXXXXXXXXXXXXXXXXX
	//*
	else if (contentWrapper.wrappedJSObject.nicEditor != null) {
		// NicEdit
	/*for (var i in contentWrapper.wrappedJSObject.nicEditor.prototype) {
		alert(i);
	}*/
	/*for (var i in contentWrapper.wrappedJSObject.nicEditors.editors[0]) {
		alert(i);
	}*/
	/*alert("a");
	fillEditor(contentWrapper.wrappedJSObject.nicEditor.selectedInstance, DummyLipsum.ED_TYPE_NICEDIT);
	alert("b");*/
		//for (var i in contentWrapper.wrappedJSObject.nicEditor.prototype.nicInstances) {
		for (var i in contentWrapper.wrappedJSObject.nicEditors.editors) {
	/*if (contentWrapper.wrappedJSObject.nicEditors.editors[i].lastSelectedInstance != undefined) {
	alert ("lastSelectedInstance: " + contentWrapper.wrappedJSObject.nicEditors.editors[i].lastSelectedInstance);
	alert ("getContent: " + contentWrapper.wrappedJSObject.nicEditors.editors[i].lastSelectedInstance.getContent());
	alert ("isFocused: " + contentWrapper.wrappedJSObject.nicEditors.editors[i].lastSelectedInstance.isFocused);
	}*/
	/*if (contentWrapper.wrappedJSObject.nicEditors.editors[i].isFocused) {
		alert("SI");
	}
	else {
		alert("NO");
	}*/
	//alert(contentWrapper.wrappedJSObject.nicEditor.prototype.nicInstances[i].getContent());
	//alert(contentWrapper.wrappedJSObject.nicEditor.prototype.nicInstances[i].selectedInstance);
	/*		if (contentWrapper.wrappedJSObject.nicEditor.prototype.nicInstances[i].isSelected) {
				// Get activated editor
				fillEditor(contentWrapper.wrappedJSObject.nicEditor.prototype.nicInstances[i], DummyLipsum.ED_TYPE_NICEDIT);
				break;
			}*/
		}
	/*
	alert(contentWrapper.wrappedJSObject.nicEditor.prototype.nicInstances[i].selectedInstance);
		if (contentWrapper.wrappedJSObject.nicEditor.selectedInstance) {
			// Get activated editor
			fillEditor(contentWrapper.wrappedJSObject.nicEditor.prototype.selectedInstance, DummyLipsum.ED_TYPE_NICEDIT);
		}
	*/
	}
	//*/
	// XXXXXXXXXXXXXXXXXXXXXXX
	// XXXXXXXXXXXXXXXXXXXXXXX
			else {
				// No valid fiels/editor found
				alert('No valid field');
			}
		}
	},


	fillInput: function(target) {
		var max, size, lon, type;
		var _dl_prefs = DummyLipsum.loadPrefs();

		lon = 0;
		if (_dl_prefs["auto_size_first_tf"]) {
			// Try to auto detect field size
			try {
				max = target.getAttribute('maxlength');
			}
			catch (e) {
				max = 0;
			}

			try {
				size = target.size;
			}
			catch (e) {
				size = 0;
			}
		
			if ((!isNaN(max)) && (!isNaN(size)) && (max > 0) && (size > 0)) {
				lon = Math.round((max + size) / 2);
				type = 'bytes';
			}
			else if ((!isNaN(max)) && (max > 0)) {
				lon = max;
				type = 'bytes';
			}
			else if ((!isNaN(size)) && (size > 0)) {
				lon = size;
				type = 'bytes';
			}
		}
		
		if (lon == 0) {
			lon = _dl_prefs["num_items_tf"];
			type = DummyLipsum.types_values[_dl_prefs["items_type_tf"]];
		}
		
		DummyLipsum.populateForm(target, lon, type, _dl_prefs["with_lorem_tf"], _dl_prefs["with_punctuation_tf"], _dl_prefs["show_tags_tf"], _dl_prefs["autocopy_tf"], "_tf");
	},


	fillTextArea: function(target) {
		var cols, rows, lon, type;
		var _dl_prefs = DummyLipsum.loadPrefs();

		lon = 0;
		if (_dl_prefs["auto_size_first_ta"]) {
			// Try to auto detect field size
			try {
				cols = target.cols;
			}
			catch (e) {
				cols = 0;
			}

			try {
				rows = target.rows;
			}
			catch (e) {
				rows = 0;
			}
			
			if ((!isNaN(cols)) && (!isNaN(rows)) && (cols > 0) && (rows > 0)) {
				lon = cols * rows;
				type = 'bytes';
			}
			else if ((!isNaN(rows)) && (rows > 0)) {
				lon = rows * 10;
				type = 'bytes';
			}
			else if ((!isNaN(cols)) && (cols > 0)) {
				lon = cols * 10;
				type = 'bytes';
			}
		}
		
		if (lon == 0) {
			lon = _dl_prefs["num_items_ta"];
			type = DummyLipsum.types_values[_dl_prefs["items_type_ta"]];
		}
		
		DummyLipsum.populateForm(target, lon, type, _dl_prefs["with_lorem_ta"], _dl_prefs["with_punctuation_ta"], _dl_prefs["show_tags_ta"], _dl_prefs["autocopy_ta"], "_ta");
	},


	fillEditor: function(editor, ed_type) {
		var _dl_prefs = DummyLipsum.loadPrefs();
		DummyLipsum.populateEditor(editor, ed_type, _dl_prefs["num_items_te"], DummyLipsum.types_values[_dl_prefs["items_type_te"]], _dl_prefs["with_lorem_te"], _dl_prefs["with_punctuation_te"], _dl_prefs["autocopy_te"]);
	},


	populateForm: function(target, num, type, with_lorem, with_punctuation, show_tags, autocopy, pref_suffix) {
		try {
			var _request = null;
			var start, punctuation, elem;

			num = DummyLipsum._url_num + "=" + num;
			type = DummyLipsum._url_type + "=" + type;
			start = DummyLipsum._url_start + "=" + ((with_lorem) ? DummyLipsum.start_value_yes : DummyLipsum.start_value_no);
			punctuation = DummyLipsum._url_punctuation + "=" + ((with_punctuation) ? DummyLipsum.punctuation_value_yes : DummyLipsum.punctuation_value_no);
			var url = DummyLipsum._baseURL + "?" + num + "&" + type + "&" + start + "&" + punctuation;
			
			//target.value = 'Fetching...';
			target.value = DummyLipsum.getFetchingLabel();
			var pos = DummyLipsum.nextEmpty();
			DummyLipsum.inputs_global[pos] = target;
			var time_id = window.setInterval('DummyLipsum.fetching('+pos+')', DummyLipsum.fetching_delay);

			_request = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);
			_request.open("GET", url, true);
			_request.overrideMimeType("text/xml");
			_request.onload = function() { DummyLipsum._onPopulateLoad(target, time_id, pos, show_tags, autocopy, this.responseXML, this.status, pref_suffix) };
			_request.onerror = function() { DummyLipsum._onPopulateError(time_id, pos, this.statusText) };
			_request.send(null);
		}
		catch (e) {
			alert("Error\n" + e.name + ": " + e.message);
		}
	},


	populateEditor: function(target, ed_type, num, type, with_lorem, with_punctuation, autocopy) {
		try {
			var _request = null;
			var start, punctuation, elem;

			num = DummyLipsum._url_num + "=" + num;
			type = DummyLipsum._url_type + "=" + type;
			start = DummyLipsum._url_start + "=" + ((with_lorem) ? DummyLipsum.start_value_yes : DummyLipsum.start_value_no);
			punctuation = DummyLipsum._url_punctuation + "=" + ((with_punctuation) ? DummyLipsum.punctuation_value_yes : DummyLipsum.punctuation_value_no);
			var url = DummyLipsum._baseURL + "?" + num + "&" + type + "&" + start + "&" + punctuation;
			
			var pos = DummyLipsum.nextEmpty();
			DummyLipsum.inputs_global[pos] = target;
			
			_request = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);
			_request.open("GET", url, true);
			_request.overrideMimeType("text/xml");
			_request.onload = function() { DummyLipsum._onPopulateEditorLoad(target, ed_type, pos, autocopy, this.responseXML, this.status) };
			_request.onerror = function() { DummyLipsum._onPopulateEditorError(pos, this.statusText) };
			_request.send(null);
		}
		catch (e) {
			alert("Error\n" + e.name + ": " + e.message);
		}
	},


	_onPopulateLoad: function(target, time_id, global_pos, show_tags, autocopy, aResponse, aStatus, pref_suffix) {
		DummyLipsum.stopInterval(time_id, global_pos);
		try {
			var body = "";
			
			if (!aResponse || aStatus > 200) {
				var error = "Error";
				if (aResponse)
					error += "\nResponse: " + aResponse;
				error += "\nStatus: " + aStatus;
				alert(error);
				return;
			}
		
			//body = aResponse.getElementById("lipsum").innerHTML;
			var nodes = aResponse.getElementsByTagName("lipsum");
			if (nodes.length <= 0) {
				DummyLipsum.setText("Error");
				return;
			}
			else {
				body = nodes[0].firstChild.nodeValue;
			}
			if (body.length == 0) {
				alert("Error");
				return;
			}
			
			body = DummyLipsum.rebuidTags(body, DummyLipsum.getWhatFromURL(aResponse.baseURI));
			
			if (!show_tags) {
				body = DummyLipsum.removeTags(body);
			}
			else {
				body = DummyLipsum.removeAttributes(body);
			}
			body = DummyLipsum.addSpecialChars(body, pref_suffix);
			
			if (target.type == 'text') {
				body = DummyLipsum.replaceAll(body, "\n", "");
			}

			target.value = body;
			
			if (autocopy) {
				DummyLipsum.copyDummyContext(body);
			}
		}
		catch(e) {
			alert("Error\n" + e.name + ": " + e.message);
		}
	},


	_onPopulateEditorLoad: function(target, ed_type, global_pos, autocopy, aResponse, aStatus) {
		try {
			var body = "";
			
			if (!aResponse || aStatus > 200) {
				var error = "Error";
				if (aResponse)
					error += "\nResponse: " + aResponse;
				error += "\nStatus: " + aStatus;
				alert(error);
				return;
			}
		
			//body = aResponse.getElementById("lipsum").innerHTML;
			var nodes = aResponse.getElementsByTagName("lipsum");
			if (nodes.length <= 0) {
				DummyLipsum.setText("Error");
				return;
			}
			else {
				body = nodes[0].firstChild.nodeValue;
			}
			if (body.length == 0) {
				alert("Error");
				return;
			}
			
			body = DummyLipsum.rebuidTags(body, DummyLipsum.getWhatFromURL(aResponse.baseURI));
			
			body = DummyLipsum.removeAttributes(body);
			body = DummyLipsum.addSpecialChars(body, "_te");
			
			switch (ed_type) {
				case DummyLipsum.ED_TYPE_TINYMCE:
					// TinyMCE
					if ((target.setContent != undefined) && (target.setContent != null)) {
						target.setContent(body);
					}
					else {
						target.selectedInstance.setContent(body);
					}
					break;
				case DummyLipsum.ED_TYPE_XINHA:
					// Xinha
					target.setHTML(body);
					break;
				case DummyLipsum.ED_TYPE_NICEDIT:
					// NicEdit
					target.setContent(body);
					break;
				case DummyLipsum.ED_TYPE_EPOZ:
					// Epoz
					target.contentWindow.document.body.innerHTML = body;
					break;
				case DummyLipsum.ED_TYPE_KUPU:
					// Kupu
					target.getDocument().document.body.innerHTML = body;
					break;
			}

			if (autocopy) {
				DummyLipsum.copyDummyContext(body);
			}
		}
		catch(e) {
			alert("Error\n" + e.name + ": " + e.message);
		}
	},


	_onPopulateError: function(time_id, global_pos, error) {
		DummyLipsum.stopInterval(time_id, global_pos);
		alert("Error\n" + error);
	},


	_onPopulateEditorError: function(global_pos, error) {
		alert("Error\n" + error);
	},


	nextEmpty: function() {
		var i;
		for (i=0; i<DummyLipsum.inputs_global.length; i++) {
			if (DummyLipsum.inputs_global[i] == null) {
				return i;
			}
		}
		
		return i;
	},


	stopInterval: function(time_id, global_pos) {
		window.clearInterval(time_id);
		DummyLipsum.inputs_global[global_pos] = null;
		DummyLipsum.fetching_iter = 0;
	},


	fetching: function(input) {
		/*var value;
		switch (fetching_iter) {
			case 1:
				value = 'F etching...';
				break;
			case 2:
				value = 'Fe tching...';
				break;
			case 3:
				value = 'Fet ching...';
				break;
			case 4:
				value = 'Fetc hing...';
				break;
			case 5:
				value = 'Fetch ing...';
				break;
			case 6:
				value = 'Fetchi ng...';
				break;
			case 7:
				value = 'Fetchin g...';
				break;
			case 8:
				value = 'Fetching ...';
				break;
			case 9:
				value = 'Fetching. ..';
				break;
			case 10:
				value = 'Fetching.. .';
				break;
			default:
				value = 'Fetching...';
				break;
		}
		inputs_global[input].value = value;
		fetching_iter = (fetching_iter + 1) % 12;*/
		var value = DummyLipsum.getFetchingLabel();
		var lon = value.length;
		if ((DummyLipsum.fetching_iter > 0) && (DummyLipsum.fetching_iter < lon)) {
			value = value.substr(0, DummyLipsum.fetching_iter) + " " + value.substr(DummyLipsum.fetching_iter);
		}
		DummyLipsum.inputs_global[input].value = value;
		DummyLipsum.fetching_iter = (DummyLipsum.fetching_iter + 1) % (lon + 1);
	}
};



//window.addEventListener("load", DummyLipsum._dlSetToggleMenuItemEvent, true);
window.addEventListener("load", DummyLipsum.init, true);
