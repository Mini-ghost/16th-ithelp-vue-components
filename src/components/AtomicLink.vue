<script lang="ts">
async function preloadRouteComponents(
  to: RouteLocationRaw,
  router: Router & {
    _routePreloaded?: Set<string>;
  },
): Promise<void> {
  const { path, matched } = router.resolve(to);

  if (!matched.length) return;
  if (!router._routePreloaded) router._routePreloaded = new Set();
  if (router._routePreloaded.has(path)) return;

  router._routePreloaded.add(path);

  const promises: Promise<any>[] = [];
  const components = matched
    .map(component => component.components?.default)
    .filter(component => isFunction(component));

  for (const component of components) {
    const promise = Promise.resolve((component as Function)()).catch(noop);

    promises.push(promise);
  }

  await Promise.all(promises);
}
</script>

<script setup lang="ts">
import { hasProtocol } from 'ufo';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

import type { RouteLocationRaw, Router } from 'vue-router';

import createIntersectionObserver from '~/helpers/createIntersectionObserver';
import isFunction from '~/utils/isFunction';
import noop from '~/utils/noop';

interface AtomicLinkProps {
  to?: RouteLocationRaw;
  target?: '_blank' | '_parent' | '_self' | '_top';
  external?: boolean;
}

const props = withDefaults(defineProps<AtomicLinkProps>(), {
  to: '',
  target: undefined,
});

const router = useRouter();

const linkRef = ref<HTMLElement>();

// Resolves `to` value if it's a route location object
// converts `'''` to `null` to prevent the attribute from being added as empty (`href=""`)
const href = computed(() => {
  return typeof props.to === 'object'
    ? router.resolve(props.to)?.href ?? null
    : props.to;
});

// Resolving link type
const isExternal = computed(() => {
  // External prop is explicitly set
  if (props.external) {
    return true;
  }

  // When `target` prop is set, link is external
  if (props.target && props.target !== '_self') {
    return true;
  }

  // When `to` is a route object then it's an internal link
  if (typeof props.to === 'object') {
    return false;
  }

  return props.to === '' || hasProtocol(props.to, { acceptRelative: true });
});

const resolveRef = (instance: any) => {
  linkRef.value = instance?.$el;
};

let idleId: number;
let unobserve: (() => void) | null = null;

onMounted(() => {
  idleId = requestIdleCallback(() => {
    if (!linkRef.value) return;

    const { observe } = createIntersectionObserver();
    unobserve = observe(linkRef.value, () => {
      unobserve?.();
      unobserve = null;

      if (isExternal.value) return;
      preloadRouteComponents(props.to, router);
    });
  });
});

onBeforeUnmount(() => {
  if (idleId) {
    cancelIdleCallback(idleId);
  }
  unobserve?.();
  unobserve = null;
});
</script>

<template>
  <template v-if="!isExternal">
    <RouterLink
      :ref="resolveRef"
      :to="to as any"
    >
      <slot name="default" />
    </RouterLink>
  </template>
  <template v-else>
    <a
      :href="href"
      rel="noopener noreferrer"
      :target="target"
    >
      <slot name="default" />
    </a>
  </template>
</template>
