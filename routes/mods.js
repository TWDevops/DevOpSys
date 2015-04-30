/**
 * Module Auto Loading
 * 
 * 在程式起動時,會自動搜尋config.json裡的 MOD_LIST 設定,
 *  "MOD_LIST":{"route" : "modules"},
 * 載入模組及相對應的路行,啟始路行為/mod/"route".
 */
var express = require('express');
var router = express.Router();

for (var modIdx in config.get("MOD_LIST")){
	console.log("modules: " + config.get("MOD_LIST")[modIdx]);
	var mod = require("../modules/" + config.get("MOD_LIST")[modIdx] + ".js");
	//console.log(Object.keys(mod.getHandler).length);
	//console.log(Object.keys(mod.postHandler).length);
	if( typeof mod.getHandler !==  'undefined' && Object.keys(mod.getHandler).length >0){
		addGet(modIdx,mod.getHandler);
	}
	if( typeof mod.postHandler !==  'undefined' && Object.keys(mod.postHandler).length >0){
		addPost(modIdx,mod.postHandler);
	}
}

function addGet(idx, handle){
	console.log("Registing GET Method");
	for (var key in handle){
		console.log( "Mod " + idx + " key: " + key);
		if(typeof handle[key] === 'function'){
			console.log("Mod " + idx + " GET method register: " + "/" + idx + "/" + key);
			router.get("/" + idx + "/" + key, handle[key]);
		}
	}
}

function addPost(idx, handle){
	console.log("Registing POST Method");
	for (var key in handle){
		console.log( "Mod " + idx + " key: " + key);
		if(typeof handle[key] === 'function'){
			console.log("Mod " + idx + " POST method register: " + "/" + idx + "/" + key);
			router.post("/" + idx + "/" + key, handle[key]);
		}
	}
}

module.exports = router;