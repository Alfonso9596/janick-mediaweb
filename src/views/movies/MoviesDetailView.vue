<script setup lang="ts">
import { getMovieById, getMovieFiles, addRating } from '@/api/networks/movies.network'
import { onBeforeMount, reactive } from 'vue'
import { useRoute } from 'vue-router'
import RatingOverview from '@/components/RatingOverview.vue'
import TreeStructure from '@/components/TreeStructure.vue'
import { Chip, useToast } from 'primevue'

const currentRoute = useRoute()
const toast = useToast()

const state = reactive<{
  movie: any
  files: any[]
  loading: boolean
}>({
  movie: {},
  files: [],
  loading: false,
})

const fetchMovieById = async () => {
  state.loading = true
  const response = (await getMovieById(String(currentRoute.params.id))) || {}
  state.movie = response
  state.loading = false
}

const fetchMovieFiles = async () => {
  state.loading = true
  const response = await getMovieFiles(String(currentRoute.params.id))
  state.files = response || []
  state.loading = false
}

const setRating = async (event) => {
  await addRating(state.movie.id, event)
  fetchMovieById()

  toast.add({
    severity: 'success',
    summary: 'Bewertung hinzugefügt',
    detail: `Deine Bewertung von ${event} wurde hinzugefügt`,
    life: 5000,
  })
}

onBeforeMount(() => {
  fetchMovieById()
  fetchMovieFiles()
})
</script>

<template>
  <div class="card">
    <div class="grid grid-cols-4 gap-2" style="display: grid">
      <div class="col-span-4" style="font-size: 1.5rem">
        {{ state.movie.name }} ({{ state.movie.year }})<i
          class="pi pi-heart"
          style="color: #ea0c74; margin-left: 1rem"
        ></i>
      </div>
      <div class="col-span-4">
        <RatingOverview @update:modelValue="setRating" :item="state.movie" />
      </div>
      <div class="col-span-1">
        <img
          v-if="state.movie.posterFilepath !== undefined"
          :src="`http://localhost:8080/api/file?filename=${state.movie.posterFilepath}`"
          :alt="state.movie.name"
          style="box-shadow: 10px 10px 20px #000000; height: 30rem"
        />
      </div>
      <div class="col-span-3 grid grid-cols-3 grid-rows-4 gap-2 mt-0 ml-3" style="display: grid">
        <div class="col-span-2">
          <span class="mt-2" style="display: block">{{ state.movie.description }}</span>
        </div>
        <div class="col-span-2">
          <span class="mt-2"><b>Dauer</b>: {{ state.movie.length }} Minuten</span>
        </div>
        <div class="col-span-2">
          <Chip class="mr-2" v-for="genre in state.movie.genres" :key="genre" :label="genre" />
        </div>
      </div>
      <TreeStructure :files="state.files" :loading="state.loading" />
    </div>
  </div>
</template>
