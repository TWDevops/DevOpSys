/**
 * Frontend test Module
 */

var headHander = {}
var getHandler = {};
var postHandler = {};

function helloWorld(req, res, next) {
    //code
    res.render('helloworldview', {
        'title': 'HelloWorld'
    }
}


exports.headHander = headHander;
exports.getHandler = getHandler;
exports.postHandler = postHandler;