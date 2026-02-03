<script setup lang="ts">
import { getAllSeries } from '@/api/networks/admin.network'
import { onMounted, reactive, ref, watch } from 'vue'

const state = reactive<{
  seriesList: any[]
  totalRecords: number
  loading: boolean
}>({
  seriesList: [],
  totalRecords: 0,
  loading: false,
})

const seriesAmount = ref(0)

const fetchSeries = async () => {
  state.loading = true

  const response = await getAllSeries()
  state.seriesList = response.content
  state.totalRecords = response.totalElements

  state.loading = false
}

const updateSeriesCount = () => {
  if (seriesAmount.value === state.totalRecords) return
  if (seriesAmount.value < state.totalRecords) seriesAmount.value++
  if (seriesAmount.value > state.totalRecords) seriesAmount.value--
  setTimeout(updateSeriesCount, 50)
}

onMounted(async () => {
  await fetchSeries()
})

watch(
  () => state.totalRecords,
  () => {
    updateSeriesCount()
  },
)
</script>

<template>
  <div class="card">
    <div class="flex justify-between mb-4">
      <div>
        <span class="block text-muted-color font-medium mb-4">Serien</span>
        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
          {{ seriesAmount }}
        </div>
      </div>
    </div>
  </div>
</template>
