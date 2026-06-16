<script setup lang="ts">
import { ref } from 'vue'
import AppMenuItem from '@/layout/AppMenuItem.vue'

const model = ref([
  {
    label: 'Dashboard',
    items: [{ label: 'Übersicht', icon: 'pi pi-fw pi-home', to: '/admin' }],
  },
  {
    label: 'Benutzerverwaltung',
    items: [
      { label: 'Alle Benutzer', icon: 'pi pi-fw pi-users', to: '/admin/users' },
      {
        label: 'Neuen Benutzer erstellen',
        icon: 'pi pi-fw pi-user-plus',
        to: '/admin/users/create',
      },
    ],
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
