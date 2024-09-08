<script lang="ts">
export function defineTableColumns<Column extends TableColumn>(
  columns: MaybeRefOrGetter<Column[]>,
) {
  return computed(() => toValue(columns));
}

const SORT_ICON: Record<string, FunctionalComponent> = {
  asc: BarsArrowUpSvg,
  desc: BarsArrowDownSvg,
  undefined: ArrowUpDownSvg,
};

// if column is equal to key, then toggle direction
// asc -> desc -> undefined -> asc
const NEXT_DIRECTION = {
  asc: 'desc',
  desc: undefined,
  undefined: 'asc',
} as const;

const size = (value: any[] | Set<any> | undefined) => {
  return value
    ? Array.isArray(value)
      ? value.length
      : isSet(value)
      ? value.size
      : 0
    : 0;
};
</script>

<script setup lang="ts">
import { computed, toValue } from 'vue';

import AtomicCheckbox from './AtomicCheckbox.vue';

import type {
  AriaAttributes,
  FunctionalComponent,
  MaybeRefOrGetter,
} from 'vue';

import ArrowUpDownSvg from '~/assets/svg/arrow-up-down.svg?component';
import BarsArrowDownSvg from '~/assets/svg/bars-arrow-down.svg?component';
import BarsArrowUpSvg from '~/assets/svg/bars-arrow-up.svg?component';
import useControlled from '~/composables/useControlled';
import isFunction from '~/utils/isFunction';
import isSet from '~/utils/isSet';
import toUnit from '~/utils/toUnit';

export type TableItem = Record<string, any>;

export interface TableColumn {
  /**
   * 欄位對應到 item 的 key
   */
  key: string;

  /**
   * 是否可以排序
   */
  sortable?: boolean;

  /**
   * 欄位標題
   */
  label?: string;

  /**
   * 欄位寬度
   */
  width?: number | string;

  /**
   * 欄位對齊方式
   */
  align?: 'left' | 'center' | 'right';

  /**
   * 欄位上的 class
   */
  class?: any;

  headCellClass?: any;

  bodyCellClass?:
    | string
    | any[]
    | Record<string, any>
    | ((value: any, index: number, item: TableItem) => any);

  /**
   * 欄位內容的渲染函數
   */
  render?(value: any, index: number, item: TableItem): any;
}

interface AtomicTableProps {
  /**
   * 設定表格欄位
   */
  columns: TableColumn[];

  /**
   * 表格資料
   */
  items?: TableItem[];

  /**
   * 表格資料的鍵值
   */
  itemKey?: string;

  /**
   * 表格標題
   */
  caption?: string;

  /**
   * 表格標題的位置
   *
   * @default 'top'
   */
  captionSide?: 'top' | 'bottom' | 'hidden';

  /**
   * 排序設定
   */
  sort?: {
    column?: string | undefined;
    direction?: 'asc' | 'desc' | undefined;
  };

  /**
   * 選取的資料
   */
  selected?: TableItem[] | Set<TableItem>;

  /**
   * 是否固定表格標題
   */
  stickyHeader?: boolean;

  /**
   * 表格標題的 class
   */
  headRowClass?: any;

  /**
   * 表格內容的 class
   */
  bodyRowClass?:
    | string
    | any[]
    | Record<string, any>
    | ((item: TableItem, index: number) => any);

  /**
   * 表格內容的 class
   */
  bodyCellClass?:
    | string
    | any[]
    | Record<string, any>
    | ((key: string, index: number, value: any, item: TableItem) => any);
}

interface AtomicTableEmits {
  (
    event: 'update:selected',
    value: NonNullable<AtomicTableProps['selected']>
  ): void;
  (event: 'update:sort', value: NonNullable<AtomicTableProps['sort']>): void;
  (event: 'click:row', value: TableItem): void;
}

const props = withDefaults(defineProps<AtomicTableProps>(), {
  columns: () => [],
  items: () => [],
  itemKey: 'id',
  caption: undefined,
  captionSide: 'top',
  sort: undefined,
  selected: undefined,
  headRowClass: undefined,
  bodyRowClass: undefined,
  bodyCellClass: undefined,
});

const emit = defineEmits<AtomicTableEmits>();

const isSortControlled = useControlled(props, 'sort');

const isSelectedControlled = useControlled(props, 'selected');
const isSelectable = computed(() => {
  const { selected } = props;
  return Array.isArray(selected) || isSet(selected);
});

const selectedWritable = computed({
  get() {
    return props.selected;
  },
  set(value) {
    value && emit('update:selected', value);
  },
});

const isIndeterminate = computed(() => {
  const { selected, items } = props;
  const count = size(selected);
  return count > 0 && count < items.length;
});

const isChecked = computed({
  get() {
    return isIndeterminate.value || size(props.selected) === props.items.length;
  },
  set(value) {
    if (!selectedWritable.value) return;

    if (Array.isArray(selectedWritable.value)) {
      selectedWritable.value = value ? props.items.slice() : [];
    } else {
      selectedWritable.value = new Set(value ? props.items : []);
    }
  },
});

const getAriaSort = (column: TableColumn): AriaAttributes['aria-sort'] => {
  if (!column.sortable || !props.sort) return undefined;

  const { column: name, direction } = props.sort;

  if (name !== column.key) return 'none';
  return direction === 'asc'
    ? 'ascending'
    : direction === 'desc'
    ? 'descending'
    : 'none';
};

const onSort = (key: string) => {
  if (!props.sort) return;

  const { column, direction: dir } = props.sort;
  const direction = column === key ? NEXT_DIRECTION[`${dir}`] : 'asc';

  emit('update:sort', {
    column: key,
    direction,
  });
};
</script>

<template>
  <div class="atomic-table">
    <table
      cellpadding="0"
      cellspacing="0"
      class="atomic-table__table"
    >
      <caption
        v-if="caption || $slots.caption"
        class="atomic-table__caption"
        :class="[`atomic-table__caption--${captionSide || 'top'}`]"
      >
        <slot name="caption">
          {{ caption }}
        </slot>
      </caption>
      <colgroup>
        <col
          v-if="isSelectable"
          :style="{ width: '42px' }"
        >
        <col
          v-for="column in columns"
          :key="column.key"
          :style="column.width
            ? {
              width: toUnit(column.width),
            }
            : undefined
          "
        >
      </colgroup>
      <thead
        class="atomic-table__thead"
        :class="{ 'atomic-table__thead--sticky': stickyHeader }"
      >
        <tr
          class="atomic-table__row"
          :class="headRowClass"
        >
          <th
            v-if="isSelectable"
            class="atomic-table__cell atomic-table__checkbox atomic-table__cell--center"
            scope="col"
          >
            <AtomicCheckbox
              v-model="isChecked"
              :disabled="!isSelectedControlled"
              hide-label
              :indeterminate="isIndeterminate"
              label="全選"
            />
          </th>
          <th
            v-for="column in columns"
            :key="column.key"
            :aria-sort="getAriaSort(column)"
            class="atomic-table__cell"
            :class="[
              `atomic-table__cell--${column.align || 'left'}`,
              column.headCellClass,
              column.class,
            ]"
            scope="col"
          >
            <span class="atomic-table__content">
              <span>
                <slot
                  :column="column"
                  :name="`header:${column.key}`"
                >
                  {{ column.label }}
                </slot>
              </span>
              <button
                v-if="isSortControlled && column.sortable"
                :aria-label="`Sort by ${column.label}`"
                type="button"
                @click="onSort(column.key)"
              >
                <component
                  :is="sort!.column === column.key ? SORT_ICON[`${sort?.direction}`] : ArrowUpDownSvg"
                  height="16"
                  width="16"
                />
              </button>
            </span>
          </th>
        </tr>
      </thead>
      <tbody class="atomic-table__body">
        <tr
          v-for="(item, index) in items"
          :key="item[itemKey]"
          class="atomic-table__row"
          :class="isFunction(bodyRowClass) ? bodyRowClass(item, index) : bodyRowClass"
          @click="emit('click:row', item)"
        >
          <td
            v-if="isSelectable"
            class="atomic-table__cell atomic-table__checkbox atomic-table__cell--center"
          >
            <AtomicCheckbox
              v-model="selectedWritable"
              :disabled="!isSelectedControlled"
              hide-label
              :label="`選取第 ${index + 1} 筆資料`"
              :value="item"
            />
          </td>
          <td
            v-for="column in columns"
            :key="column.key"
            class="atomic-table__cell"
            :class="[
              `atomic-table__cell--${column.align || 'left'}`,
              column.class,
              isFunction(column.bodyCellClass) ? column.bodyCellClass(item[column.key], index, item) : column.bodyCellClass,
              isFunction(bodyCellClass) ? bodyCellClass(column.key, index, item[column.key], item) : bodyCellClass,
            ]"
          >
            <slot
              :index="index"
              :item="item"
              :name="`column:${column.key}`"
              :value="item[column.key]"
            >
              {{ isFunction(column.render)
                ? column.render(item[column.key], index, item)
                : item[column.key]
              }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
    <div
      v-if="items.length === 0"
      class="atomic-table__empty"
    >
      <slot name="empty">
        暫無資料
      </slot>
    </div>
  </div>
</template>

<style lang="scss">
.atomic-table {
  &__table {
    min-width: 100%;
  }

  &__caption {
    padding: 8px;

    &--top {
      caption-side: top;
    }

    &--bottom {
      caption-side: bottom;
    }

    &--hidden {
      @include sr-only;
    }
  }

  &__thead {
    font-size: 0.875rem;
    color: #8c8c8c;
    background-color: #f5f5f5;

    &--sticky {
      position: sticky;
      top: 0;
      z-index: 1;
    }
  }

  &__body {
    border-collapse: collapse;
  }

  &__row {
    transition: background-color 300ms ease-in-out;
  }

  &__cell {
    padding: 10px 12px;
    border-bottom: 1px solid #f5f5f5;
    vertical-align: middle;
    word-break: break-all;

    &--left {
      text-align: left;
    }

    &--center {
      text-align: center;
    }

    &--right {
      text-align: right;
    }
  }

  &__thead &__cell {
    font-weight: 400;
  }

  &__thead &__content {
    display: inline-flex;
    align-items: center;
    column-gap: 4px;
  }

  &__checkbox {
    line-height: 0;
  }

  &__empty {
    padding: 12px;
    text-align: center;
    color: #8c8c8c;
    user-select: none;
  }
}
</style>
