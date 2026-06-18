<script setup lang="ts">
import { ref } from 'vue'
import AppMenuItem from '@/layout/AppMenuItem.vue'

const model = ref([
  {
    label: 'Dashboard',
    items: [{ label: 'Übersicht', icon: 'pi pi-fw pi-home', to: '/admin', key: '0-0' }],
    key: '0'
  },
  {
    label: 'Benutzerverwaltung',
    items: [
      { label: 'Alle Benutzer', icon: 'pi pi-fw pi-users', to: '/admin/users', key: '1-0' },
    ],
    key: '1'
  },
  {
    label: 'Inhaltsverwaltung',
    items: [
      { label: 'Filme verwalten', vicon: 'fa-film', to: '/admin/movies' },
      { label: 'Serien verwalten', vicon: 'fa-tv', to: '/admin/series' },
      { label: 'Spiele verwalten', vicon: 'fa-gamepad', to: '/admin/games' },
      { label: 'Musik verwalten', vicon: 'fa-music', to: '/admin/music' },
      { label: 'Rezepte verwalten', vicon: 'fa-utensils', to: '/admin/recipes' },
    ],
    key: '2'
  },
])
</script>

<template>
  <template v-for="(item, i) in model" :key="item">
    <AppMenuItem :item="item" :index="i"></AppMenuItem>
  </template>
</template>
