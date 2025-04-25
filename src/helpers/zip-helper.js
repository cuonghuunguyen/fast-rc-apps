const Zip = require("adm-zip");
const path = require("path");

const getAppId = zipPath => {
	const zip = new Zip(zipPath);
	const appDotJsonEntry = zip.getEntry("app.json");
	if (!appDotJsonEntry) {
		throw new Error("Cannot find app.json in the zip file");
	}
	const appDotJson = JSON.parse(zip.readAsText(appDotJsonEntry));
	return appDotJson.id;
};

const writeZipAsync = async (zip, destination) => {
	return new Promise(resolve => {
		zip.writeZip(destination, resolve);
	});
};

const updateAppJson = async (zipPath, newAppJson, destination) => {
	const zip = new Zip(zipPath);
	const appDotJsonEntry = zip.getEntry("app.json");
	if (!appDotJsonEntry) {
		throw new Error("Cannot find app.json in the zip file");
	}
	const oldAppJSon = JSON.parse(zip.readAsText(appDotJsonEntry));
	const newAppJsonContent = JSON.stringify(
		{
			...oldAppJSon,
			...newAppJson
		},
		null,
		4
	);
	zip.updateFile(appDotJsonEntry, Buffer.from(newAppJsonContent, "utf8"));
	return await writeZipAsync(zip, path.resolve(destination));
};

module.exports = {
	getAppId,
	updateAppJson,
	writeZipAsync
};
