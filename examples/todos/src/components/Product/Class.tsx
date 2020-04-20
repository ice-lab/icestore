import React from 'react';
import { Assign } from 'utility-types';
import { withModel, ExtractIModelAPIsFromModelConfig, ExtractIModelFromModelConfig } from '@ice/store';
import Product from './Product';

import model from './model';

interface CustomProp {
  title: string;
}

interface MapModelToComponentProp {
  model: ExtractIModelFromModelConfig<typeof model>;
}

type ComponentProps = Assign<CustomProp, MapModelToComponentProp>;

class Component extends React.Component<ComponentProps>{
  render() {
    const { model, title } = this.props;
    const [ state ] = model;
    return (
      <Product
        title={title}
        productTitle={state.title}
        type="Class"
      />
    );
  }
}

interface MapModelToProp {
  model: ExtractIModelAPIsFromModelConfig<typeof model>;
}

type Props = Assign<CustomProp, MapModelToProp>;

export default withModel(model)<MapModelToProp, Props>(function ({ model, ...otherProps }) {
  const ComponentWithModel = model.withValue()(Component);
  return <ComponentWithModel {...otherProps} />;
});
