<script lang="ts">
function genAriaLabel(type: string, page: number, selected: boolean) {
  if (type === 'page') return `${selected ? '' : 'Go to '}page ${page}`;
  return `Go to ${type} page`;
}

const ARROW_MAP = {
  next: ArrowSvg,
  previous: ArrowSvg,
  first: DoubleArrowSvg,
  last: DoubleArrowSvg,
};
</script>

<script setup lang="ts">
import ArrowSvg from '~/assets/svg/arrow.svg?component';
import DoubleArrowSvg from '~/assets/svg/double-arrow.svg?component';
import AtomicButton from '~/components/AtomicButton.vue';
import usePagination from '~/composables/usePagination';

interface AtomicPaginationProps {
  /**
   * 當前頁面
   */
  page: number;

  /**
   * 每頁幾筆
   */
  perPage: number;

  /**
   * 總筆數
   */
  total: number;

  /**
   * 開頭和結尾顯示的按鈕數量
   */
  boundaryCount?: number;

  /**
   * 是否禁用
   */
  disabled?: boolean;

  /**
   * 是否隱藏下一頁的按鈕
   */
  hideNextButton?: boolean;

  /**
   * 是否隱藏上一頁的按鈕
   */
  hidePrevButton?: boolean;

  /**
   * 是否顯示第一頁的按鈕
   */
  showFirstButton?: boolean;

  /**
   * 是否顯示最後一頁的按鈕
   */
  showLastButton?: boolean;

  /**
   * 當前頁面前後顯示的按鈕數量
   */
  siblingCount?: number;
}

interface AtomicPaginationEmits {
  (event: 'update:page', value: number): void;
}

const props = withDefaults(defineProps<AtomicPaginationProps>(), {
  perPage: 50,
  boundaryCount: 1,
  siblingCount: 1,
});

const emit = defineEmits<AtomicPaginationEmits>();

const pagination = usePagination(() => {
  return {
    ...props,

    count: Math.ceil(props.total / props.perPage),
    onChange(page) {
      emit('update:page', page);
    },
  };
});
</script>

<template>
  <nav
    aria-label="pagination navigation"
    class="atomic-pagination"
  >
    <ul class="atomic-pagination__container">
      <li
        v-for="(item, index) in pagination"
        :key="index"
      >
        <template v-if="item.type === 'start-ellipsis' || item.type === 'end-ellipsis'">
          <span class="atomic-pagination__button atomic-pagination__button--ellipsis">
            …
          </span>
        </template>
        <template v-else>
          <AtomicButton
            :aria-current="item.ariaCurrent"
            :aria-disabled="item.disabled"
            :aria-label="genAriaLabel(item.type, item.page as number, item.selected)"
            class="atomic-pagination__button"
            :class="{
              'atomic-pagination__button--selected': item.selected,
              [`atomic-pagination__button--${item.type}`]: true,
            }"
            :disabled="item.disabled || undefined"
            shape="square"
            :variant="item.selected ? 'contained' : 'outlined'"
            @click="item.onClick"
          >
            <template v-if="item.type === 'page'">
              {{ item.page }}
            </template>
            <template v-else>
              <component
                :is="ARROW_MAP[item.type as keyof typeof ARROW_MAP]"
                fill="currentColor"
                height="16"
                width="16"
              />
            </template>
          </AtomicButton>
        </template>
      </li>
    </ul>
  </nav>
</template>

<style lang="scss">
.atomic-pagination {
  &__container {
    display: flex;
    column-gap: 6px;
  }

  &__button {
    font-size: 0.75rem;
    user-select: none;

    &--ellipsis {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 36px;
      height: 36px;
    }

    &--previous svg,
    &--first svg {
      transform: rotate(90deg);
    }

    &--next svg,
    &--last svg {
      transform: rotate(-90deg);
    }

    [disabled] {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }
}
</style>
