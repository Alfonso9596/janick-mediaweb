<script setup lang="ts">
import { getGameById } from '@/api/networks/games.network'
import { onBeforeMount, reactive } from 'vue'
import { useRoute } from 'vue-router'

const currentRoute = useRoute()

const state = reactive<{
  game: any
  loading: boolean
}>({
  game: {},
  loading: false,
})

const fetchGameById = async () => {
  state.loading = true
  const response = (await getGameById(String(currentRoute.params.id))) || {}
  state.game = response
  state.loading = false
}

onBeforeMount(() => {
  fetchGameById()
})
</script>

<template>
  <div class="card">
    <div class="font-semibold text-xl mb-4">{{ state.game.name }}</div>
    <img
      v-if="state.game.posterFilepath !== undefined"
      :src="`http://localhost:8080/api/file?filename=${state.game.posterFilepath}`"
      style="width: 300px"
    />
  </div>
</template>
