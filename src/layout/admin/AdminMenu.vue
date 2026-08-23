<script setup lang="ts">
import { ref } from 'vue'
import AppMenuItem from '@/layout/AppMenuItem.vue'

const model = ref([
  {
    label: 'Dashboard',
    items: [{ label: 'Übersicht', vicon: 'fa-home', to: '/admin', key: '0-0' }],
    key: '0'
  },
  {
    label: 'Benutzerverwaltung',
    items: [
      { label: 'Alle Benutzer', vicon: 'fa-user', to: '/admin/users/all', key: '1-0' }
    ],
    key: '1'
  },
  {
    label: 'Filme & Serien',
    items: [
      { label: 'Genres verwalten', vicon: 'fa-list', to: '/admin/movies/genres', key: '2-0' }
    ],
    key: '2'
  },
  {
    label: 'Spiele',
    items: [
      { label: 'Genres verwalten', vicon: 'fa-list', to: '/admin/games/genres', key: '3-0' },
      { label: 'Plattformen verwalten', vicon: 'fa-buffer', to: '/admin/games/platforms', key: '3-1'}
    ],
    key: '3'
  },
  {
    label: 'Musik',
    items: [
      { label: 'Genres verwalten', vicon: 'fa-list', to: '/admin/music/genres', key: '4-0' }
    ]
  },
  {
    label: 'Rezepte',
    items: [
      { label: 'Mahlzeitarten verwalten', vicon: 'fa-list', to: '/admin/recipes/mealTypes', key: '5-0' }
    ]
  }
])
</script>

<template>
  <template v-for="(item, i) in model" :key="item">
    <AppMenuItem :item="item" :index="i"></AppMenuItem>
  </template>
</template>
