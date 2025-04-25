const commandDescription = {
	INIT: "Create a new rocket chat app project",
	DEPLOY: "Deploy the new app or update the existing one on the Rocket.Chat server",
	UNINSTALL: "Uninstall the app from a Rocket.Chat server if exist",
	PACKAGE: "Package the app into a zip file inside dist folder instead of deploying it",
	REPACK: "Create a new zip file from an existing one which has different app.json"
};
module.exports = commandDescription;
