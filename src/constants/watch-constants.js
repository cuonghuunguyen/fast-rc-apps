/**
 * Represent the deployment states of the watch command
 */
const DEPLOY_STATES = {
	/**
	 * `fast-rc-apps` is deploying the app to the server
	 */
	DEPLOYING: "DEPLOYING",
	/**
	 * `fast-rc-apps is ready for the next deployment
	 */
	IDLE: "IDLE"
};

/**
 * Represents change state of the codebase
 */
const CODEBASE_STATES = {
	/**
	 * There is no changes in the code, no need to re-deploy
	 */
	CLEAN: "CLEAN",
	/**
	 * There is some changes in the code, the app needs to be re-deployed
	 */
	DIRTY: "DIRTY"
};

module.exports = {
	DEPLOY_STATES,
	CODEBASE_STATES
};
