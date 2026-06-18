<script setup lang="ts">
import { useLayout } from '@/layout/composables/layout'
import { computed, ref, watch } from 'vue'
import AdminSidebar from './AdminSidebar.vue'
import AppTopbar from '@/layout/AppTopbar.vue'

const { layoutConfig, layoutState, isSidebarActive } = useLayout()

const outsideClickListener = ref<((event: Event) => void) | null>(null)

watch(isSidebarActive, (newVal) => {
  if (newVal) {
    bindOutsideClickListener()
  } else {
    unbindOutsideClickListener()
  }
})

const containerClass = computed(() => {
  return {
    'layout-overlay': layoutConfig.menuMode === 'overlay',
    'layout-static': layoutConfig.menuMode === 'static',
    'layout-static-inactive':
      layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === 'static',
    'layout-overlay-active': layoutState.overlayMenuActive,
    'layout-mobile-active': layoutState.staticMenuMobileActive,
  }
})

function bindOutsideClickListener() {
  if (!outsideClickListener.value) {
    outsideClickListener.value = (event: Event) => {
      if (isOutsideClicked(event)) {
        layoutState.overlayMenuActive = false
        layoutState.staticMenuMobileActive = false
        layoutState.menuHoverActive = false
      }
    }
    document.addEventListener('click', outsideClickListener.value)
  }
}

function unbindOutsideClickListener() {
  if (outsideClickListener.value) {
    document.removeEventListener('click', outsideClickListener.value)
    outsideClickListener.value = null
  }
}

function isOutsideClicked(event: Event) {
  const sidebarEl = document.querySelector('.layout-sidebar')
  const topbarEl = document.querySelector('.layout-menu-button')
  const target = event.target as Node | null

  return !(
    sidebarEl?.isSameNode(target) ||
    sidebarEl?.contains(target) ||
    topbarEl?.isSameNode(target) ||
    topbarEl?.contains(target)
  )
}
</script>

<template>
  <div class="layout-wrapper" :class="containerClass">
    <AppTopbar :isAdminPanel="true" />
    <AdminSidebar />
    <div class="layout-main-container">
      <div class="layout-main">
        <router-view />
      </div>
    </div>
    <div class="layout-mask animate-fadein" />
  </div>
</template>
