const fs = require("fs-extra");
const path = require("path");

const zipHelper = require("../helpers/zip-helper");
const fileHelper = require("../helpers/file-helper");

const { builder: deployParams } = require("./deploy");
const { login, removeApp } = require("../helpers/api-helper");

const commands = require("../constants/commands");
const commandsDescription = require("../constants/command-description");

const command = commands.UNINSTALL;
const desc = commandsDescription.UNINSTALL;

const { url, username, password, "zip-path": zipPath, code, interactive } = deployParams;

const OPTIONAL_PARAMS = "Optional params";

const builder = {
	url,
	username,
	password,
	interactive,
	"zip-path": {
		...zipPath,
		desc: "Path to the zip file which contains the app you want to remove from the server"
	},
	code,
	id: {
		require: false,
		desc: "ID of the app you want to remove",
		group: OPTIONAL_PARAMS
	}
};

const handler = async argv => {
	const { username, password, url, code, zipPath, id } = argv;

	await login(url, username, password, code);

	const appId = id || getAppIdFromAppJson() || getAppIdFromZip(zipPath);

	if (!appId) {
		throw new Error("You have to provide an app ID to remove the app");
	}

	await removeApp(appId);
};

const getAppIdFromZip = zipPath => {
	if (zipPath) {
		if (fs.pathExistsSync(zipPath)) {
			return zipHelper.getAppId(path.resolve(zipPath));
		}
	}
};

const getAppIdFromAppJson = () => {
	try {
		return fileHelper.getAppJson().id;
	} catch (error) {
		return undefined;
	}
};

module.exports = {
	command,
	desc,
	builder,
	handler
};
