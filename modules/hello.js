/*jshint sub: true es5:true*/
/**
 * Hello Module
 * for Testing
 */
var getHandler = {};

//res.send()  need json formatter;  

function sayHello(req, res, next) {
	res.send({msg: 'hello ' + req.query.name});
}

getHandler.sayhello = sayHello;
// express deprecated req.param(name): Use req.params, req.body, or req.query instead at ../modules/hello.js:6:32

exports.getHandler = getHandler;