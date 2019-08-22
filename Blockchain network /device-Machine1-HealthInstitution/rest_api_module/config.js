var util = require('util');
var path = require('path');
var hfc = require('fabric-client');

var file = 'network-config%s.yaml';

var env = process.env.TARGET_NETWORK;
if (env)
	file = util.format(file, '-' + env);
else
	file = util.format(file, '');

// Load network configuration profiles
hfc.setConfigSetting('network-connection-profile-path',path.join(__dirname, 'artifacts' ,file));
hfc.setConfigSetting('HealthInstitution-connection-profile-path',path.join(__dirname, 'artifacts', 'HealthInstitution.yaml'))
hfc.setConfigSetting('SRCInfonet-connection-profile-path',path.join(__dirname, 'artifacts', 'SRCInfonet.yaml'))
hfc.setConfigSetting('MinistryOfHealth-connection-profile-path',path.join(__dirname, 'artifacts', 'MinistryOfHealth.yaml'))

// Load some other settings the application might need
hfc.addConfigFile(path.join(__dirname, 'config.json'));
		