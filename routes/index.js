var express = require('express');
var router = express.Router();

var sess;
/* GET home page. */
router.get('/', function(req, res, next) {
	sess=req.session;
	//res.writeHead(301,{Location: '/mod/api/listview'});
	//res.end();
	/*if(!sess.user){
		res.writeHead(301,{Location: '/users'});
		res.end();
	}else
	console.log("username: " + sess.user);*/
	res.render('index', {
		title: 'DevOpSys',
		username: sess.user
	});
});

module.exports = router;
