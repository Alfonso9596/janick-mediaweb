<script setup lang="ts">
import { getMovieById, getMovieFiles, addRating } from '@/api/networks/movies.network'
import { onBeforeMount, reactive } from 'vue'
import { useRoute } from 'vue-router'
import RatingOverview from '@/components/RatingOverview.vue'
import TreeStructure from '@/components/TreeStructure.vue'
import { Chip, useToast } from 'primevue'
import { ArrowLeft } from '@primeicons/vue'
import type { FileItem, Movie } from '@/types/common'
import router from '@/router'

const apiUrl = import.meta.env.VITE_API_URL
const currentRoute = useRoute()
const toast = useToast()

const state = reactive<{
  movie: Movie
  files: FileItem[]
  loading: boolean
}>({
  movie: {
    id: 0,
    name: '',
    year: 0,
    posterFilepath: undefined,
    description: '',
    length: undefined,
    genres: [],
    ratingAmount: 0,
    ratingValue: 0
  },
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

const setRating = async (rating: number) => {
  try {
    await addRating(Number(state.movie.id), rating)
    toast.add({
      severity: 'success',
      summary: 'Bewertung hinzugefügt',
      detail: `Deine Bewertung von ${rating} wurde hinzugefügt.`,
      life: 3000,
    })
    fetchMovieById()
  } catch (error) {
    console.error(error)
    toast.add({
      severity: 'error',
      summary: 'Bewertung konnte nicht hinzugefügt werden. Bitte versuche es später erneut.',
      life: 5000,
    })
  }
}

const fileUpload = () => {
  fetchMovieFiles()
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
        <Button
          @click="router.go(-1)"
          iconOnly
          rounded
          aria-label="Zurück"
          class="mr-2"
        >
          <ArrowLeft />
        </Button>
        {{ state.movie.name }} ({{ state.movie.year }})
      </div>
      <div class="col-span-4">
        <RatingOverview @update:modelValue="setRating" :item="state.movie" />
      </div>
      <div class="col-span-1">
        <img
          v-if="state.movie.posterFilepath !== undefined"
          :src="`${apiUrl}/api/file?filename=${state.movie.posterFilepath}`"
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
      <TreeStructure
        @file-upload="fileUpload"
        :files="state.files"
        :loading="state.loading"
        :fileUploadTitle="`Datei für ${state.movie.name} hochladen`"
        :mediaId="state.movie.id"
        mediaType="MOVIE"
      />
    </div>
  </div>
</template>
