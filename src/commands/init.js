const path = require("path");
const fs = require("fs-extra");
const { spawnSync } = require("child_process");

const prompts = require("prompts");
const slugify = require("slugify");
const pascalCase = require("pascalcase");
const uuid = require("uuid");

const commands = require("../constants/commands");
const commandsDescription = require("../constants/command-description");
const { copyTemplates } = require("../helpers/template-helper");

const command = commands.INIT;
const desc = commandsDescription.INIT;

const initParamPrompt = [
	{
		type: "text",
		name: "appName",
		message: "What is your app's name?",
		validate: appName => Boolean(appName) || "App's name must not be empty"
	},
	{
		type: "text",
		name: "appDesc",
		message: "What is your app's description?",
		validate: appDesc => Boolean(appDesc) || "App's description must not be empty"
	}
];

async function handler() {
	const { appName, appDesc } = await prompts(initParamPrompt);

	const slugName = slugify(appName, { lower: true, strict: true });
	const pascalCaseName = pascalCase(appName);
	const appDir = path.resolve(slugName);
	const appId = uuid.v4();

	copyTemplates("init-files", appDir, { appId, appName, appDesc, pascalCaseName, slugName });

	fs.moveSync(path.resolve(appDir, "App.ts"), path.resolve(appDir, `${pascalCaseName}.ts`));

	spawnSync("npm", ["install"], {
		cwd: appDir,
		stdio: "inherit",
		shell: true
	});
	console.log(`New Rocket.Chat app project has been created successfully under ${appDir}`);
}

module.exports = {
	command,
	desc,
	handler
};
