#!/bin/bash

function installNodeModules() {
	echo
	if [ -d node_modules ]; then
		echo "============== node modules installed already ============="
	else
		echo "============== Installing node modules ============="
		npm install
	fi
	echo
}

function installPM() {
	echo "============== installing Node package manager PM2 ============="
	npm install pm2@latest -g
}

function startApp() {
	echo "============== PM2 starting app ============="
	pm2 start app.js
}


installNodeModules
installPM
startApp