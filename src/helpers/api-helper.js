const axios = require("axios");
const FormData = require("form-data");
const { TwoFactorAuthErrors, TwoFactorAuthMethods } = require("../constants/two-factor-authentication");
const { promptOtp } = require("./stdin-helper");

let auth = {
	"X-User-Id": "",
	"X-Auth-Token": "",
	host: "http://localhost:3000"
};

const getRequired2faMethod = error => {
	if (
		error &&
		error.response &&
		error.response.data &&
		error.response.data.error === TwoFactorAuthErrors.TOTP_REQUIRED
	) {
		return error.response.data.details && error.response.data.details.method;
	}
};

const login = async (host = auth.host, username, password, code) => {
	if (auth["X-User-Id"] && auth["X-Auth-Token"]) {
		console.debug("Skip login, using obtained token");
		return;
	}

	try {
		auth.host = host;

		const {
			data: { userId, authToken }
		} = await post(
			`/api/v1/login`,
			{
				username,
				password
			},
			{
				headers: code
					? {
							"x-2fa-code": code,
							"x-2fa-method": TwoFactorAuthMethods.TOTP
					  }
					: {}
			}
		);

		if (!userId || !authToken) {
			throw new Error("Cannot get auth token or user id");
		}

		auth = {
			...auth,
			"X-User-Id": userId,
			"X-Auth-Token": authToken
		};
	} catch (error) {
		if (getRequired2faMethod(error) === TwoFactorAuthMethods.TOTP && !code) {
			const otp = await promptOtp("login");
			if (otp) {
				return login(host, username, password, otp);
			}
		}
		throw new Error(`Login failed ${error.response}`);
	}
};

const request = async (url, method, data, config) => {
	const { params, headers, ...rest } = config || {};
	const { host, ...credentials } = auth;
	const { data: responseData } = await axios.request({
		url: `${host}${url}`,
		method,
		headers: {
			...credentials,
			...(headers || {})
		},
		params,
		data,
		...rest
	});
	return responseData;
};

const del = (url, data, config) => {
	return request(url, "delete", data, config);
};

const post = (url, data, config) => {
	return request(url, "post", data, config);
};

const get = (url, params, config) => {
	return request(url, "get", undefined, { params, ...(config || {}) });
};

const isExistingApp = async appId => {
	try {
		await get(`/api/apps/${appId}/status`);
		return true;
	} catch (error) {
		return false;
	}
};

const deployApp = async (appData, permissions, appId) => {
	const formData = new FormData();
	formData.append("app", appData);
	formData.append("permissions", JSON.stringify(permissions));
	try {
		const { compilerErrors } = await post(`/api/apps/${appId || ""}`, formData, { headers: formData.getHeaders() });
		if (compilerErrors && compilerErrors.length) {
			console.log("Compilation error:");
			console.log(JSON.stringify(compilerErrors, null, 2));
			throw new Error("Compilation error");
		}
	} catch (error) {
		const errorMessage = (error.response && error.response.data) || error.message;
		throw new Error(`Deployment error: ${JSON.stringify(errorMessage)}`);
	}
};

const removeApp = async appId => {
	if (appId) {
		try {
			await del(`/api/apps/${appId}`);
			console.log("App uninstalled successfully");
		} catch (error) {
			const errorMessage = (error.response && error.response.data) || error.message;
			console.error("Error uninstalling app from the Rocket.Chat server", errorMessage);
		}
	}
};

module.exports = {
	login,
	post,
	get,
	isExistingApp,
	deployApp,
	removeApp
};
