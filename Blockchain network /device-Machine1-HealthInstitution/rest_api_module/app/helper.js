/**
 * Copyright 2017 IBM All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an 'AS IS' BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
'use strict';
var log4js = require('log4js');
var logger = log4js.getLogger('Helper');
logger.setLevel('DEBUG');

var path = require('path');
var util = require('util');

var hfc = require('fabric-client');
hfc.setLogger(logger);

async function getClientForOrg (userorg, username) {
	logger.debug('getClientForOrg - ****** START %s %s', userorg, username)
	let config = '-connection-profile-path';
	let client = hfc.loadFromConfig(hfc.getConfigSetting('network'+config));
	client.loadFromConfig(hfc.getConfigSetting(userorg+config));
	await client.initCredentialStores();
	if(username) {
		let user = await client.getUserContext(username, true);
		if(!user) {
			throw new Error(util.format('User was not found :', username));
		} else {
			logger.debug('User %s was found to be registered and enrolled', username);
		}
	}
	logger.debug('getClientForOrg - ****** END %s %s \n\n', userorg, username)

	return client;
}

var checkSecret = async function(userorg, secret1) {
	let config = '-connection-profile-path';
	let client = hfc.loadFromConfig(hfc.getConfigSetting('network'+config));
	let orgs = client._network_config._network_config.organizations
	return orgs[`${userorg}`]['secret']

}


var registerUser = async function(username, userOrg, role, attrs) {
	try {
		var client = await getClientForOrg(userOrg);
		logger.debug('Successfully initialized the credential stores');
		var user = await client.getUserContext(username, true);
		if (user && user.isEnrolled()) {
			var response = { 
				success: true,
				message: 'Successfully loaded member from persistence'
			}
			return response
		} else {
			logger.debug('User %s was not enrolled, so we will need an admin user object to register',username);
			var admins = hfc.getConfigSetting('admins');
			let adminUserObj = await client.setUserContext({username: admins[0].username, password: admins[0].secret});
			let caClient = client.getCertificateAuthority();
			let registerObj = {
				enrollmentID: username,
				affiliation: userOrg.toLowerCase() + '.department1',
				role: role,
				attrs: attrs
			}
			let secret = await caClient.register(registerObj, adminUserObj);
			logger.debug('Successfully registered user %s with secret %s. Register object is:\n%s', username, secret, JSON.stringify(registerObj));
			let enrollment = await caClient.enroll({enrollmentID: username, enrollmentSecret: secret})
			logger.debug('Successfully enrolled member user %s', username);
			let userObj = {
				username: username,
				mspid: `${userOrg}MSP`,
				cryptoContent: { privateKeyPEM: enrollment.key.toBytes(), signedCertPEM: enrollment.certificate}	
			}
			user = await client.createUser(userObj)
			logger.debug('Successfully created user %s', JSON.stringify(userObj));
			let member_user = await client.setUserContext({username:username, password:secret});
			logger.debug('Successfully loaded user context %s', member_user.toString());

			if(member_user && member_user.isEnrolled) {
					var response = {
						success: true,
						secret: secret,
						message: username + ' registered and enrolled successfully.'
					};
					return response;
		} else {
			throw new Error('User was not registered/enrolled.');
		}
	}
 } catch(error) {
		logger.error('Failed to get registered user %s with error: %s', username, error.toString());
		if(error.toString().indexOf('Authorization') > -1) {
			logger.error('Authorization failures may be caused by having admin credentials from a previous CA instance.\n' +
			'Try again after deleting the contents of the store directory.');
		}
		var response = {
			success: false,
			error: error.toString()
		}
		return response
	}

};


var getLogger = function(moduleName) {
	var logger = log4js.getLogger(moduleName);
	logger.setLevel('DEBUG');
	return logger;
};

exports.getClientForOrg = getClientForOrg;
exports.getLogger = getLogger;
exports.registerUser = registerUser;
exports.checkSecret = checkSecret;