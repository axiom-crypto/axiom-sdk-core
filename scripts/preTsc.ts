// Functions that are to be run before the typescript compiler runs

const fs = require('fs');
const packageJson = require('../package.json');

// Copies the version number from package.json to src/version.ts
function copyVersion() {
  const version = packageJson.version;
  const versionFile = `// This is an autogenerated file. It should match the version number in package.json.
// Do not modify this file directly.

export const SDK_VERSION = "${version}";`
  fs.writeFileSync('./src/version.ts', versionFile);
}

copyVersion();