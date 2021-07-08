import { getVersions } from 'ice-npm-utils';

export default async function checkVersionExit(name: string, version: string, registry?: string): Promise<boolean> {
  try {
    const versions = await getVersions(name, registry);
    return versions.indexOf(version) !== -1;
  } catch(err) {
    console.error('checkVersionExit error', err);
    return false;
  }
}
