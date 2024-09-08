<script setup lang="ts">
import AtomicToast from '~/components/AtomicToast.vue';
import { useToasts } from '~/plugins/toasts';

const toasts = useToasts();
</script>

<template>
  <Teleport to="body">
    <AtomicToast
      v-for="message in toasts"
      :key="message.key"
      v-bind="message.props"
    />
  </Teleport>
</template>
