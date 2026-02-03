<script setup lang="ts">
import { getMovieById, getMovieFiles, addRating } from '@/api/networks/movies.network'
import { computed, onBeforeMount, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue'
import RatingOverview from '@/components/RatingOverview.vue'
import { Chip, TreeTable } from 'primevue'
import type { TreeNode } from 'primevue/treenode'

const currentRoute = useRoute()
const toast = useToast()

const state = reactive<{
  movie: any
  files: any[]
  loading: boolean
}>({
  movie: {},
  files: [],
  loading: false,
})

const treeConfig = computed(() => {
  const getTreeItem = (item: any): TreeNode => ({
    data: item,
    key: item.key,
    label: item.name,
    children: item.children?.length
      ? item.children.map((child: any) => getTreeItem(child))
      : undefined,
  })
  return state.files.map((file) => getTreeItem(file))
})

const numeratedTreeConfig = () => {
  state.files.forEach((file, index) => {
    file.key = `${index}`
    file.size = formatFileSize(file)

    if (file.children && file.children.length > 0) {
      file.children.forEach((child: any, childIndex: number) => {
        child.key = `${index}-${childIndex}`
        child.size = formatFileSize(child)
      })
    }
  })
}

function formatFileSize(file: any): string {
  if (file.fileType === 'FOLDER') {
    return '-'
  }
  if (file.size < 1024) {
    return file.size + ' B'
  } else if (file.size < 1024 * 1024) {
    return (file.size / 1024).toFixed(2) + ' KB'
  } else if (file.size < 1024 * 1024 * 1024) {
    return (file.size / (1024 * 1024)).toFixed(2) + ' MB'
  } else {
    return (file.size / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }
}

const fetchMovieById = async () => {
  state.loading = true
  const response = (await getMovieById(String(currentRoute.params.id))) || {}
  state.movie = response
  state.loading = false
}

const fetchMovieFiles = async () => {
  state.loading = true
  const response = await getMovieFiles(String(currentRoute.params.id))
  state.files = response || []
  numeratedTreeConfig()
  state.loading = false
}

const setRating = async (event) => {
  await addRating(state.movie.id, event)
  fetchMovieById()

  toast.add({
    severity: 'success',
    summary: 'Bewertung hinzugefügt',
    detail: `Deine Bewertung von ${event} wurde hinzugefügt`,
    life: 5000,
  })
}

onBeforeMount(() => {
  fetchMovieById()
  fetchMovieFiles()
})
</script>

<template>
  <div class="card">
    <div class="grid grid-cols-4 gap-2" style="display: grid">
      <div class="col-span-4" style="font-size: 1.5rem">
        {{ state.movie.name }} ({{ state.movie.year }})<i
          class="pi pi-heart"
          style="color: #ea0c74; margin-left: 1rem"
        ></i>
      </div>
      <div class="col-span-4">
        <RatingOverview @update:modelValue="setRating" :item="state.movie" />
      </div>
      <div class="col-span-1">
        <img
          v-if="state.movie.posterFilepath !== undefined"
          :src="`http://localhost:8080/api/file?filename=${state.movie.posterFilepath}`"
          :alt="state.movie.name"
          style="box-shadow: 10px 10px 20px #000000; height: 30rem"
        />
      </div>
      <div class="col-span-3 grid grid-cols-3 grid-rows-4 gap-2 mt-0 ml-3" style="display: grid">
        <div class="col-span-2">
          <span class="mt-2" style="display: block">{{ state.movie.description }}</span>
        </div>
        <div class="col-span-2">
          <span class="mt-2"><b>Dauer</b>: {{ state.movie.length }} Minuten</span>
        </div>
        <div class="col-span-2">
          <Chip class="mr-2" v-for="genre in state.movie.genres" :key="genre" :label="genre" />
        </div>
      </div>
      <div class="col-span-4 mt-5">
        <TreeTable :value="treeConfig" :loading="state.loading">
          <template #empty> Keine Dateien gefunden. </template>
          <Column :expander="true" field="name" header="Dateiname" :showFilterMenu="false" />
          <Column field="size" header="Größe" :showFilterMenu="false" />
          <Column field="fileType" header="Dateityp" :showFilterMenu="false">
            <template #body="{ node }">
              <Chip v-if="node.data.fileType === 'FOLDER'" label="Ordner" icon="pi pi-folder" />
              <Chip v-else-if="node.data.fileType === 'VIDEO'" label="Video" icon="pi pi-video" />
              <Chip v-else label="ZIP" icon="pi pi-box" />
            </template>
          </Column>
          <Column class="w-24 text-end!">
            <template #body="{ node }">
              <Button
                v-if="node.data.fileType !== 'FOLDER'"
                as="a"
                icon="pi pi-download"
                class="p-button-text"
                :label="'Download'"
                :href="`${node.data.url}`"
                target="_blank"
              />
            </template>
          </Column>
        </TreeTable>
      </div>
    </div>
  </div>
</template>
