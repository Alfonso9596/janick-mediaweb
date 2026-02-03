<script setup lang="ts">
import FloatingConfigurator from '@/components/FloatingConfigurator.vue'
</script>

<template>
  <FloatingConfigurator />
  <div class="flex items-center justify-center min-h-screen overflow-hidden">
    <div
      style="
        border-radius: 56px;
        padding: 0.3rem;
        background: linear-gradient(
          180deg,
          color-mix(in srgb, var(--primary-color), trasnparent 60%) 10%,
          var(--surface-ground) 30%
        );
      "
    >
      <div
        class="w-full py-20 px-8 sm:px-20 flex flex-col items-center"
        style="border-radius: 53px; background-color: var(--code-background)"
      >
        <span class="text-primary font-bold text-3x1">401</span>
        <h1 class="text-surface-900 dark:text-surface-0 font-bold text-3xl lg:text-5xl mb-2">
          Unauthorized
        </h1>
        <div class="text-surface-600 dark:text-surface-200 mb-8">
          Sie haben keinen Zugriff auf diese Seite
        </div>
        <router-link
          to="/"
          class="w-full flex items-center py-8 border-surface-300 dark:border-surface-500"
        >
          <span class="ml-6 flex flex-col">
            <span class="text-surface-900 dark:text-surface-0 lg:text-xl font-medium mb-0 block"
              >Zurück zur Homepage</span
            >
          </span>
        </router-link>
      </div>
    </div>
  </div>
</template>
