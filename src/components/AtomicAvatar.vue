<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

import type { ImgHTMLAttributes } from 'vue';

import isNumberish from '~/utils/isNumberish';
import toUnit from '~/utils/toUnit';

interface AtomicAvatarProps {
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

  /**
   * The `src` attribute for the `img` element.
   */
  src?: string;

  /**
   * The `alt` attribute for the `img` element.
   */
  alt?: string;

  /**
   * The `loading` attribute for the `img` element.
   */
  loading?: ImgHTMLAttributes['loading'];
}

const props = withDefaults(defineProps<AtomicAvatarProps>(), {
  size: 'medium',
  rounded: 'full',
  src: undefined,
  alt: undefined,
  loading: 'lazy',
});

const isMounted = ref(false);

const error = ref(false);

const isFallback = computed(() => {
  if (isMounted.value) return error.value;
  return false;
});

const style = computed(() => {
  return {
    ...(isNumberish(props.size)
      ? {
          '--avatar-size': `${props.size}px`,
        }
      : null),
    '--avatar-rounded':
      props.rounded !== 'full' ? toUnit(props.rounded) : '9999px',
  };
});

const classes = computed(() => {
  const classes: string[] = [];

  if (!isNumberish(props.size)) {
    classes.push(`atomic-avatar--${props.size}`);
  }

  return classes;
});

onMounted(() => (isMounted.value = true));

if (typeof window !== 'undefined') {
  watch(
    () => props.src,
    value => {
      if (!value) {
        return (error.value = false);
      }

      const img = new Image();
      img.onload = () => (error.value = false);
      img.onerror = () => (error.value = true);
      img.src = value;
    },
    { immediate: true },
  );
}
</script>

<template>
  <span
    class="atomic-avatar"
    :class="classes"
    :style="style"
  >
    <template v-if="src">
      <template v-if="isFallback">
        <span>
          <slot name="fallback">
            <slot name="default">
              {{ alt }}
            </slot>
          </slot>
        </span>
      </template>
      <img
        v-else
        :alt="alt"
        class="atomic-avatar__image"
        decoding="async"
        draggable="false"
        :height="size"
        :loading="loading"
        :src="src"
        :width="size"
      >
    </template>
    <template v-else>
      <slot name="default" />
    </template>
  </span>
</template>

<style lang="scss">
.atomic-avatar {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  width: var(--avatar-size);
  height: var(--avatar-size);
  font-size: 1.25rem;
  font-weight: bold;
  background-color: #f3f4f6;
  border-radius: var(--avatar-rounded);
  user-select: none;

  &--small {
    --avatar-size: 24px;
  }

  &--medium {
    --avatar-size: 40px;
  }

  &--large {
    --avatar-size: 56px;
  }

  &__image {
    width: 100%;
    height: 100%;
    aspect-ratio: 1 / 1;
    object-fit: cover;
  }
}
</style>

