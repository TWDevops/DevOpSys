/*jshint sub:true es5:true*/
/**
 * Module Auto Loading
 * Loading modules from config.json
 *  "MOD_LIST":{"route" : "modules"},
 * modules path: /mod/"route".
 */
var config = require("nconf");
config.env().file({ "file":"config.json" });

var express = require('express');
var router = express.Router();

function addGet(idx, handle){
    console.log("Registing GET Method");
    for (var key in handle){
        if(handle.hasOwnProperty(key)){
        console.log( "Mod " + idx + " key: " + key);
        if(typeof handle[key] === 'function'){
            console.log("Mod " + idx + " GET method register: " + "/" + idx + "/" + key);
            router.get("/" + idx + "/" + key, handle[key]);
        }
        }
    }
}

function addPost(idx, handle){
    console.log("Registing POST Method");
    for (var key in handle){
        if(handle.hasOwnProperty(key)){
        console.log( "Mod " + idx + " key: " + key);
        if(typeof handle[key] === 'function'){
            console.log("Mod " + idx + " POST method register: " + "/" + idx + "/" + key);
            router.post("/" + idx + "/" + key, handle[key]);
        }
        }
    }
}

function addPut(idx, handle){
    console.log("Registing PUT Method");
    for (var key in handle){
        if(handle.hasOwnProperty(key)){
        console.log( "Mod " + idx + " key: " + key);
        if(typeof handle[key] === 'function'){
            console.log("Mod " + idx + " PUT method register: " + "/" + idx + "/" + key);
            router.put("/" + idx + "/" + key, handle[key]);
        }
        }
    }
}

function addDelete(idx, handle){
    console.log("Registing DELETE Method");
    for (var key in handle){
        if(handle.hasOwnProperty(key)){
        console.log( "Mod " + idx + " key: " + key);
        if(typeof handle[key] === 'function'){
            console.log("Mod " + idx + " DELETE method register: " + "/" + idx + "/" + key);
            router.delete("/" + idx + "/" + key, handle[key]);
        }
        }
    }
}

var modEnList = config.get("MOD_LIST");

for (var modIdx in modEnList){
    if(modEnList.hasOwnProperty(modIdx)){
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
    
    if( typeof mod.putHandler !==  'undefined' && Object.keys(mod.putHandler).length >0){
        addPut(modIdx,mod.putHandler);
    }
    
    if( typeof mod.delHandler !==  'undefined' && Object.keys(mod.delHandler).length >0){
        addDelete(modIdx,mod.delHandler);
    }
    }
}

module.exports = router;