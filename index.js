import { getMaxSupportedCssHeight } from './utils.js';

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

  console.log(newScrollTop, nextScrollTop, nextPageTop, currentPageTop);

  const isNextPage = (nextScrollTop >= nextPageTop);
  const isPreviousPage = (nextScrollTop < currentPageTop);

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
    newPage: previousState.page,
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
  const virtualOverflow = layout.totalItemsHeight - layout.viewportHeight;
  const scrollableOverflow = layout.scrollableHeight - layout.viewportHeight;
  const overflowRatio = virtualOverflow / scrollableOverflow;
  const newPage = Math.floor(newScrollTop * overflowRatio / layout.pageHeight);

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

  // TODO(sd): need ?
  const onePageOffset = (totalItemsHeight - scrollableHeight) / (nbPages - 1);

  return {
    viewportHeight,
    rowHeight,
    pageHeight,
    totalItemsHeight,
    scrollableHeight,
    onePageOffset,
    nbPages,
    nbItems,
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

