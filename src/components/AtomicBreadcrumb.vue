<script lang="ts">
export function defineBreadcrumb<T extends BreadcrumbItem>(
  items: () => T[]
): Readonly<Ref<T[]>>;

export function defineBreadcrumb<T extends BreadcrumbItem>(
  items: T[]
): Ref<T[]>;

export function defineBreadcrumb<T extends BreadcrumbItem>(
  items: Ref<T[]>
): Ref<T[]>;

export function defineBreadcrumb<T extends BreadcrumbItem>(
  items: MaybeRefOrGetter<T[]>,
): Ref {
  return toRef(items);
}
</script>

<script setup lang="ts">
import { toRef } from 'vue';

import AtomicLink from './AtomicLink.vue';

import type { Component, MaybeRefOrGetter, Ref } from 'vue';
import type { RouteLocationRaw } from 'vue-router';

import isComponent from '~/utils/isComponent';
import isNullOrUndefined from '~/utils/isNullOrUndefined';

export type BreadcrumbItem = {
  /**
   * route 目標
   */
  to?: RouteLocationRaw;

  /**
   * 顯示文字
   */
  label: string;

  /**
   * icon
   */
  icon?: Component;

  /**
   * 是否只顯示 icon（僅在 icon 存在時有效）
   */
  iconOnly?: boolean;
};

type AtomicBreadcrumbProps = {
  items: BreadcrumbItem[];
  separator?: string | Component;
};

withDefaults(defineProps<AtomicBreadcrumbProps>(), {
  separator: '/',
});
</script>

<template>
  <nav
    aria-label="Breadcrumb"
    class="atomic-breadcrumb"
  >
    <ol class="atomic-breadcrumb__container">
      <li
        v-for="(item, index) in items"
        :key="index"
        class="atomic-breadcrumb__item"
      >
        <component
          :is="isNullOrUndefined(item.to) ? 'span' : AtomicLink"
          class="atomic-breadcrumb__link"
          :to="item.to"
        >
          <slot
            :index="item"
            :item="item"
            name="item"
          >
            <span
              v-if="item.icon"
              lass="atomic-breadcrumb__icon"
            >
              <Component :is="item.icon" />
            </span>
            <span
              class="atomic-breadcrumb__label"
              :class="{ 'atomic-breadcrumb__label--sr-only': item.icon && item.iconOnly }"
            >
              {{ item.label }}
            </span>
          </slot>
        </component>

        <span
          v-if="index < items.length - 1"
          aria-hidden="true"
          class="atomic-breadcrumb__separator"
        >
          <slot name="separator">
            <template v-if="isComponent(separator)">
              <component :is="separator" />
            </template>
            <template v-else>
              {{ separator }}
            </template>
          </slot>
        </span>
      </li>
    </ol>
  </nav>
</template>

<style lang="scss">
@use 'sass:map';

.atomic-breadcrumb {
  &__container,
  &__item {
    display: flex;
    align-items: center;
    column-gap: 6px;
  }

  &__link {
    display: inline-flex;
    align-items: center;
    column-gap: 4px;
  }

  &__link:not([aria-current]) {
    &:hover {
      color: map.get($color-map, 'primary');
    }
  }

  &__label--sr-only {
    @include sr-only;
  }

  &__separator {
    color: gray;
    user-select: none;
  }
}
</style>
