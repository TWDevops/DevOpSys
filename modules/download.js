/**
 * New node file
 */
var headHander = {};
var getHandler = {};
var postHandler = {};

/**
 * Download API file:
 * URL: http://apimanUrl/mod/download/api/:file
 */
function apiFileDL(req, res, next) {
    var apiFile = req.params.file,
    	path = __dirname + '/../downloads/apifiles/' + apiFile;
    
    res.download(path);
    
}
getHandler['api/:file(*)'] = apiFileDL;



exports.headHander = headHander;
exports.getHandler = getHandler;
exports.postHandler = postHandler;