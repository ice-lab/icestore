import { JSDOM } from 'jsdom'

interface Global extends NodeJS.Global {
  window: Window,
  document: Document,
  navigator: {
    userAgent: string
  }
}

const globalNode: Global = {
  window: window,
  document: window.document,
  navigator: {
    userAgent: 'node.js',
  },
  ...global
}

// Simulate window for Node.js
if (!globalNode.window && !globalNode.document) {
  const { window } = new JSDOM('<!doctype html><html><body></body></html>', {
    beforeParse(win) {
      win.scrollTo = () => {};
    },
    pretendToBeVisual: false,
    userAgent: 'mocha',
  });
  
  // Configure global variables which like to be used in testing
  globalNode.window = window;
  globalNode.document = window.document;
  globalNode.navigator = window.navigator;
}

import * as enzyme from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
enzyme.configure({ adapter: new Adapter() });