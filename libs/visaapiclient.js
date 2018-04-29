const request = require('request');
const fs = require('fs');
const crypto = require('crypto');
const config = require('../config/configuration.json');
const randomstring = require('randomstring');

function logRequest(requestBody, path) {
	console.log("URL : " + config.visaUrl + path);
	if (requestBody !== null && requestBody !== '') {
		console.log("Request Body : " + JSON.stringify(JSON.parse(requestBody),null,4));
	}
}

function logResponseBody(response, body) {
	console.log("Response Code: " + response.statusCode);
	console.log("Headers:");
	for(var item in response.headers) {
		console.log(item + ": " + response.headers[item]);
	}
	console.log("Body: "+ JSON.stringify(JSON.parse(body),null,4));
}

VisaAPIClient.prototype.doMutualAuthRequest = function(path, requestBody, methodType, headers, callback) {
	const userId = config.userId ;
	const password = config.password;
	const keyFile = config.key;
	const certificateFile = config.cert;
	logRequest(requestBody, path);

	if (methodType === 'POST' || methodType === 'PUT') {
		headers['Content-Type'] = 'application/json';
	}

	headers['Accept'] = 'application/json';
	headers['Authorization'] = getBasicAuthHeader(userId, password);
	headers['ex-correlation-id'] = randomstring.generate({length:12, charset: 'alphanumeric'}) + '_SC'
	request({
		uri : config.visaUrl + path,
		key: fs.readFileSync(keyFile),
		method : methodType,
		cert: fs.readFileSync(certificateFile),
		headers: headers,
		body: requestBody,
		timeout: 30000
	}, function(error, response, body) {
		if (!error) {
			logResponseBody(response, body);
			callback(null, response.statusCode);
		} else {
			console.log(error);
			callback(error);
		}
	});
};