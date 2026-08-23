<script setup lang="ts">
import { getMusicById, getMusicFiles, addRating } from '@/api/networks/music.network'
import { onBeforeMount, reactive } from 'vue'
import { useRoute } from 'vue-router'
import RatingOverview from '@/components/RatingOverview.vue'
import TreeStructure from '@/components/TreeStructure.vue'
import { Chip, useToast } from 'primevue'
import { ArrowLeft } from '@primeicons/vue'
import type { FileItem, Music } from '@/types/common'
import router from '@/router'

const apiUrl = import.meta.env.VITE_API_URL
const currentRoute = useRoute()
const toast = useToast()

const state = reactive<{
  music: Music
  files: FileItem[]
  loading: boolean
}>({
  music: {
    id: 0,
    name: '',
    artist: '',
    year: 0,
    posterFilepath: undefined,
    description: '',
    genres: [],
    ratingAmount: 0,
    ratingValue: 0
  },
  files: [],
  loading: false
})

const fetchMusicById = async () => {
  state.loading = true
  const response = (await getMusicById(String(currentRoute.params.id))) || {}
  state.music = response
  state.loading = false
}

const fetchMusicFiles = async () => {
  state.loading = true
  const response = await getMusicFiles(String(currentRoute.params.id))
  state.files = response || []
  state.loading = false
}

const setRating = async (rating: number) => {
  try {
    await addRating(Number(state.music.id), rating)
    toast.add({
      severity: 'success',
      summary: 'Bewertung hinzugefügt',
      detail: `Deine Bewertung von ${rating} wurde hinzugefügt.`,
      life: 3000
    })
    fetchMusicById()
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
  fetchMusicFiles()
}

onBeforeMount(() => {
  fetchMusicById()
  fetchMusicFiles()
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
        {{ state.music.artist ? state.music.name + ' - ' + state.music.artist : state.music.name }} ({{ state.music.year }})
      </div>
      <div class="col-span-4">
        <RatingOverview @update:modelValue="setRating" :item="state.music" />
      </div>
      <div class="col-span-1">
        <img
          v-if="state.music.posterFilepath !== undefined"
          :src="`${apiUrl}/api/file?filename=${state.music.posterFilepath}`"
          :alt="state.music.name"
          style="box-shadow: 10px 10px 20px #000000; height: 30rem"
        />
      </div>
      <div class="col-span-3 grid grid-cols-3 grid-rows-4 gap-2 mt-0 ml-3" style="display: grid">
        <div class="col-span-2">
          <span class="mt-2" style="display: block">{{ state.music.description }}</span>
        </div>
        <div class="col-span-2">
          <Chip class="mr-2" v-for="genre in state.music.genres" :key="genre" :label="genre" />
        </div>
      </div>
      <TreeStructure
        @fileUpload="fileUpload"
        :files="state.files"
        :loading="state.loading"
        :mediaId="state.music.id"
        mediaType="MUSIC"
      />
    </div>
  </div>
</template>
