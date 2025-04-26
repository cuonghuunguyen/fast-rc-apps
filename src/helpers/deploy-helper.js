const path = require("path");
const fs = require("fs-extra");

const { deployApp, isExistingApp, login } = require("./api-helper");
const zipHelper = require("./zip-helper");
const { handler: package } = require("../commands/package");
const { getOldestFile } = require("./file-helper");

const deploy = async argv => {
	const { username, password, url, zipPath, production, forceUpdate, code, skipTypeCheck, permissions } = argv;
	let zipAbsolutePath;

	if (zipPath) {
		if (!fs.pathExistsSync(zipPath)) {
			throw new Error("Zip file does not exist");
		}
		zipAbsolutePath = path.resolve(zipPath);
	} else {
		await package({ production, skipTypeCheck });
		const distFolder = path.resolve("dist");
		const zipName = getOldestFile(distFolder);
		if (!zipName) {
			throw new Error("App packaging failed");
		}
		zipAbsolutePath = path.join(distFolder, zipName);
	}

	const appId = zipHelper.getAppId(zipAbsolutePath);

	await login(url, username, password, code);

	const zipData = fs.createReadStream(zipAbsolutePath);

	if (forceUpdate || (await isExistingApp(appId))) {
		await deployExistingApp(zipData, appId, permissions);
	} else {
		await deployNewApp(zipData, permissions);
	}

	console.log("App deployed successfully");
};

const deployNewApp = async (zipData, permissions) => {
	console.log("Deploying new app...");
	await deployApp(zipData, permissions);
};

const deployExistingApp = async (zipData, appId, permissions) => {
	console.log("App already exists, updating app...");
	await deployApp(zipData, permissions, appId);
};

module.exports = {
	deploy
};
