/*jshint sub: true es5:true*/
/**
 * API Manager Module
 */
//var DataBase = new require('../utils/DataBase.js');
//var dbase = new DataBase();
var dbase = new require('../utils/DataBase.js');

/*
 *  Method List(head, get, post)
 */
var headHander = {};
var getHandler = {};
var postHandler = {};
/*
document.getElementById('tryTestCase').click(function(){
        console.log("tryTestCase");
    });
*/    

function testcaseview(req, res, next) {
    if(req.session.apiId){
        console.log("session.apiId: " + req.session.apiId);
        req.session.apiId=null;
    }

    console.log("session.apiId: " + req.session.apiId);
    



    var db = dbase.getDb();
    var sendData = {};
    //console.log("use api");
    db.open(function(error, devopsDb) {
        if(error){
            console.log(error.stack);
            process.exit(0);
        }
        devopsDb.collection('testcase', function(error, mongoColl){
            if(error){
                console.log(error.stack);
                process.exit(0);
            }

            mongoColl.find({},{'testid':true, 'type':true, 'class':true, 'description': true,"testdata":true}).toArray(function(error, result){
            if(error){
                console.log(error.stack);
                process.exit(0);
            }
            db.close();
            //console.log(sendData);
            res.render('testcase',{
                 title: "Test Case List",
                 testCaseList: result
            });

            });
        });
    });

}
getHandler["testcaseview"]=testcaseview;

function trytestcase(req, res, next) {
    if(req.session.apiId){
        console.log("session.apiId: " + req.session.apiId);
        req.session.apiId=null;
    }

    console.log("session.apiId: " + req.session.apiId);
    console.log("req: " + JSON.stringify(req.body));

    res.send('OK');
}
postHandler["tryTestCase"]=trytestcase;

function testserverview(req, res, next){
    var db = dbase.getDb();
    var sendData={};
    var apiOid = null;
    res.send('OK');
}
getHandler["testserverview"] = testserverview;


exports.headHander = headHander;
exports.getHandler = getHandler;
exports.postHandler = postHandler;
//exports.list = list;
//module.exports = router;
