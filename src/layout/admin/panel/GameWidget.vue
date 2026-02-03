<script setup lang="ts">
import { getAllGames } from '@/api/networks/admin.network'
import { onMounted, reactive, ref, watch } from 'vue'

const state = reactive<{
  gameList: any[]
  totalRecords: number
  loading: boolean
}>({
  gameList: [],
  totalRecords: 0,
  loading: false,
})

const gameAmount = ref(0)

const fetchMovies = async () => {
  state.loading = true

  const response = await getAllGames()
  state.gameList = response.content
  state.totalRecords = response.totalElements

  state.loading = false
}

const updateGameCount = () => {
  if (gameAmount.value === state.totalRecords) return
  if (gameAmount.value < state.totalRecords) gameAmount.value++
  if (gameAmount.value > state.totalRecords) gameAmount.value--
  setTimeout(updateGameCount, 50)
}

onMounted(async () => {
  await fetchMovies()
})

watch(
  () => state.totalRecords,
  () => {
    updateGameCount()
  },
)
</script>

<template>
  <div class="card">
    <div class="flex justify-between mb-4">
      <div>
        <span class="block text-muted-color font-medium mb-4">Spiele</span>
        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
          {{ gameAmount }}
        </div>
      </div>
    </div>
  </div>
</template>
