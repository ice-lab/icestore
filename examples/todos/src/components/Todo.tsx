import React from 'react';

export default function({ completed, text, onRemove, onToggle, isLoading }) {
  return (
    <li>
      <label
        onClick={onToggle}
        style={{
          marginRight: 4,
          textDecoration: completed ? 'line-through' : 'none'
        }}
      >
        {text}
      </label>
      <button
        type="button"
        onClick={onRemove}
        disabled={isLoading}
      >
        -
      </button>
    </li>
  );
}
