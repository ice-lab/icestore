import { getVersions  } from 'ice-npm-utils';

export default async function checkVersionExit(name: string, version: string, registry?: string): Promise<boolean> {
  const versions = await getVersions(name, registry);
  return versions.indexOf(version) !== -1;
}

// checkVersionExit('@ice/store', '1.4.2', 'https://registry.npmjs.org/')
//   .then((exist) => {
//     console.log(exist);
//     return checkVersionExit('@ice/store', '1.4.3', 'https://registry.npmjs.org/');
//   })
//   .then(console.log);
