<script setup lang="ts">
import { ref } from 'vue'
import AppMenuItem from './AppMenuItem.vue'

const model = ref([
  {
    label: 'Filme',
    items: [
      { label: 'Alle Filme', icon: 'pi pi-fw pi-list', to: '/movies' },
      //{ label: 'Bestbewertet', icon: 'pi pi-fw pi-star', to: '/movies?sortBy=ratingValue:desc' },
    ],
  },
  {
    label: 'Serien',
    items: [
      { label: 'Alle Serien', icon: 'pi pi-gw pi-list', to: '/series' },
      //{ label: 'Bestbewertet', icon: 'pi pi-fw pi-star', to: '/series?sortBy=ratingValue:desc' },
    ],
  },
  {
    label: 'Spiele',
    items: [
      { label: 'Alle Spiele', icon: 'pi pi-gw pi-list', to: '/games' },
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
