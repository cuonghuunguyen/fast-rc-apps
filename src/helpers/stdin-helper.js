const prompts = require("prompts");
const commands = require("../constants/commands");
const { getAppJson, getRcAppsConfig } = require("./file-helper");

const promptOtp = async method => {
	const { otp } = await prompts({
		type: "text",
		name: "otp",
		message: `Enter TOTP to call ${method || "this method"}`
	});
	return otp;
};

/**
 * Middleware for Yargs interactive mode
 */
const promptHostInfo = async yargs => {
	const {
		_: [command],
		url,
		username,
		password,
		interactive
	} = {
		...getRcAppsConfig(), ...yargs };

	if (![commands.DEPLOY, commands.UNINSTALL].includes(command)) {
		return yargs;
	}

	if (url && username && password) {
		return yargs;
	}

	const lackOfInputError = new Error("You have to provide host, username and password for this command");

	if (interactive) {
		const userInput = await prompts(
			[
				{
					type: !url && "text",
					name: "url",
					message: "Enter the Rocket.Chat host URL",
					instructions: "test",
					validate: value =>
						value.startsWith("http") || "Host URL must not be empty and must include http(s)",
					inactive: url
				},
				{
					type: !username && "text",
					name: "username",
					message: "Enter deployer's username",
					validate: value => Boolean(value) || "Username can't be empty"
				},
				{
					type: !password && "password",
					name: "password",
					message: "Enter deployer's password",
					inactive: password,
					validate: value => Boolean(value) || "Password can't be empty"
				}
			],
			{
				onCancel: () => {
					throw lackOfInputError;
				}
			}
		);
		return {
			...yargs,
			...userInput
		};
	}

	throw lackOfInputError;
};

module.exports = {
	promptOtp,
	promptHostInfo
};
