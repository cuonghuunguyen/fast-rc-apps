const fs = require("fs-extra");
const path = require("path");

/**
 * Check if a file is existing in the current folder
 */
function checkFileExistence(filePath) {
	return fs.pathExistsSync(filePath);
}

/**
 * Read a JSON file with NodeJS's require cache after checking that file's existence
 */
function readJsonFile(filePath) {
	const fileExist = checkFileExistence(filePath);

	if (!fileExist) {
		return undefined;
	}

	const fileAbsolutePath = path.resolve(filePath);
	return fs.readJsonSync(fileAbsolutePath);
}

const getAppJson = () => {
	const appJson = readJsonFile("app.json");
	if (!appJson) {
		throw new Error("Cannot find app.json file, make sure you're in an App's root directory");
	}
	return appJson;
};

const getRcAppsConfig = () => {
	const rcAppsConfig = readJsonFile(".rcappsconfig");
	if (!rcAppsConfig) {
		return {}
	}
	return rcAppsConfig;
}

/**
 * Read and return value of `tsconfig.json` file as JS Object
 * @param tsConfigJsonPath Custom `tsconfig.json` file, it is useful for the projects which contain multiple TS profiles
 */
const getTSConfigJson = tsConfigJsonPath => {
	const tsConfigJson = readJsonFile(tsConfigJsonPath || "tsconfig.json");
	if (!tsConfigJson) {
		throw new Error("Cannot find tsconfig.json file, you have to provide it to compile the App");
	}
	return tsConfigJson;
};

const getPackageJson = () => {
	const packageJson = readJsonFile("./package.json");
	if (!packageJson) {
		throw new Error("Cannot find a package.json file, make sure you are in the root folder of the app");
	}
	return packageJson;
};

module.exports = {
	getTSConfigJson,
	getAppJson,
	readJsonFile,
	getPackageJson,
	getRcAppsConfig
};
