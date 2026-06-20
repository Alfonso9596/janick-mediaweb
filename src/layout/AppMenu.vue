<script setup lang="ts">
import { ref } from 'vue'
import AppMenuItem from './AppMenuItem.vue'

const model = ref([
  {
    label: 'Filme',
    items: [
      { label: 'Alle Filme', vicon: 'fa-film', to: '/movies', key: '0-0' },
      //{ label: 'Bestbewertet', icon: 'pi pi-fw pi-star', to: '/movies?sortBy=ratingValue:desc' },
    ],
    key: '0',
  },
  {
    label: 'Serien',
    items: [
      { label: 'Alle Serien', vicon: 'fa-tv', to: '/series', key: '1-0' },
      //{ label: 'Bestbewertet', icon: 'pi pi-fw pi-star', to: '/series?sortBy=ratingValue:desc' },
    ],
    key: '1'
  },
  {
    label: 'Spiele',
    items: [
      { label: 'Alle Spiele', vicon: 'fa-gamepad', to: '/games', key: '2-0' },
      //{ label: 'Bestbewertet', icon: 'pi pi-fw pi-star', to: '/games?sortBy=ratingValue:desc' },
      /*{
        label: 'Plattform',
        items: [
          { label: 'PC', to: '/games?platform=PC', key: '2-1-0' },
          { label: 'PSP', to: '/games?platform=PSP', key: '2-1-1' },
        ],
        key: '2-1'
      },*/
    ],
    key: '2'
  },
  {
    label: 'Musik',
    items: [
      { label: 'Alle Musik', vicon: 'fa-music', to: '/music', key: '3-0' },
      //{ label: 'Bestbewertet', icon: 'pi pi-fw pi-star', to: '/music?sortBy=ratingValue:desc' },
    ],
    key: '3'
  },
  {
    label: 'Rezepte',
    items: [
      { label: 'Alle Rezepte', vicon: 'fa-utensils', to: '/recipes', key: '4-0'},
    ],
    key: '4'
  }
])
</script>

<template>
  <template v-for="(item, i) in model" :key="item">
    <AppMenuItem :item="item" :index="i"></AppMenuItem>
  </template>
</template>
