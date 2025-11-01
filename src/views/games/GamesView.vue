<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { getPageableGames } from '@/api/networks/games.network'
import { useGameStore } from '@/stores/games.store'
import { Column, DataTable } from 'primevue'
import { useRoute } from 'vue-router'
import router from '@/router'

const gameStore = useGameStore()
const currentRoute = useRoute()

const state = reactive<{
  gameList: any[]
  page: number
  pageSize: number
  sortBy: string
  sortDir: string
  totalRecords: number
  totalPages: number | undefined
  loading: boolean
  search: string
}>({
  gameList: [],
  page: gameStore.gamesPage,
  pageSize: gameStore.gamesPageSize,
  sortBy: gameStore.gamesSortBy,
  sortDir: gameStore.gamesSortDir,
  totalRecords: 0,
  totalPages: undefined,
  loading: false,
  search: '',
})

watch(
  () => state.pageSize,
  () => {
    fetchGames()
    gameStore.setGamesPageSize(state.pageSize)
  },
)

watch(
  () => state.page,
  () => {
    fetchGames()
    gameStore.setGamesPage(state.page)
  },
)

watch(
  () => state.sortBy,
  () => {
    fetchGames()
    gameStore.setGamesSortBy(state.sortBy)
  },
)

watch(
  () => state.sortDir,
  () => {
    fetchGames()
    gameStore.setGamesSortDir(state.sortDir)
  },
)

watch(
  () => currentRoute.query,
  () => {
    fetchGames()
  },
)

const headers = computed(() => [
  {
    key: 'posterFilepath',
    title: '',
    image: true,
  },
  {
    key: 'name',
    title: 'Name',
    sortable: true,
  },
  {
    key: 'description',
    title: 'Beschreibung',
  },
  {
    key: 'year',
    title: 'Jahr',
  },
  {
    key: 'ratingValue',
    title: 'Bewertung',
  },
])

const fetchGames = async (name?: string) => {
  state.loading = true

  const params = {
    pageSize: state.pageSize,
    page: state.page,
    sortBy: state.sortBy,
    sortDir: state.sortDir,
    ...currentRoute.query,
    name: '',
  }

  if (name) {
    params.name = name
  }

  const response = await getPageableGames(params)
  state.gameList = response.content
  state.totalRecords = response.totalElements
  state.totalPages = response.totalPages

  state.loading = false
}

const capDescription = (value: string) => {
  return value ? value.substring(0, 100) + '...' : ''
}

const goToGamePage = (game: any) => {
  router.push('/games/' + game.id)
}

const clearSearch = () => {
  state.search = ''
  fetchGames()
}

fetchGames()
</script>

<template>
  <div class="card">
    <div class="font-semibold text-xl mb-4">Games</div>
    <DataTable
      lazy
      :value="state.gameList"
      :paginator="true"
      :rows="state.pageSize"
      :rowsPerPageOptions="[10, 20, 50]"
      :totalRecords="state.totalRecords"
      :pageCount="state.totalPages"
      dataKey="id"
      :rowHover="true"
      :loading="state.loading"
      @page="state.page = $event.page"
      @update:rows="state.pageSize = $event"
      @update:sortField="state.sortBy = $event"
      @update:sortOrder="state.sortDir = $event > 0 || $event === undefined ? 'asc' : 'desc'"
    >
      <template #header>
        <div class="flex justify-end">
          <Button type="button" label="Neu" icon="pi pi-plus" />
          <IconField style="margin-left: 10px">
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText
              v-model="state.search"
              placeholder="Suche..."
              @input="fetchGames(state.search)"
            />
            <InputIcon class="pi pi-times" style="cursor: pointer" @click="clearSearch()" />
          </IconField>
        </div>
      </template>
      <Column
        v-for="header of headers"
        :key="header.key"
        :field="header.key"
        :header="header.title"
        :sortable="header.sortable"
        :showFilterMenu="false"
      >
        <template #body="{ data }">
          <img
            v-if="header.image"
            :src="`http://localhost:8080/api/file?filename=${data[header.key]}`"
            style="width: 50px"
          />
          <span v-else-if="data[header.key].length > 100" v-tooltip.top="data[header.key]">{{
            capDescription(data[header.key])
          }}</span>
          <span v-else>{{ data[header.key] }}</span>
        </template>
      </Column>
      <Column class="w-24 !text-end">
        <template #body="{ data }">
          <Button
            icon="pi pi-info-circle"
            outline
            rounded
            class="mr-2"
            severity="info"
            @click="goToGamePage(data)"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>
