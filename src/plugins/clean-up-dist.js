const fs = require("fs-extra");
const path = require("path");

/**
 * @type import("esbuild").Plugin
 */
const cleanUpDist = {
	name: "Clean up dist folder",
	setup({ onStart }) {
		const distFolderPath = path.resolve("dist");
		onStart(async () => {
			fs.emptyDirSync(distFolderPath);
		});
	}
};
module.exports = {
	cleanUpDist
};
