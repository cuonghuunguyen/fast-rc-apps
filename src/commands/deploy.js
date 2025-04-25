const chokidar = require("chokidar");

const { packageGlob } = require("../constants/package-constants");
const { deploy } = require("../helpers/deploy-helper");
const { DEPLOY_STATES, CODEBASE_STATES } = require("../constants/watch-constants");
const { builder: packageBuilder } = require("../commands/package");
const commands = require("../constants/commands");
const commandsDescription = require("../constants/command-description");
const { getAppJson, getRcAppsConfig } = require("../helpers/file-helper");

const command = commands.DEPLOY;
const desc = commandsDescription.DEPLOY;

const REQUIRED_PARAMS = "Required params";
const OPTIONAL_PARAMS = "Optional params";

const builder = {
	url: {
		desc: "Rocket.Chat host to deploy the app to. Must start with http(s)",
		group: REQUIRED_PARAMS
	},
	username: {
		alias: "u",
		desc: "Username of the app manager user",
		group: REQUIRED_PARAMS
	},
	password: {
		alias: "p",
		type: "string",
		desc: "Password of the app manager user",
		group: REQUIRED_PARAMS
	},
	code: {
		alias: "c",
		require: false,
		type: "string",
		desc: "TOTP for two factors authentication",
		group: OPTIONAL_PARAMS
	},
	"zip-path": {
		require: false,
		type: "string",
		desc: "Path to the zip file, which will be deployed to the server",
		group: OPTIONAL_PARAMS
	},
	...packageBuilder,
	watch: {
		alias: "w",
		desc: "Watch files and re-deploy the app everytime the code changed",
		type: "boolean",
		group: OPTIONAL_PARAMS,
		conflicts: ["zip-path", "production"]
	},
	"force-update": {
		alias: "f",
		desc: "Skip update check and force update",
		type: "boolean",
		group: OPTIONAL_PARAMS,
		hidden: true,
		conflicts: ["zip-path"]
	},
	interactive: {
		alias: "i",
		type: "boolean",
		description: "Ask for host info in interactive mode",
		group: OPTIONAL_PARAMS
	}
};

/**
 * Represents the deploy state of this command execution
 * @type {DEPLOY_STATES}
 */
let deployState = DEPLOY_STATES.IDLE;

/**
 * Represents the deploy state of the codebase this command execution
 * @type {CODEBASE_STATES}
 */
let codebaseState = CODEBASE_STATES.CLEAN;

const updateAppWithLock = async argv => {
	switch (deployState) {
		case DEPLOY_STATES.DEPLOYING: {
			console.log("Code changed. Waiting for deployment to be finished...");
			break;
		}
		case DEPLOY_STATES.IDLE: {
			if (codebaseState === CODEBASE_STATES.DIRTY) {
				console.clear();
				console.log("Code changed. Start re-deploying...");

				deployState = DEPLOY_STATES.DEPLOYING;
				codebaseState = CODEBASE_STATES.CLEAN;

				await deploy({ ...argv, forceUpdate: true });

				deployState = DEPLOY_STATES.IDLE;
				return updateAppWithLock(argv);
			} else {
				console.log("Waiting for changes...");
			}
		}
	}
};

const handleCodebaseUpdated = async deployArgv => {
	try {
		codebaseState = CODEBASE_STATES.DIRTY;
		await updateAppWithLock(deployArgv);
	} catch (error) {
		console.error("Deploy failed", error);
		deployState = DEPLOY_STATES.IDLE;
	}
};

const handler = async argv => {
	const { url,
		username,
		password } = getRcAppsConfig();
	const { permissions } = getAppJson()

	const { watch,
		...deployArgv } = argv;

	const deployParams = {
		url,
		username,
		password,
		permissions,
		...deployArgv,
	}
	if (!watch) {
		return deploy(deployParams);
	}

	const rcAppsConfig = getRcAppsConfig();
	const exclude = (rcAppsConfig && rcAppsConfig.ignoreFiles) || [];

	const watcher = chokidar.watch(packageGlob, {
		ignored: [
			...exclude,
			"**/README.md",
			"**/tsconfig.json",
			"**/*.js.map",
			"**/*.d.ts",
			"**/*.spec.ts",
			"**/*.test.ts",
			"**/dist/**",
			"**/.*",
			"packager.tsconfig.json",
		],
		persistent: true,
		ignoreInitial: true
	});
	watcher
		.on("ready", async () => {
			console.log("Start deployment in watch mode...");
			try {
				await deploy(deployParams);
			} catch (error) {
				console.error("Deploy watch failed", error);
			}
			console.log("Waiting for change...");
		})
		.on("change", () => handleCodebaseUpdated(deployParams))
		.on("add", () => handleCodebaseUpdated(deployParams))
		.on("unlink", () => handleCodebaseUpdated(deployParams))
		.on("error", async error => {
			console.error("Error when running deployment in watch mode", error);
			await watcher.close();
		});
};

module.exports = {
	command,
	desc,
	handler,
	builder
};
