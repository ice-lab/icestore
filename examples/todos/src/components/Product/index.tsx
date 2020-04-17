import React from 'react';
import { withModel } from '@ice/store';
import model from './model';

function Product({ model }) {
  const product = model.useState();
  return (
    <div>
      Product's title: {product.title}
    </div>
  );
}

export default withModel(model)(Product);
