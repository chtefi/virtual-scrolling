import { expect } from 'chai';
import { describe, it } from 'mocha';
import virtualScrolling from '../index.js';

describe('the virtual scrolling', () => {
  it('should work', () => {
    const vs = virtualScrolling({
      nbItems: 100,
      rowHeight: 20,
      viewportHeight: 20,
    });

    const newState = vs({ scrollTop: 100 });
    expect(newState.scrollTop).to.be.equal(100);
  });
});

// $(layout.viewport).scrollTop(newState.scrollTop);
