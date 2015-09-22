import { getMaxSupportedCssHeight } from './utils.js';

export function scale({ input, output }) {
  const inputDelta = input[1] - input[0];
  const outputDelta = output[1] - output[0];
  return (value) => ((value - input[0]) / inputDelta) * outputDelta + output[0];
}

/**
 * When an relative scroll occurs, we compute which page we land according to
 * the new scrolltop value, or if the page does not change.
 *
 * @param  {object} previousState
 * @param  {number} newScrollTop
 * @param  {object} layout
 * @return {object}
 */
function onRelativeScroll(previousState, newScrollTop, layout) {
  const nextScrollTop = newScrollTop + previousState.pageOffset;
  const nextPageTop = (previousState.page + 1) * layout.pageHeight;
  const currentPageTop = previousState.page * layout.pageHeight;

  const isNextPage = (nextScrollTop >= nextPageTop);
  const isPreviousPage = (nextScrollTop < currentPageTop);

  const scrollableToPage = scale({
    input: [ 0, layout.scrollableHeight ],
    output: [ 0, layout.maxPage ],
  });

  if (isNextPage) {
    return {
      newPage: previousState.page + 1,
      newScrollTop: newScrollTop,
    };
  }

  if (isPreviousPage) {
    return {
      newPage: previousState.page - 1,
      newScrollTop: newScrollTop + layout.onePageOffset,
    };
  }

  // same page, no change
  return {
    newPage: scrollableToPage(newScrollTop),
    newScrollTop: newScrollTop,
  };
}

/**
 * When an absolute scroll occurs, we compute which page we land according to
 * the new scrolltop value.
 *
 * @param  {object} previousState
 * @param  {number} newScrollTop
 * @param  {object} layout
 * @return {object}
 */
function onAbsoluteScroll(previousState, newScrollTop, layout) {
  const scrollableToPage = scale({
    input: [ 0, layout.scrollableHeight ],
    output: [ 0, layout.maxPage ],
  });

  const newPage = scrollableToPage(newScrollTop);

  // there are 10 pages ?
  // the maxPage is something like 9.90 ? (the maxPage is the _start_ page value
  // you can have when you go at 100% of the scrollbar)
  //
  // therefore, we are at the page: 9.90*0.34 = 3,366
  // const newPage = layout.maxPage * newScrollTopRatio;

  return {
    newPage,
    newScrollTop,
  };
}

function getLayout({ nbItems, rowHeight, viewportHeight, maxScrollableHeight = getMaxSupportedCssHeight() }) {
  const totalItemsHeight = nbItems * rowHeight;
  const scrollableHeight = Math.min(maxScrollableHeight, totalItemsHeight);

  // nbPages will always be >= 1 (Math.ceil(0.0001) === 1)
  const nbPages = Math.ceil(totalItemsHeight / scrollableHeight);
  const pageHeight = scrollableHeight / nbPages;

  // One page examples

  // total: 1000 / viewport: 500 / scrollableMax: 10000 / = 1 page
  // 100% in scroll means going to the page...
  // 100% - viewport / total
  // 1 - 500 / 1000 = 0.50
  // maxPage = 0.50

  // total: 1000 / viewport: 100 / scrollableMax: 10000 / = 1 page
  // 100% in scroll means going to the page...
  // 100% - viewport / total
  // 1 - 100 / 1000 = 0.90
  // maxPage = 0.90

  // Multiple page examples

  // total: 1000 / viewport: 100 / scrollableMax: 100 / = 10 pages
  // 100% in scroll means going to the page...
  // 100% - viewport / total
  // 10 * (1 - 100 / 1000) = 9.00

  // therefore...
  // maxPage = nbPages * (1 - viewportHeight / totalHeight)

  // const virtualOverflow = totalItemsHeight - viewportHeight;
  // const scrollableOverflow = scrollableHeight - viewportHeight;
  // const overflowRatio = virtualOverflow / scrollableOverflow;
  const maxPage = nbPages * (1 - viewportHeight / totalItemsHeight);

  // TODO(sd): need ?
  const onePageOffset = (totalItemsHeight - scrollableHeight) / (nbPages - 1);

  //const totalItemsScale = scale({ input: [ 0, scrollableHeight ], output: [ 0, totalItemsHeight ] });
  //const absolutePageScale = scale({ input: [ 0, viewportHeight ], output: [ 0, nbPages ] });
  //console.log(maxPage, absolutePageScale())

  return {
    viewportHeight,
    rowHeight,
    pageHeight,
    nbItems,
    totalItemsHeight,
    scrollableHeight,
    onePageOffset,
    nbPages,
    maxPage,
  };
}

export default function virtualScrolling({ nbItems, rowHeight, viewportHeight, maxScrollableHeight }) {
  // compute the layout once
  const layout = getLayout({ nbItems, rowHeight, viewportHeight, maxScrollableHeight });
  const INITIAL_STATE = {
    page: 0,
    pageOffset: 0,
    scrollTop: 0,
  };

  const fn = ({ previousState = INITIAL_STATE, scrollTop }) => {
    // limit the scrollTop value
    scrollTop = Math.min(Math.max(scrollTop, 0), layout.scrollableHeight); // eslint-disable-line no-param-reassign

    // compute the scrollTop delta to know if we are going to do an
    // absolute repositioning (page changed) or a relative (continuous)
    const scrollDelta = Math.abs(scrollTop - previousState.scrollTop);

    // according to the delta, update the state using the absolute or
    // relative update
    const { newPage, newScrollTop } = (scrollDelta > layout.viewportHeight)
            ? onAbsoluteScroll(previousState, scrollTop, layout)
            : onRelativeScroll(previousState, scrollTop, layout);

    // return the updated state
    return {
      page: newPage,
      scrollTop: newScrollTop,
      pageOffset: Math.round(newPage * layout.onePageOffset),
    };
  };

  fn.layout = layout;

  return fn;
}

