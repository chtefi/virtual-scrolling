import { describe, it } from 'mocha';
import { expect } from 'chai';

import virtualScrolling from '../index.js';

describe('the virtual scrolling', () => {
  it('should work with scroll lesser than viewport height', () => {
    const vs = virtualScrolling({
      nbItems: 100,
      rowHeight: 20, // 2000 total
      maxScrollableHeight: 1e6, // 1M available
      viewportHeight: 20,
    });

    let state = vs({ scrollTop: 5 });
    expect(state.scrollTop).to.be.equal(5);
    expect(state.page).to.be.equal(0);

    state = vs({ scrollTop: 10 });
    expect(state.scrollTop).to.be.equal(10);
    expect(state.page).to.be.equal(0);

    state = vs({ scrollTop: 0 });
    expect(state.scrollTop).to.be.equal(0);
    expect(state.page).to.be.equal(0);
  });


  it('should work with scroll delta greater than viewport height', () => {
    const vs = virtualScrolling({
      nbItems: 100,
      rowHeight: 20, // 2000 total
      maxScrollableHeight: 1e6, // 1M available
      viewportHeight: 20,
    });

    let state = vs({ scrollTop: 100 });
    expect(state.scrollTop).to.be.equal(100);
    expect(state.page).to.be.equal(0);

    state = vs({ state, scrollTop: 200 });
    expect(state.scrollTop).to.be.equal(200);
    expect(state.page).to.be.equal(0);

    state = vs({ state, scrollTop: 0 });
    expect(state.scrollTop).to.be.equal(0);
    expect(state.page).to.be.equal(0);
  });


  it('should work with huge scroll delta', () => {
    const vs = virtualScrolling({
      nbItems: 1e6,
      rowHeight: 2, // 2M total
      maxScrollableHeight: 1e6, // 1M available only
      viewportHeight: 1000,
    });

    let state = vs({ scrollTop: 500000 }); // half
    expect(state.scrollTop).to.be.equal(500000);
    expect(state.page).to.be.equal(2);
  });
});
