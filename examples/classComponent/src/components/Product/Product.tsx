import React from 'react';

export default function ({ productTitle, title, type }) {
  return (
    <div>
      <hr/>
      <div>
        Component Type is: {type}
      </div>
      <p>{title}: {productTitle}</p>
    </div>
  );
}
