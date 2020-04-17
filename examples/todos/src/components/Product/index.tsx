import React from 'react';
import { Assign } from 'utility-types';
import { withModel, ExtractIModelAPIsFromModelConfig } from '@ice/store';
import model from './model';

interface MapModelToProp {
  model: ExtractIModelAPIsFromModelConfig<typeof model>;
}

interface CustomProp {
  title: string;
}

type Props = Assign<CustomProp, MapModelToProp>;

function Product({ model, title }: Props) {
  const [product] = model.useValue();
  return (
    <div>
      {title}: {product.title}
    </div>
  );
}

export default withModel(model)<MapModelToProp, Props>(Product);
