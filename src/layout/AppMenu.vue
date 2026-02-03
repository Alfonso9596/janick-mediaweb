<script setup lang="ts">
import { ref } from 'vue'
import AppMenuItem from './AppMenuItem.vue'

const model = ref([
  {
    label: 'Filme',
    items: [
      { label: 'Alle Filme', vicon: 'fa-film', to: '/movies' },
      //{ label: 'Bestbewertet', icon: 'pi pi-fw pi-star', to: '/movies?sortBy=ratingValue:desc' },
    ],
  },
  {
    label: 'Serien',
    items: [
      { label: 'Alle Serien', vicon: 'fa-tv', to: '/series' },
      //{ label: 'Bestbewertet', icon: 'pi pi-fw pi-star', to: '/series?sortBy=ratingValue:desc' },
    ],
  },
  {
    label: 'Spiele',
    items: [
      { label: 'Alle Spiele', vicon: 'fa-gamepad', to: '/games' },
      //{ label: 'Bestbewertet', icon: 'pi pi-fw pi-star', to: '/games?sortBy=ratingValue:desc' },
      {
        label: 'Plattform',
        items: [
          { label: 'PC', to: '/games?platform=PC' },
          { label: 'PSP', to: '/games?platform=PSP' },
        ],
      },
    ],
  },
  {
    label: 'Musik',
    items: [
      { label: 'Alle Alben', vicon: 'fa-music', to: '/music' },
      //{ label: 'Bestbewertet', icon: 'pi pi-fw pi-star', to: '/music?sortBy=ratingValue:desc' },
    ],
  },
])
</script>

<template>
  <ul class="layout-menu">
    <template v-for="(item, i) in model" :key="item">
      <AppMenuItem v-if="!item.separator" :item="item" :index="i"></AppMenuItem>
      <li v-if="item.separator" class="menu-separator"></li>
    </template>
  </ul>
</template>
