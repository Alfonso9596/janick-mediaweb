<script setup lang="ts">
import { getAllRecipes } from '@/api/networks/admin.network'
import { onMounted, reactive, ref, watch } from 'vue'
import type { Recipe } from '@/types/common'
import router from '@/router'

const state = reactive<{
  recipeList: Recipe[]
  totalRecords: number
  loading: boolean
}>({
  recipeList: [],
  totalRecords: 0,
  loading: false
})

const recipeAmount = ref(0)

const fetchRecipes = async () => {
  state.loading = true

  const response = await getAllRecipes()
  state.recipeList = response.content
  state.totalRecords =response.totalElements

  state.loading = false
}

const updateRecipeCount = () => {
  if (recipeAmount.value === state.totalRecords) return
  if (recipeAmount.value < state.totalRecords) recipeAmount.value++
  if (recipeAmount.value > state.totalRecords) recipeAmount.value--
  setTimeout(updateRecipeCount, 50)
}

onMounted(async () => {
  await fetchRecipes()
})

watch(
  () => state.totalRecords,
  () => {
    updateRecipeCount()
  }
)
</script>

<template>
  <div class="card cursor-pointer" @click="router.push('/recipes')">
    <div class="flex justify-between mb-4">
      <div>
        <span class="block text-muted-color font-medium mb-4">Rezepte</span>
        <div class="font-medium text-xl">
          {{ recipeAmount }}
        </div>
      </div>
    </div>
  </div>
</template>
