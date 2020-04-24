import React from 'react';

export default function({ name, title, type }) {
  return (
    <div>
      <hr/>
      <div>
        Component Type is: {type}
      </div>
      <p>{title}: {name}</p>
    </div>
  );
}
