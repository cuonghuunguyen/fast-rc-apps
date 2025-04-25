const commands = require("../constants/commands");
const commandsDescription = require("../constants/command-description");
const { readJsonFile } = require("../helpers/file-helper");
const { updateAppJson } = require("../helpers/zip-helper");

const command = commands.REPACK;
const desc = commandsDescription.REPACK;

const REPACK_OPTIONS = "Repack options";

const builder = {
	"zip-path": {
		require: true,
		desc: "Path to the zip file you want to repack",
		group: REPACK_OPTIONS
	},
	"app-json": {
		require: true,
		desc: "Path to the custom app.json file",
		group: REPACK_OPTIONS
	},
	output: {
		alias: "o",
		require: true,
		desc: "Path to the output zip",
		group: REPACK_OPTIONS
	}
};

const handler = async argv => {
	const { zipPath, appJson, output } = argv;
	const newAppJson = readJsonFile(appJson);
	await updateAppJson(zipPath, newAppJson, output);
};

module.exports = {
	command,
	desc,
	builder,
	handler
};
