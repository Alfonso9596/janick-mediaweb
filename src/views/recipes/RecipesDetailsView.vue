<script setup lang="ts">
import { getRecipeById, getRecipeFiles, addRating } from '@/api/networks/recipes.network'
import { onBeforeMount, reactive } from 'vue'
import { useRoute } from 'vue-router'
import RatingOverview from '@/components/RatingOverview.vue'
import TreeStructure from '@/components/TreeStructure.vue'
import { Chip, useToast } from 'primevue'
import { ArrowLeft } from '@primeicons/vue'
import type { FileItem, Recipe } from '@/types/common'
import router from '@/router'

const apiUrl = import.meta.env.VITE_API_URL
const currentRoute = useRoute()
const toast = useToast()

const state = reactive<{
  recipe: Recipe,
  files: FileItem[]
  loading: boolean
}>({
  recipe: {
    id: 0,
    name: '',
    posterFilepath: undefined,
    description: '',
    mealTypes: [],
    vegetarian: false,
    vegan: false,
    glutenfree: false,
    lactosefree: false,
    ratingAmount: 0,
    ratingValue: 0
  },
  files: [],
  loading: false
})

const fetchRecipeById = async () => {
  state.loading = true
  const response = await getRecipeById(String(currentRoute.params.id)) || {}
  state.recipe = response
  state.loading = false
}

const fetchRecipeFiles = async () => {
  state.loading = true
  const response = await getRecipeFiles(String(currentRoute.params.id))
  state.files = response || []
  state.loading = false
}

const setRating = async (rating: number) => {
  try {
    await addRating(Number(state.recipe.id), rating)
    toast.add({
      severity: 'success',
      summary: 'Bewertung hinzugefügt',
      detail: `Deine Bewertung von ${rating} wurde hinzugefügt.`,
      life: 3000
    })
    fetchRecipeById()
  } catch (error) {
    console.error(error)
    toast.add({
      severity: 'error',
      summary: 'Bewertung konnte nicht hinzugefügt werden. Bitte versuche es später erneut.',
      life: 5000
    })
  }
}

const fileUpload = () => {
  fetchRecipeFiles()
}

onBeforeMount(() => {
  fetchRecipeById()
  fetchRecipeFiles()
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
        {{ state.recipe.name }}
        <div class="mt-2 col-span-2">
          <Chip class="mr-2" v-if="state.recipe.vegetarian" label="Vegetarisch" />
          <Chip class="mr-2" v-if="state.recipe.vegan" label="Vegan" />
          <Chip class="mr-2" v-if="state.recipe.glutenfree" label="Glutenfrei" />
          <Chip class="mr-2" v-if="state.recipe.lactosefree" label="Laktosefrei" />
        </div>
      </div>
      <div class="col-span-4">
        <RatingOverview @update:modelValue="setRating" :item="state.recipe" />
      </div>
      <div class="col-span-1">
        <img
          v-if="state.recipe.posterFilepath !== undefined"
          :src="`${apiUrl}/api/file?filename=${state.recipe.posterFilepath}`"
          :alt="state.recipe.name"
          style="box-shadow: 10px 10px 20px #000000; max-height: 30rem"
        />
      </div>
      <div class="col-span-3 grid grid-cols-3 grid-rows-4 gap-2 mt-0 ml-3" style="display: grid">
        <div class="col-span-2">
          <span class="mt-2" style="display: block">{{ state.recipe.description }}</span>
        </div>
        <div class="col-span-2">
          <Chip class="mr-2" v-for="mealType in state.recipe.mealTypes" :key="mealType" :label="mealType" />
        </div>
      </div>
      <TreeStructure
        @file-upload="fileUpload"
        :files="state.files"
        :loading="state.loading"
        :mediaId="state.recipe.id"
        mediaType="RECIPE"
      />
    </div>
  </div>
</template>
