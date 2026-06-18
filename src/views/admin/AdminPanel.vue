<script setup lang="ts">
import MovieWidget from '@/layout/admin/panel/MovieWidget.vue'
import SeriesWidget from '@/layout/admin/panel/SeriesWidget.vue'
import GameWidget from '@/layout/admin/panel/GameWidget.vue'
</script>

<template>
  <div class="grid grid-cols-12 gap-8 m-0">
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
      <MovieWidget />
      <SeriesWidget />
      <GameWidget />
    </div>
  </div>
</template>
