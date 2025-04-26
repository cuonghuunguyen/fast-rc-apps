const fs = require("fs-extra");
const path = require("path");
const { build } = require("esbuild");
const { cleanUpDist } = require("../plugins/clean-up-dist");

const { getAppJson, getTSConfigJson, getRcAppsConfig } = require("../helpers/file-helper");


const commands = require("../constants/commands");
const commandsDescription = require("../constants/command-description");
const { packageApp } = require("../plugins/packageApp");
const { typescriptCheck } = require("../plugins/typescript-check");

const PACKAGE_OPTIONS = "Package options";

const builder = {
	"skip-type-check": {
		desc: "Skip TypeScript check",
		type: "boolean",
		group: PACKAGE_OPTIONS
	},
	production: {
		alias: "prod",
		desc: "Package production handlers only",
		type: "boolean",
		group: PACKAGE_OPTIONS
	}
};

const command = commands.PACKAGE;
const desc = commandsDescription.PACKAGE;

const handler = async ({ production, skipTypeCheck }) => {
	const distFolderPath = path.resolve("dist");
	const tsConfig = getTSConfigJson();
	const { classFile } = getAppJson();
	const {  ignoredFiles = [] } = getRcAppsConfig()
	const classFilePath = path.resolve(classFile);
	let packageTsConfigFile;
	try {
		// region Update package options into custom tsconfig.json
		const customTsConfig = {
			exclude: [...(ignoredFiles || []), ...(tsConfig.exclude || [])],
			compilerOptions: {
				...tsConfig.compilerOptions,
				isolatedModules: true
			}
		};
		const packageTsConfig = {
			...tsConfig,
			...customTsConfig
		};
		packageTsConfigFile = path.resolve("packager.tsconfig.json");
		fs.writeJsonSync(packageTsConfigFile, packageTsConfig);

		const result = await build({
			entryPoints: [classFilePath],
			bundle: true,
			write: false,
			outdir: distFolderPath,
			minify: production,
			tsconfig: packageTsConfigFile,
			target: ["node12"],
			platform: "node",
			external: ["@rocket.chat/apps-engine"],
			plugins: [...(skipTypeCheck ? [] : [typescriptCheck]), packageApp]
		});

		if (result.errors.length) {
			console.error("Packaging error", result.errors);
		}
	} finally {
		// region Clean up temporary files
		console.debug("Cleaning temp files...");
		if (fs.existsSync(packageTsConfigFile)) {
			fs.removeSync(packageTsConfigFile);
		}
		// endregion
	}
};

module.exports = {
	command,
	desc,
	handler,
	builder
};
