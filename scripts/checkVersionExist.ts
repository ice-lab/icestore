import { getVersions } from 'ice-npm-utils';

export default async function checkVersionExit(name: string, version: string, registry?: string): Promise<boolean> {
  const versions = await getVersions(name, registry);
  return versions.indexOf(version) !== -1;
}
