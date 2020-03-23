/**
 * This model only defines state, but not actions
 */
import { useState } from 'react';

export default function useCar() {
  return useState({ logo: 'string' });
};
