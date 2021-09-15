import { execSync } from 'child_process';
import { join } from 'path';
import * as fse from 'fs-extra';
import * as axios from 'axios';

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

  console.log('start publish', version, npmTag);
  execSync(`npm publish --tag ${npmTag} --ignore-scripts`, {
    cwd: rootDir,
    stdio: 'inherit',
  });

  console.log('start notify');
  const response = await axios.default({
    url: process.env.DING_WEBHOOK,
    method: 'post',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    data: {
      msgtype: 'markdown',
      markdown: {
        title: `@ice/store@${version} 发布成功`,
        text: `@ice/store@${version} 发布成功`,
      },
    },
  });
  console.log('notify success', response.data);

})().catch(err => {
  console.error(err);
  process.exit(1);
});
