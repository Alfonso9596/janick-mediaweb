<script setup lang="ts">
import { getSeriesById, getSeriesFiles, addRating } from '@/api/networks/series.network'
import { onBeforeMount, reactive } from 'vue'
import { useRoute } from 'vue-router'
import RatingOverview from '@/components/RatingOverview.vue'
import TreeStructure from '@/components/TreeStructure.vue'
import { Chip, useToast } from 'primevue'
import { ArrowLeft } from '@primeicons/vue'
import type { FileItem, Series } from '@/types/common'
import router from '@/router'

const apiUrl = import.meta.env.API_URL
const currentRoute = useRoute()
const toast = useToast()

const state = reactive<{
  series: Series
  files: FileItem[]
  loading: boolean
}>({
  series: {
    id: 0,
    name: '',
    yearStart: 0,
    yearEnd: undefined,
    posterFilepath: undefined,
    description: '',
    episodeLength: undefined,
    genres: [],
    ratingAmount: 0,
    ratingValue: 0
  },
  files: [],
  loading: false,
})

const fetchSeriesById = async () => {
  state.loading = true
  const response = (await getSeriesById(String(currentRoute.params.id))) || {}
  state.series = response
  state.loading = false
}

const fetchSeriesFiles = async () => {
  state.loading = true
  const response = await getSeriesFiles(String(currentRoute.params.id))
  state.files = response || []
  state.loading = false
}

const setRating = async (rating: number) => {
  try {
    await addRating(Number(state.series.id), rating)
    toast.add({
      severity: 'success',
      summary: 'Bewertung hinzugefügt',
      detail: `Deine Bewertung von ${rating} wurde hinzugefügt.`,
      life: 3000,
    })
    fetchSeriesById()
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
  fetchSeriesFiles()
}

onBeforeMount(() => {
  fetchSeriesById()
  fetchSeriesFiles()
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
        {{ state.series.name }} ({{ state.series.yearStart }} - {{ state.series.yearEnd }})<i
          class="pi pi-heart ml-4"
          style="color: #ea0c74"
        ></i>
      </div>
      <div class="col-span-4">
        <RatingOverview @update:modelValue="setRating" :item="state.series" />
      </div>
      <div class="col-span-1">
        <img
          v-if="state.series.posterFilepath !== undefined"
          :src="`${apiUrl}/api/file?filename=${state.series.posterFilepath}`"
          :alt="state.series.name"
          style="box-shadow: 10px 10px 20px #000000; height: 30rem"
        />
      </div>
      <div class="col-span-3 grid grid-cols-3 grid-rows-4 gap-2 mt-0 ml-3" style="display: grid">
        <div class="col-span-2">
          <span class="mt-2" style="display: block">{{ state.series.description }}</span>
        </div>
        <div class="col-span-2">
          <Chip class="mr-2" v-for="genre in state.series.genres" :key="genre" :label="genre" />
        </div>
      </div>
      <TreeStructure
        @file-upload="fileUpload"
        :files="state.files"
        :loading="state.loading"
        :fileUploadTitle="`Datei für ${state.series.name} hochladen`"
        :mediaId="state.series.id"
        mediaType="SERIES"
      />
    </div>
  </div>
</template>
