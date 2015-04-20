/**
 * Hello Module
 * for Testing
 */
var getHandler = {};

function sayHello(req, res, next) {
	res.send({msg: 'hello ' + req.query.name});
	//res.send()所帶入的參數需要為json格式，否則會出現下面錯誤：
	//{"code":"InternalError","message":"Object.keys called on non-object"} });
}
getHandler['sayhello'] = sayHello;
// express deprecated req.param(name): Use req.params, req.body, or req.query instead at ../modules/hello.js:6:32

exports.getHandler = getHandler;