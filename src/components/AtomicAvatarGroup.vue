<script setup lang="ts">
import { cloneVNode, computed, Fragment, h } from 'vue';

import AtomicAvatar from './AtomicAvatar.vue';

import type { Slot } from 'vue';

import resolveSlotChildren from '~/helpers/resolveSlotChildren';

interface AtomicAvatarGroupProps {
  max?: number;

  /**
   * 大小
   *
   * @default 40
   */
  size?: 'small' | 'medium' | 'large' | `${number}` | number;

  /**
   * 圓角
   *
   * @default 'full'
   */
  rounded?: `${number}` | number | 'full';
}

interface AtomicAvatarGroupSlots {
  default?: () => ReturnType<Slot>;
}

const props = withDefaults(defineProps<AtomicAvatarGroupProps>(), {
  max: 3,
  size: 'medium',
  rounded: 'full',
});

const slots = defineSlots<AtomicAvatarGroupSlots>();

const children = computed(() => resolveSlotChildren(slots.default?.()));

const DefaultVNode = computed(() => {
  const nodes = children.value;
  if (!nodes) return;

  const length = nodes.length;
  const sharedProps = { size: props.size, rounded: props.rounded };

  let max = Number(props.max);
  if (Number.isNaN(max) || max < 1) max = 1;

  const cloned = nodes
    .slice(0, max)
    .map(node => cloneVNode(node, sharedProps))
    .reverse();

  if (length > max) {
    const ellipsis = h(AtomicAvatar, sharedProps, () => `+${length - max}`);
    cloned.unshift(ellipsis);
  }

  return h(Fragment, cloned);
});
</script>

<template>
  <div class="atomic-avatar-group">
    <component :is="DefaultVNode" />
  </div>
</template>

<style lang="scss">
.atomic-avatar-group {
  display: flex;
  flex-direction: row-reverse;
  justify-content: flex-end;
  align-items: center;

  & .atomic-avatar {
    position: relative;
    border: 2px solid white;
  }

  & .atomic-avatar + .atomic-avatar {
    margin-right: -1rem;
  }
}
</style>
