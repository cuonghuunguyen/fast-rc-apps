const path = require("path");
const fs = require("fs-extra");
const handleBar = require("handlebars");
const glob = require("glob");

/**
 * Copy template files from the src/templates/`templateType` folder to the target folder, resolve the template files with
 * the provided template data
 * @param {string} templateType The sub-folder of the templates folder which contains the template files
 * @param {string} targetDir The target to copy the templates to
 * @param {object} templateData The data to resolve the template files
 */
const copyTemplates = (templateType, targetDir, templateData) => {
	const templatesPath = path.resolve(__dirname, "..", "templates", templateType);

	fs.ensureDirSync(targetDir);

	glob.sync(`${templatesPath}/**/*.*`, { silent: true, dot: true })
		.map(filePath => path.relative(templatesPath, filePath))
		.forEach(fileName => {
			const targetFileName = fileName.replace(/\.hbs/, "");
			const sourceFilePath = path.resolve(templatesPath, fileName);
			const targetFilePath = path.resolve(targetDir, targetFileName);
			fs.ensureFileSync(targetFilePath);

			if (fileName.endsWith(".hbs")) {
				const templateContent = fs.readFileSync(sourceFilePath, "utf8");
				const template = handleBar.compile(templateContent);
				const targetContent = template(templateData);

				fs.writeFileSync(targetFilePath, targetContent);
			} else {
				fs.copySync(sourceFilePath, targetFilePath);
			}
		});
};

module.exports = {
	copyTemplates
};
