<script setup lang="ts">
import { getMovieById } from '@/api/networks/movies.network'
import { onBeforeMount, reactive } from 'vue'
import { useRoute } from 'vue-router'

const currentRoute = useRoute()

const state = reactive<{
  movie: any
  loading: boolean
}>({
  movie: {},
  loading: false,
})

const fetchMovieById = async () => {
  state.loading = true
  const response = (await getMovieById(String(currentRoute.params.id))) || {}
  state.movie = response
  state.loading = false
}

onBeforeMount(() => {
  fetchMovieById()
})
</script>

<template>
  <div class="card">
    <div class="font-semibold text-xl mb-4">{{ state.movie.name }}</div>
    <img
      v-if="state.movie.posterFilepath !== undefined"
      :src="`http://localhost:8080/api/file?filename=${state.movie.posterFilepath}`"
      style="width: 300px"
    />
  </div>
</template>
