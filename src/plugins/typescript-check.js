const { spawnSync } = require("child_process");
const path = require("path");
/**
 * @type import("esbuild").Plugin
 */
const typescriptCheck = {
	name: "TypeScript Check",
	setup({ onStart }) {
		// const packageTsConfigFile = path.resolve("packager.tsconfig.json");
		onStart(() => {
			console.log("Typechecking files...");
			const { status } = spawnSync("npx tsc", ["--noEmit"], {
				cwd: path.resolve(),
				shell: true,
				stdio: "inherit"
			});
			if (status) {
				throw "TypeScript compilation error";
			}
		});
	}
};

module.exports = {
	typescriptCheck
};
