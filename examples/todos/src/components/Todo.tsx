import React from 'react';

export default function({ completed, text, onAsyncRemove, onRemove, onToggle, isLoading }) {
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
      >
        delete
      </button>
      <button
        type="button"
        onClick={onAsyncRemove}
        disabled={isLoading}
      >
        async delete
      </button>
    </li>
  );
}
