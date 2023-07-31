import React from 'react';
import { Assign } from 'utility-types';
import { ExtractIModelFromModelConfig } from '@ice/store';
import store from '../../store';
import User from './User';
import userModel from '../../models/user';

const { withModel } = store;

interface PropsWithModel {
  user: ExtractIModelFromModelConfig<typeof userModel>;
}

interface CustomProp {
  title: string;
}

type Props = Assign<CustomProp, PropsWithModel>;

class Component extends React.Component<Props> {
  render() {
    const { title, user } = this.props;
    const [state] = user;
    const { name } = state;
    return User({
      name,
      title,
      type: 'Class',
    });
  }
}

export default withModel('user')<PropsWithModel, Props>(
  Component,
);
