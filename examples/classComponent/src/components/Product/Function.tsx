import React from 'react';
import { Assign } from 'utility-types';
import { withModel, ExtractIModelAPIsFromModelConfig } from '@ice/store';
import Product from './Product';
import model from './model';

interface MapModelToProp {
  model: ExtractIModelAPIsFromModelConfig<typeof model>;
}

interface CustomProp {
  title: string;
}

type Props = Assign<CustomProp, MapModelToProp>;

function Component({ model, title }: Props) {
  const [product] = model.useValue();
  return (
    <Product
      title={title}
      productTitle={product.title}
      type="Function"
    />
  );
}

export default withModel(model)<MapModelToProp, Props>(Component);
