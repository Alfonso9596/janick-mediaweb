<script setup lang="ts">
import { getAllMovies } from '@/api/networks/admin.network'
import { onMounted, reactive, ref, watch } from 'vue'
import type { Movie } from '@/types/common'

const state = reactive<{
  movieList: Movie[]
  totalRecords: number
  loading: boolean
}>({
  movieList: [],
  totalRecords: 0,
  loading: false,
})

const movieAmount = ref(0)

const fetchMovies = async () => {
  state.loading = true

  const response = await getAllMovies()
  state.movieList = response.content
  state.totalRecords = response.totalElements

  state.loading = false
}

const updateMovieCount = () => {
  if (movieAmount.value === state.totalRecords) return
  if (movieAmount.value < state.totalRecords) movieAmount.value++
  if (movieAmount.value > state.totalRecords) movieAmount.value--
  setTimeout(updateMovieCount, 50)
}

onMounted(async () => {
  await fetchMovies()
})

watch(
  () => state.totalRecords,
  () => {
    updateMovieCount()
  },
)
</script>

<template>
  <div class="card">
    <div class="flex justify-between mb-4">
      <div>
        <span class="block text-muted-color font-medium mb-4">Filme</span>
        <div class="font-medium text-xl">
          {{ movieAmount }}
        </div>
      </div>
    </div>
  </div>
</template>
