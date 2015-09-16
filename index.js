// TODO
// - Remove jquery $, add lodash dependency (extend?)
// - Remove .scrolltop dep, callback a method for the caller to deal with it ? We wanna stay pure

 var VIRTUAL_SCROLLING_HELPER = {

        updateStateAfterScrolling: function(state, layout, newScrollTop) {
            // compute the scrollTop delta to know if we are going to do an
            // absolute repositioning (page changed) or a relative (continuous) 
            var scrollDelta = Math.abs(newScrollTop - state.scrollTop);

            // update the current state
            state.scrollTop = newScrollTop;

            // according to the delta, update the state using the absolute or
            // relative update
            var newState = (function() {
                if (scrollDelta > layout.viewportHeight) {
                    return onAbsoluteScroll(state, layout);
                } else {
                    return onRelativeScroll(state, layout);
                }
            })();

            var hasPageChanged = (state.page !== newState.page);
            // if the page changed, we reposition the scrollbar (jump)
            if (hasPageChanged) {
                $(layout.viewport).scrollTop(newState.scrollTop);
            }

            // merge state while keeping its reference (`state = newState` changes the ref)
            $.extend(state, newState);
            state.pageOffset = Math.round(state.page * layout.jumpinessCoefficient);

            return state;

            //
            // Pure functions below
            // 

            function onRelativeScroll(state, layout) {
                var nextScrollTop = state.scrollTop + state.pageOffset;
                var nextPageTop = (state.page + 1) * layout.pageHeight;
                var currentPageTop = state.page * layout.pageHeight;

                var isNextPage = (nextScrollTop > nextPageTop);
                var isPreviousPage = (nextScrollTop < currentPageTop);

                var page = state.page;
                var scrollTop = state.scrollTop;

                // next page
                if (isNextPage) {
                    page++;
                    scrollTop = state.scrollTop - layout.jumpinessCoefficient;
                }
                // prev page
                else if (isPreviousPage) {
                    page--;
                    scrollTop = state.scrollTop + layout.jumpinessCoefficient;
                }

                return {
                    page: page,
                    scrollTop: scrollTop
                };
            }

            // on absolute, we compute which page we land according to the scrolltop
            function onAbsoluteScroll(state, layout) {
                var virtualOverflow = layout.virtualHeight - layout.viewportHeight;
                var scrollableOverflow = layout.scrollableHeight - layout.viewportHeight;
                var overflowRatio = virtualOverflow / scrollableOverflow;
                var newPage = Math.floor(state.scrollTop * overflowRatio / layout.pageHeight);

                return {
                    page: newPage,
                    scrollTop: state.scrollTop
                };
            }
        }
    };
