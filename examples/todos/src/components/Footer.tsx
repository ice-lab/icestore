
import React from 'react';
import { VisibilityFilters } from '../models/visibilityFilter';
import store from '../store';

const Link = ({ active, children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={active}
    style={{
      marginLeft: '4px',
    }}
  >
    {children}
  </button>
);

export default function Footer() {
  const [state, dispatchers] = store.useModel('visibilityFilter');
  return (
    <div>
      <span>Show: </span>
      {
        Object.keys(VisibilityFilters).map((key) => {
          return (<Link key={key} active={key === state} onClick={() => dispatchers.setState(key)}>
            {key.toLowerCase()}
          </Link>);
        })
      }
    </div>
  );
}
