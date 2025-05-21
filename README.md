# fast-rc-apps
The Rocket.Chat Apps CLI is a command-line interface tool that you use to initialize, develop, scaffold, and maintain Rocket.Chat Apps app directly from a command shell.

## Prerequisite
This package requires node.js version > 12.18.4 to work normally 

## Install
Install as a dev dependency in your project
```shell script
npm install --save-dev fast-rc-apps
```
Install globally
```shell script
npm install -g fast-rc-apps
```

## Usage

```shell script
fast-rc-apps <command> [options]
```
**You can also use `--config` to pass the path of a JSON config file for options**


## Commands and Options

To know more about parameters and usage, run:

```shell script
fast-rc-apps -h
```

### init
```shell script
fast-rc-apps init
```
This command initializes a new Rocket.Chat Apps project. After running it, you have to provide your app's name and description.
After that, the `fast-rc-apps` will create a folder with all the necessary files for a new Rocket.Chat Apps project.

### package
```shell script
fast-rc-apps package
```
Package the app project to a distributable zip file.

You can add `--production` or `--prod` flag to minify the source files:
```shell script
fast-rc-apps package --production
```

Normally, `fast-rc-apps` will perform type-check before bundling the app which will take very long time.
If you only want to deploy the existing app or if you have another type-checker (e.g. Intellij) you can pass
the option `--skip-type-check` to package the app with super speed.

Package flow:
* Create a custom TypeScript config file named `packager.tsconfig.json` which inherit from the project's current 
  `tsconfig.json` file
* Perform type-checking if `--skip-type-check` is not passed
* Compile and bundle app's source code into a single JavaScript file
* Zip the compiled code and assets into a zip file which name `<npm package name>_v<npm version>.zip`
* Remove temporary files

### Repack
```shell
fast-rc-apps repack --zip-path='./dist/app_5.1.0.zip' --app-json="./customApp.json" --output="./repacked/app_5.1.0.zip"
```

Create a new zip file with different `app.json` information. The data of the old and new `app.json` file will be **merged** to avoid lack of
important properties.

### deploy
Deploy the current app project:
```shell script
fast-rc-apps deploy --url=<Rocket.Chat host> --username=<username> --password=<password>
```
Deploy a zip file: 
```shell script
fast-rc-apps deploy --url=<Rocket.Chat host> --username=<username> --password=<password> --zip-path=<path-to-zip-file>
```

Deploy the Rocket.Chat Apps App to the Rocket.Chat server. If it has been deployed the Rocket.Chat server before, update it.

If the param `--zip-path` is provided, the `fast-rc-apps` will deploy the zip file at that path to the server. Otherwise, it will
package the app project at the current path and deploy it

As same as the `package` command, you can also add `--production` or `--prod` flag to deploy the minified version:
```shell script
fast-rc-apps deploy --url=<Rocket.Chat host> --username=<username> --password=<password> --production
``` 

To watch the codebase and re-deploy the app to the server every time the code changed, pass the `--watch` option.

```shell script
fast-rc-apps deploy --config=./deploy-config.json --watch
```

This option is very useful when developing because it reduces the times you type the command.

> The `--production` and `--watch` flag will cause conflict when being used with `--zip-path` flag. It makes no sense when using a development
> flag with an already packaged zip file. 
> At the moment, we don't allow using `--production` flag along with `--watch` flag, the reason is it will decrease the performance and it will not
> bring too much value if we allow using a **production** flag with a **development** flag at once.

### uninstall
Sometimes you want to remove your app from a Rocket.Chat server for some purposes like removing test app, deploying from a clean state, etc.
You can use the `uninstall` command to remove the app from a provided app id, app zip file or your current app folder.

To remove the app from the current app folder, firstly go to your app folder's root and then run:
```shell
fast-rc-apps uninstall --url=<Rocket.Chat host> --username=<username> --password=<password>
```

Removing app from a provided app id:
```shell
fast-rc-apps uninstall --url=<Rocket.Chat host> --username=<username> --password=<password> --id=<your app id>
```

Removing app from an app zip file:
```shell
fast-rc-apps uninstall --url=<Rocket.Chat host> --username=<username> --password=<password> --zip-path=<path to your zip file>
```
## Two factors authentication
app CLI supports deploying your app with 2FA via TOTP.

If deployer account requires 2FA to login, there will be a prompt appears to ask for your TOTP, you have to enter the TOTP you get
from your authentication app to deploy the app.

If you want to deploy the app with 2FA silently (without the prompt), you can pass the TOTP to the command line by the param `--code` or `-c`:
```shell
fast-rc-apps deploy --config=./deploy-config.json --code=<your TOTP>
```

## Config file

You can use a JSON config file to provide params. To do so, use `--config` option with the path to your JSON config file.

Example:
```shell script
fast-rc-apps deploy --config=./deploy-config.json
```  

File config must contain a single object with keys and values are the option names and option values.

Sample `deploy-config.json`:
```json
{
	"username": "username",
	"password": "password",
	"url": "http://localhost:3000"
}
```

## Interactive mode
For the `deploy` and `uninstall` command, you must provide the host information like Rocket.Chat server URL, username and password of the deployer. 
You may want to enter these information in the interactive mode to avoid bash syntax error with special characters or you want to hide your password when 
typing.

To use the interactive mode, add `--interactive`/`-i` flag.

```shell
fast-rc-apps deploy --interactive
```

Interactively enter password only:
```shell
fast-rc-apps deploy --url=<host> --username=<deployer's username> --interactive
```
