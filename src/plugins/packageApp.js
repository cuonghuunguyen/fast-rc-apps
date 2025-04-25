const { defaultAssetFiles } = require("../constants/package-constants");
const glob = require("glob");
const fs = require("fs-extra");
const Zip = require("adm-zip");
const path = require("path");
const { writeZipAsync } = require("../helpers/zip-helper");
const { getAppJson } = require("../helpers/file-helper");

/**
 * @type import("esbuild").Plugin
 */
const packageApp = {
	name: "Package All File",
	setup({ onEnd }) {
		const distFolderPath = path.resolve("dist");
		const { nameSlug, version } = getAppJson();
		const copiedAssets = [...defaultAssetFiles];
		const outputZipPath = path.join(distFolderPath, `${nameSlug}_${version}.zip`);
		const packageMessage = `App packaged up at: ${outputZipPath}`;

		const assetFilesToCopied = copiedAssets
			.reduce((acc, cur) => {
				return [
					...acc,
					...glob.sync(cur, {
						follow: true
					})
				];
			}, [])
			.map(asset => ({
				path: asset,
				isFolder: fs.lstatSync(asset).isDirectory()
			}));

		onEnd(async ({ outputFiles }) => {
			console.log("Compressing files into zip...");

			const zip = new Zip();
			for (const { path: originOutputPath, contents } of outputFiles) {
				const zipPath = path.relative(distFolderPath, originOutputPath);
				/**
				 * `esbuild` automatically generates the line `0&&(module.exports={});` under every bundle so we have to
				 * remove it and change to `exports.default;` to help `Apps Engine` recognize the Base Class
				 * @see https://github.com/evanw/esbuild/releases/tag/v0.9.1
				 */
				const fileText = Buffer.from(contents, "utf8")
					.toString()
					.replace(/0\s?&&\s?\(module\.exports\s?=\s?\{}\);$/gm, "exports.default;");
				zip.addFile(zipPath, Buffer.from(fileText, "utf8"));
			}

			// region Copy asset files
			console.log("Copying asset files...");
			assetFilesToCopied.forEach(asset => {
				if (asset.isFolder) {
					return zip.addLocalFolder(asset.path, asset.path);
				}
				zip.addLocalFile(asset.path);
			});

			// endregion

			const compressError = await writeZipAsync(zip, outputZipPath);
			if (compressError) {
				throw compressError;
			}
			console.log(packageMessage);
		});
	}
};

module.exports = {
	packageApp
};
