import { execSync } from "node:child_process";

export function checkAndInstallPackage(
	packageName: string,
	devDependency = false,
) {
	try {
		// Check if the package is installed
		execSync(`npm list ${packageName} --depth=0 --json`, { stdio: "pipe" });
		// console.log(`${packageName} is already installed.`);
	} catch (error) {
		// If the package is not found, install it
		console.log(`${packageName} is not installed. Installing...`);
		const installCommand = `npm install ${devDependency ? "-D" : ""} ${packageName}`;
		try {
			execSync(installCommand, { stdio: "inherit" });
			console.log(`${packageName} has been installed successfully.`);
		} catch (installError) {
			if (installError instanceof Error) {
				console.error(
					`Failed to install ${packageName}:`,
					installError.message,
				);
			}
		}
	}
}
