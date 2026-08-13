<script setup lang="ts">
import { getAllMusic } from '@/api/networks/admin.network'
import { onMounted, reactive, ref, watch } from 'vue'
import type { Music } from '@/types/common'
import router from '@/router'

const state = reactive<{
  musicList: Music[]
  totalRecords: number
  loading: boolean
}>({
  musicList: [],
  totalRecords: 0,
  loading: false
})

const musicAmount = ref(0)

const fetchMusic = async () => {
  state.loading = true

  const response = await getAllMusic()
  state.musicList = response.content
  state.totalRecords = response.totalElements

  state.loading = false
}

const updateMusicCount = () => {
  if (musicAmount.value === state.totalRecords) return
  if (musicAmount.value < state.totalRecords) musicAmount.value++
  if (musicAmount.value > state.totalRecords) musicAmount.value--
  setTimeout(updateMusicCount, 50)
}

onMounted(async () => {
  await fetchMusic()
})

watch(
  () => state.totalRecords,
  () => {
    updateMusicCount()
  }
)
</script>

<template>
  <div class="card cursor-pointer" @click="router.push('/music')">
    <div class="flex justify-between mb-4">
      <div>
        <span class="block text-muted-color font-medium mb-4">Musik</span>
        <div class="font-medium text-xl">
          {{ musicAmount }}
        </div>
      </div>
    </div>
  </div>
</template>
