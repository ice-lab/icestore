/**
 * Scripts to check unpublished version and run publish
 */
import { execSync } from 'child_process';
import { join } from 'path';
import * as fse from 'fs-extra';
import checkVersionExist from './checkVersionExist';

// Set by github actions
const branchName = process.env.BRANCH_NAME;
const rootDir = join(__dirname, '../');

if (!branchName) {
  throw new Error('Only support publish in GitHub Actions env');
}

(async () => {
  const pkgData = await fse.readJSON(join(rootDir, 'package.json'));
  const { version, name } = pkgData;
  const npmTag = branchName === 'master' ? 'latest' : 'beta';

  const versionExist = await checkVersionExist(name, version, 'https://registry.npmjs.org/');
  if (versionExist) {
    console.log(`${name}@${version} 已存在，无需发布。`);
    process.exit(0);
  }

  const isProdVersion = /^\d+\.\d+\.\d+$/.test(version);
  if (branchName === 'master' && !isProdVersion) {
    throw new Error(`禁止在 master 分支发布非正式版本 ${version}`);
  }

  if (branchName !== 'master' && isProdVersion) {
    console.log(`非 master 分支 ${branchName}，不发布正式版本 ${version}`);
    process.exit(0);
  }

  console.log('start publish', version, npmTag, process.env.NODE_AUTH_TOKEN);
  execSync(`npm publish --tag ${npmTag} --ignore-scripts`, {
    cwd: rootDir,
    stdio: 'inherit',
  });
})().catch(err => {
  console.error(err);
  process.exit(1);
});
