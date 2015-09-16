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

  const isNextPage = (nextScrollTop > nextPageTop);
  const isPreviousPage = (nextScrollTop < currentPageTop);

  if (isNextPage) {
    return {
      newPage: previousState.page + 1,
      newScrollTop: newScrollTop - layout.jumpinessCoeff,
    };
  }

  if (isPreviousPage) {
    return {
      newPage: previousState.page - 1,
      newScrollTop: newScrollTop + layout.jumpinessCoeff,
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
  const virtualOverflow = layout.virtualHeight - layout.viewportHeight;
  const scrollableOverflow = layout.scrollableHeight - layout.viewportHeight;
  const overflowRatio = virtualOverflow / scrollableOverflow;
  const newPage = Math.floor(newScrollTop * overflowRatio / layout.pageHeight);

  return {
    newPage,
    newScrollTop,
  };
}

function getLayout({ nbItems, rowHeight, viewportHeight, maxScrollableHeight }) {
  const virtualHeight = nbItems * rowHeight;
  if (!maxScrollableHeight) {
    maxScrollableHeight = getMaxSupportedCssHeight(); // eslint-disable-line no-param-reassign
  }
  const scrollableHeight = Math.min(maxScrollableHeight, virtualHeight);
  // TODO(sd): coefficient to optimize, compute it?
  const MAGIC_NUMBER = 100;
  const pageHeight = scrollableHeight / MAGIC_NUMBER;

  // nbPages will always be >= 1 (Math.ceil(0.0001) === 1)
  const nbPages = Math.ceil(virtualHeight / pageHeight);
  const jumpinessCoeff = (virtualHeight - scrollableHeight) / (nbPages - 1);

  return {
    viewportHeight: viewportHeight,
    rowHeight: rowHeight,
    virtualHeight: virtualHeight,
    scrollableHeight: scrollableHeight,
    jumpinessCoeff: jumpinessCoeff,
    pageHeight: pageHeight,
    nbPages: nbPages,
    nbItems: nbItems,
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

  return ({ previousState = INITIAL_STATE, scrollTop }) => {
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
      pageOffset: Math.round(newPage * layout.jumpinessCoeff),
    };
  };
}

// the caller should care of the result:
// const hasPageChanged = (previousState.page !== newPage);
  // // if the page changed, we reposition the scrollbar (jump)
  // if (hasPageChanged) {
  //   $(layout.viewport).scrollTop(newState.scrollTop);
  // }
