<script setup lang="ts">
import AppConfigurator from '@/layout/AppConfigurator.vue'
import { useConfiguratorStore } from '@/stores/configurator.store'
import { useLayout } from '@/layout/composables/layout'
import { Button } from 'primevue'

const configuratorStore = useConfiguratorStore()
const { executeDarkModeToggle, isDarkTheme } = useLayout()

function onDarkThemeChange() {
  executeDarkModeToggle()
  configuratorStore.setConfiguratorDarkTheme(isDarkTheme.value)
}
</script>

<template>
  <div class="fixed flex gap-4 top-8 right-8">
    <Button
      type="button"
      @click="onDarkThemeChange"
      rounded
      :icon="!isDarkTheme ? 'pi pi-moon' : 'pi pi-sun'"
      severity="secondary"
    />
    <div class="relative">
      <Button
        icon="pi pi-palette"
        v-styleclass="{
          selector: '@next',
          enterFromClass: 'hidden',
          enterActiveClass: 'animate-scalein',
          leaveToClass: 'hidden',
          leaveActiveClass: 'animate-fadeout',
          hideOnOutsideClick: true,
        }"
        type="button"
        rounded
      />
      <AppConfigurator />
    </div>
  </div>
</template>
