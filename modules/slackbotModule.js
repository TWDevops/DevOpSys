var https = require('https');
var querystring = require('querystring');

module.exports = {

	sendMsg : function(message, callback){
		console.log("sendMsg: " + JSON.stringify(message));	
		var msgFormat = {
			text: message
		};
		var post_data = JSON.stringify(msgFormat);
		//https://hooks.slack.com/services/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
	  	// An object of options to indicate where to post to
	  	var post_options = {
	      	host: 'hooks.slack.com',
	      	//port: '80',
	      	path: '/services/T06AJQFL1/B0F5ZN62G/GdS0WAT7ejw8fEHNfxVBEiqv',
	      	method: 'POST',
	      	headers: {
	          	//'Content-Type': 'application/x-www-form-urlencoded',
	          	'Content-Length': Buffer.byteLength(post_data)
	      	}
	  	};

		  // Set up the request
		var post_req = https.request(post_options, function(res) {
		    res.setEncoding('utf8');
		    res.on('data', function (chunk) {
		    	console.log('Response: ' + chunk);
		    	//callback(true, chunk);
		    });

		    res.on('error', function(error) {
    			console.log('error: ' + error);
    			//callback(false, error);
 			 });
		});

  		// post the data
  		post_req.write(post_data);
  		post_req.end();
	}
}


