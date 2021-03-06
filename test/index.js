import { expect } from 'chai';

import virtualScrolling, { scale } from '../index.js';

describe('the scale function', () => {
  it('should compute the output of an input value in another range', () => {
    let s = scale({ input: [0, 100], output: [ 0, 1000 ]});
    expect(s(0)).to.be.equal(0);
    expect(s(50)).to.be.equal(500);
    expect(s(100)).to.be.equal(1000);

    s = scale({ input: [100, 200], output: [ 1000, 2000 ]});
    expect(s(100)).to.be.equal(1000);
    expect(s(150)).to.be.equal(1500);
    expect(s(200)).to.be.equal(2000);
    expect(s(0)).to.be.equal(0);

    s = scale({ input: [500, 600], output: [ 0, 1 ]});
    expect(s(500)).to.be.equal(0);
    expect(s(550)).to.be.equal(0.5);
    expect(s(600)).to.be.equal(1);
  });
});

let vs;
let state;
let s;

// ---------------------------------------------------------------------------

describe('the virtual scrolling', () => {
  it('should compute the right number of pages', () => {
    vs = virtualScrolling({
      nbItems: 1,
      rowHeight: 20, // 20 total
      maxScrollableHeight: 2000, // 10 times more
      viewportHeight: 1, // irrevelant here
    });
    expect(vs.layout.nbPages).to.be.equal(1);

    vs = virtualScrolling({
      nbItems: 100,
      rowHeight: 1, // 100 total
      maxScrollableHeight: 1,  // 100 times less
      viewportHeight: 1, // irrevelant here
    });
    expect(vs.layout.nbPages).to.be.equal(100);

    vs = virtualScrolling({
      nbItems: 100,
      rowHeight: 20, // 2000 total
      maxScrollableHeight: 2000, // the exact enough amount
      viewportHeight: 1, // irrevelant here
    });
    expect(vs.layout.nbPages).to.be.equal(1);

    vs = virtualScrolling({
      nbItems: 100,
      rowHeight: 20, // 2000 total
      maxScrollableHeight: 200, // 10 times less
      viewportHeight: 1, // irrevelant here
    });
    expect(vs.layout.nbPages).to.be.equal(10);
  });
});

// ---------------------------------------------------------------------------

describe('the virtual scrolling with absolute scrolling', () => {
  it('should behave correctly with one page', () => {
    vs = virtualScrolling({
      nbItems: 100,
      rowHeight: 20, // 2000 total
      maxScrollableHeight: 10000,
      viewportHeight: 20,
    });

    expect(vs.layout.nbPages).to.be.equal(1);
    s = scale({ input: [ 0, 2000 ], output: [ 0, 1 ] });
    expect(vs.layout.maxPage).to.be.equal(s(2000 - 20));

    state = vs({ scrollTop: 2000 });
    expect(state.scrollTop).to.be.equal(2000);
    expect(state.page).to.be.equal(s(2000 - 20)); // last item visible

    state = vs({ scrollTop: 1000 });
    expect(state.scrollTop).to.be.equal(1000);
    expect(state.page).to.be.equal(s(2000 - 20) / 2); // half of the max
  });

  it('should behave correctly with multiple pages', () => {
    vs = virtualScrolling({
      nbItems: 100,
      rowHeight: 20, // 2000 total
      maxScrollableHeight: 300, // 10 times less
      viewportHeight: 100, // 5 items
    });

    expect(vs.layout.nbPages).to.be.equal(7);
    s = scale({ input: [ 0, 2000 ], output: [ 0, 7 ] });
    expect(vs.layout.maxPage).to.be.equal(s(2000 - 100)); // 5 last items visible

    state = vs({ scrollTop: 0 });
    expect(state.scrollTop).to.be.equal(0);
    expect(state.page).to.be.equal(0);

    state = vs({ scrollTop: 200 });
    expect(state.scrollTop).to.be.equal(200);
    expect(state.page).to.be.equal(s(2000 - 100) * 2 / 3); // 2/3 of the max
    // we don't use 100 because the viewport is already 100
    // so it would be a relative scroll instead

    state = vs({ scrollTop: 300 }); // max
    expect(state.scrollTop).to.be.equal(300);
    expect(state.page).to.be.equal(s(2000 - 100)); // last item visible
  });
});

// ---------------------------------------------------------------------------

describe('the virtual scrolling with relative scrolling', () => {
  it('should behave correctly going forwards with one page', () => {
    vs = virtualScrolling({
      nbItems: 100,
      rowHeight: 20, // 2000 total
      maxScrollableHeight: 10000,
      viewportHeight: 100,
    });

    state = vs({ scrollTop: 0 }); // min
    const scrollableToPage = scale({
      input: [ 0, 2000 ],
      output: [ 0, vs.layout.maxPage ],
    });

    // scroll from the beginning to the end with a step of 10 (relative)
    for (let i = 0; i < 2000; i += 10) {
      state = vs({ previousState: state, scrollTop: i });
      expect(state.scrollTop).to.be.equal(i);
      expect(state.page).to.be.equal(scrollableToPage(i));
    }
  });

  it('should behave correctly going backwards with one page', () => {
    vs = virtualScrolling({
      nbItems: 100,
      rowHeight: 20, // 2000 total
      maxScrollableHeight: 10000,
      viewportHeight: 100,
    });

    state = vs({ scrollTop: 2000 }); // max
    const scrollableToPage = scale({
      input: [ 0, 2000 ],
      output: [ 0, vs.layout.maxPage ],
    });

    // scroll from the beginning to the end with a step of 10 (relative)
    for (let i = 2000; i >= 0; i -= 10) {
      state = vs({ previousState: state, scrollTop: i });
      expect(state.scrollTop).to.be.equal(i);
      expect(state.page).to.be.equal(scrollableToPage(i));
    }
  });

  it.skip('should behave correctly going forwards with multiple pages', () => {
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

  it.skip('should behave correctly going backwards with multiple pages', () => {
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
});


