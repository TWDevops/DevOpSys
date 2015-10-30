var config = require("nconf");
config.env().file({ "file":"config.json" });

var dps_token = null;

var Auth = function(){
    dps_token = config.get('DPS_TOKEN');
};

Auth.prototype.checkHttpToken = function(token){
    return dps_token === token;
};

Auth.prototype.checkPermission = function(id, permit){
    return true;
};

module.exports = Auth;