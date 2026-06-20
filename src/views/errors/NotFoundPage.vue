<script setup lang="ts">
import FloatingConfigurator from '@/components/FloatingConfigurator.vue'
import router from '@/router'
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
        <span class="text-primary font-bold text-3x1">404</span>
        <h1 class="text-surface-900 dark:text-surface-0 font-bold text-3xl lg:text-5xl mb-2">
          Not Found
        </h1>
        <div class="text-surface-600 dark:text-surface-200 mb-8">
          Diese Seite existiert nicht
        </div>
        <Button
          class="mb-3"
          outlined
          @click="router.go(-2)"
          label="Zurück"
          severity="secondary"
        />
        <Button
          @click="router.push('/')"
          label="Homepage"
          severity="primary"
        />
      </div>
    </div>
  </div>
</template>
