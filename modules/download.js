/*jshint sub: true es5:true*/
/**
 * Files download modules.
 */
var headHander = {};
var getHandler = {};
var postHandler = {};

/**
 * Download API file:
 * URL: http://apimanUrl/mod/download/api/:file
 */
function apiFileDl(req, res, next) {
    var apiFile = req.params.file,
        path = __dirname + '/../downloads/deploy/' + apiFile;
    
    res.download(path);
    
}
getHandler['api/:file(*)'] = apiFileDl;

exports.headHander = headHander;
exports.getHandler = getHandler;
exports.postHandler = postHandler;