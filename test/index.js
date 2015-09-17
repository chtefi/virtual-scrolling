import { describe, it } from 'mocha';
import { expect } from 'chai';

import virtualScrolling from '../index.js';

describe('the virtual scrolling', () => {
  let vs;
  let state;

  it('should compute the right number of pages', () => {
    vs = virtualScrolling({
      nbItems: 1,
      rowHeight: 20, // 2000 total
      maxScrollableHeight: 2000,
      viewportHeight: 100, // irrevelant here
    });
    expect(vs.layout.nbPages).to.be.equal(1);

    vs = virtualScrolling({
      nbItems: 100,
      rowHeight: 20, // 2000 total
      maxScrollableHeight: 2000,
      viewportHeight: 100, // irrevelant here
    });
    expect(vs.layout.nbPages).to.be.equal(1);

    vs = virtualScrolling({
      nbItems: 100,
      rowHeight: 20, // 2000 total
      maxScrollableHeight: 200,
      viewportHeight: 100, // irrevelant here
    });
    expect(vs.layout.nbPages).to.be.equal(10);
  });

  it('should work with tiny relative scrolling with one page', () => {
    vs = virtualScrolling({
      nbItems: 100,
      rowHeight: 20, // 2000 total
      maxScrollableHeight: 10000,
      viewportHeight: 20,
    });

    for (let i = 0; i < 2000; i += 10) {
      state = vs({ previousState: state, scrollTop: i });
      expect(state.scrollTop).to.be.equal(i);
      expect(state.page).to.be.equal(0);
    }
  });

  it('should work with tiny relative scrolling with multiple pages', () => {
    vs = virtualScrolling({
      nbItems: 100,
      rowHeight: 20, // 2000 total
      maxScrollableHeight: 1000,
      viewportHeight: 20,
    });

    for (let i = 0; i < 1000; i += 10) {
      state = vs({ previousState: state, scrollTop: i });
      expect(state.scrollTop).to.be.equal(i);
      expect(state.page).to.be.equal(Math.floor(i / 500));
    }
  });

  it.skip('should work with scroll delta greater than viewport height', () => {
    vs = virtualScrolling({
      nbItems: 100,
      rowHeight: 20, // 2000 total
      maxScrollableHeight: 1e6, // 1M available
      viewportHeight: 20,
    });

    state = vs({ scrollTop: 100 });
    expect(state.scrollTop).to.be.equal(100);
    expect(state.page).to.be.equal(0);

    state = vs({ state, scrollTop: 200 });
    expect(state.scrollTop).to.be.equal(200);
    expect(state.page).to.be.equal(0);

    state = vs({ state, scrollTop: 0 });
    expect(state.scrollTop).to.be.equal(0);
    expect(state.page).to.be.equal(0);
  });


  it.skip('should work with huge scroll delta', () => {
    vs = virtualScrolling({
      nbItems: 1e6,
      rowHeight: 2, // 2M total
      maxScrollableHeight: 1e6, // 1M available only
      viewportHeight: 1000,
    });

    state = vs({ scrollTop: 500000 }); // half
    expect(state.scrollTop).to.be.equal(500000);
    expect(state.page).to.be.equal(2);
  });

});
