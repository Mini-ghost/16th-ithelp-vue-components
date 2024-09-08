import { toValue } from 'vue';
import { computed } from 'vue';

import isNumber from '~/utils/isNumber';
import noop from '~/utils/noop';

import type { MaybeRefOrGetter } from 'vue';

export interface UsePaginationProps {
  /**
   * Number of always visible pages at the beginning and end.
   * @default 1
   */
  boundaryCount?: number;

  /**
   * The total number of pages.
   * @default 1
   */
  count?: number;

  /**
   * If `true`, the component is disabled.
   * @default false
   */
  disabled?: boolean;

  /**
   * If `true`, hide the next-page button.
   * @default false
   */
  hideNextButton?: boolean;

  /**
   * If `true`, hide the previous-page button.
   * @default false
   */
  hidePrevButton?: boolean;

  /**
   * The current page.
   */
  page: number;

  /**
   * If `true`, show the first-page button.
   * @default false
   */
  showFirstButton?: boolean;

  /**
   * If `true`, show the last-page button.
   * @default false
   */
  showLastButton?: boolean;

  /**
   * Number of always visible pages before and after the current page.
   * @default 1
   */
  siblingCount?: number;
  
  onChange?(page: number): void;
}

// https://dev.to/namirsab/comment/2050
const range = (start: number, end: number) => {
  const length = end - start + 1;
  return Array.from({ length }, (_, i) => start + i);
};

export default function usePagination(
  props: MaybeRefOrGetter<UsePaginationProps>,
) {
  return computed(() => {
    const {
      boundaryCount = 1,
      count = 1,
      disabled = false,
      hideNextButton = false,
      hidePrevButton = false,
      page,
      showFirstButton = false,
      showLastButton = false,
      siblingCount = 1,
      onChange = noop,
    } = toValue(props);

    // 從第一頁開始到 boundaryCount
    // 但如果 boundaryCount 大於 count，則取 count
    const startPages = range(1, Math.min(boundaryCount, count));

    // 從最後一頁開始到 count - boundaryCount + 1
    // 但如果 count - boundaryCount + 1 小於 boundaryCount + 1，則取 boundaryCount + 1
    // 什麼時候會發生 count - boundaryCount + 1 小於 boundaryCount + 1 呢？
    // 例如 count = 5, boundaryCount = 3
    const endPages = range(
      Math.max(count - boundaryCount + 1, boundaryCount + 1),
      count,
    );

    const siblingsStart = Math.max(
      Math.min(
        // 普通的開始
        page - siblingCount,
        // 開始頁面的最大值
        count - boundaryCount - siblingCount * 2 - 1,
      ),
      // 開始頁面的最小值
      boundaryCount + 2,
    );

    const siblingsEnd = Math.min(
      Math.max(
        // 普通的結束
        page + siblingCount,
        // 結束頁面的最小值
        boundaryCount + siblingCount * 2 + 2,
      ),
      // 結束頁面的最大值
      // endPages.length > 0 ? endPages[0] - 2 : count - 1
      count - boundaryCount - 1,
    );

    // Basic list of items to render
    // e.g. _items = ['first', 'previous', 1, 'ellipsis', 4, 5, 6, 'ellipsis', 10, 'next', 'last']
    const _items = [
      ...(showFirstButton ? ['first'] : []),
      ...(hidePrevButton ? [] : ['previous']),
      ...startPages,

      // Start ellipsis
      ...(siblingsStart > boundaryCount + 2
        ? ['start-ellipsis']
        : boundaryCount + 1 < count - boundaryCount
        ? [boundaryCount + 1]
        : []),

      // Sibling pages
      ...range(siblingsStart, siblingsEnd),

      // End ellipsis
      ...(siblingsEnd < count - boundaryCount - 1
        ? ['end-ellipsis']
        : count - boundaryCount > boundaryCount
        ? [count - boundaryCount]
        : []),

      ...endPages,
      ...(hideNextButton ? [] : ['next']),
      ...(showLastButton ? ['last'] : []),
    ];

    // Map the button type to its page number
    const buttonPage = (type: string) => {
      switch (type) {
        case 'first':
          return 1;
        case 'previous':
          return page - 1;
        case 'next':
          return page + 1;
        case 'last':
          return count;
        default:
          return null;
      }
    };

    const items = _items.map(item => {
      return isNumber(item)
        ? {
            onClick(): void {
              onChange?.(item);
            },
            type: 'page',
            page: item,
            selected: item === page,
            disabled,
            ariaCurrent: item === page ? 'true' : undefined,
          }
        : {
            onClick(): void {
              const page = buttonPage(item);
              page && onChange?.(page);
            },
            type: item,
            page: buttonPage(item),
            selected: false,
            disabled:
              disabled ||
              (!item.includes('ellipsis') &&
                (item === 'next' || item === 'last'
                  ? page >= count
                  : page <= 1)),
          };
    });

    return items;
  });
}
