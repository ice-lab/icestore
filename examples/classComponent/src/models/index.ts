import { Models } from '@ice/store';
import user from './user';

const rootModels: RootModels = { user };

// add interface to avoid recursive type checking
export interface RootModels extends Models {
  user: typeof user;
}

export default rootModels;
