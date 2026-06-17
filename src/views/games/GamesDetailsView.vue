<script setup lang="ts">
import { getGameById, getGameFiles, addRating } from '@/api/networks/games.network'
import { onBeforeMount, reactive } from 'vue'
import { useRoute } from 'vue-router'
import RatingOverview from '@/components/RatingOverview.vue'
import TreeStructure from '@/components/TreeStructure.vue'
import { Chip, useToast } from 'primevue'

const currentRoute = useRoute()
const toast = useToast()

const state = reactive<{
  game: any
  files: any[]
  loading: boolean
}>({
  game: {},
  files: [],
  loading: false,
})

const fetchGameById = async () => {
  state.loading = true
  const response = (await getGameById(String(currentRoute.params.id))) || {}
  state.game = response
  state.loading = false
}

const fetchGameFiles = async () => {
  state.loading = true
  const response = await getGameFiles(String(currentRoute.params.id))
  state.files = response || []
  state.loading = false
}

const setRating = async (rating: number) => {
  try {
    await addRating(state.game.id, rating)
    toast.add({
      severity: 'success',
      summary: 'Bewertung hinzugefügt',
      detail: `Deine Bewertung von ${rating} wurde hinzugefügt.`,
      life: 3000,
    })
    fetchGameById()
  } catch (error) {
    console.error(error)
    toast.add({
      severity: 'error',
      summary: 'Bewertung konnte nicht hinzugefügt werden. Bitte versuche es später erneut.',
      life: 5000,
    })
  }
}

onBeforeMount(() => {
  fetchGameById()
  fetchGameFiles()
})
</script>

<template>
  <div class="card">
    <div class="grid grid-cols-4 gap-2" style="display: grid">
      <div class="col-span-4" style="font-size: 1.5rem">
        {{ state.game.name }} ({{ state.game.year }})<i
          class="pi pi-heart"
          style="color: #ea0c74; margin-left: 1rem"
        ></i>
      </div>
      <div class="col-span-4">
        <RatingOverview @update:modelValue="setRating" :item="state.game" />
      </div>
      <div class="col-span-1">
        <img
          v-if="state.game.posterFilepath !== undefined"
          :src="`http://localhost:8080/api/file?filename=${state.game.posterFilepath}`"
          :alt="state.game.name"
          style="box-shadow: 10px 10px 20px #000000; height: 30rem"
        />
      </div>
      <div class="col-span-3 grid grid-cols-3 grid-rows-4 gap-2 mt-0 ml-3" style="display: grid">
        <div class="col-span-2">
          <span class="mt-2" style="display: block">{{ state.game.description }}</span>
        </div>
        <div class="col-span-2">
          <Chip class="mr-2" v-for="genre in state.game.genres" :key="genre" :label="genre" />
        </div>
        <div class="col-span-2">
          <Chip class="mr-2" v-for="platform in state.game.platforms" :key="platform" :label="platform" />
        </div>
      </div>
      <TreeStructure :series="state.game" :files="state.files" :loading="state.loading" />
    </div>
  </div>
</template>
