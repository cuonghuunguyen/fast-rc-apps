const crypto = require("crypto");

const generateRandomString = () => {
	return crypto.randomBytes(20).toString("hex");
};

module.exports = {
	generateRandomString
};
