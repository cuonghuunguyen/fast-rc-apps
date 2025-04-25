#!/usr/bin/env node

const { promptHostInfo } = require("./helpers/stdin-helper");

// eslint-disable-next-line no-unused-vars
const yargs = require("yargs")
	.scriptName("")
	.commandDir("commands")
	.usage("Usage: fast-rc-apps <command> [options]")
	.demandCommand(1, "You have to specify at least 1 command")
	.parserConfiguration({
		"strip-aliased": true,
		"camel-case-expansion": true
	})
	.middleware(promptHostInfo)
	.fail(function (message, error) {
		if (error) {
			console.trace(error);
		} else {
			console.error(message);
		}

		process.exit(1);
	})
	.showHelpOnFail(false)
	.config()
	.strict()
	.help()
	.alias("help", "h").argv;
