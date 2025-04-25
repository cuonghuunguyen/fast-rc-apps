const packageGlob = "**/*.*";

/**
 * Default assets files. Which are not TypeScript files but needed for a Rocket.Chat app
 * @type {string[]}
 */
const defaultAssetFiles = ["app.json", "icon.png", "i18n"];

module.exports = {
	packageGlob,
	defaultAssetFiles
};
