<script setup lang="ts">
import { getSeriesById } from '@/api/networks/series.network'
import { onBeforeMount, reactive } from 'vue'
import { useRoute } from 'vue-router'

const currentRoute = useRoute()

const state = reactive<{
  series: any
  loading: boolean
}>({
  series: {},
  loading: false,
})

const fetchSeriesById = async () => {
  state.loading = true
  const response = (await getSeriesById(String(currentRoute.params.id))) || {}
  state.series = response
  state.loading = false
}

onBeforeMount(() => {
  fetchSeriesById()
})
</script>

<template>
  <div class="card">
    <div class="font-semibold text-xl mb-4">{{ state.series.name }}</div>
    <img
      v-if="state.series.posterFilepath !== undefined"
      :src="`http://localhost:8080/api/file?filename=${state.series.posterFilepath}`"
      style="width: 300px"
    />
  </div>
</template>
