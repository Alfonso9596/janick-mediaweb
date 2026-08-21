<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { getPageableGames, createNewGame, editGame, deleteGame } from '@/api/networks/games.network'
import { uploadNewPoster } from '@/api/networks/files.network'
import { useGameStore } from '@/stores/games.store'
import { Column, ContextMenu, DataTable, FileUpload, type DataTableRowClickEvent, type DataTableRowContextMenuEvent, type FileUploadSelectEvent } from 'primevue'
import { useRoute } from 'vue-router'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth.store'
import router from '@/router'
import type { Game, Genre, Platform } from '@/types/common'
import { getAllGameGenres } from '@/api/networks/genres.network'
import { getAllGamePlatforms } from '@/api/networks/platforms.network'
import { Times } from '@primeicons/vue'

const apiUrl = import.meta.env.VITE_API_URL
const gameStore = useGameStore()
const authStore = useAuthStore()
const currentRoute = useRoute()
const toast = useToast()
const cm = ref()

const state = reactive<{
  gameList: Game[]
  page: number
  pageSize: number
  sortBy: string
  sortDir: string
  totalRecords: number
  totalPages: number | undefined
  loading: boolean
  searchName: string
  searchGenre: string
  searchPlatform: string
  createDialogVisible: boolean
  genreListLoading: boolean
  genreList: Genre[]
  platformListLoading: boolean
  platformList: Platform[]
  editDialogVisible: boolean
  editDialogGameId: number
  deleteDialogVisible: boolean
  deleteDialogGameName: string
  deleteDialogGameId: number
  selectedContextGame: Game | null
}>({
  gameList: [],
  page: gameStore.gamesPage,
  pageSize: gameStore.gamesPageSize,
  sortBy: gameStore.gamesSortBy,
  sortDir: gameStore.gamesSortDir,
  totalRecords: 0,
  totalPages: undefined,
  loading: false,
  searchName: '',
  searchGenre: '',
  searchPlatform: '',
  createDialogVisible: false,
  genreListLoading: false,
  genreList: [],
  platformListLoading: false,
  platformList: [],
  editDialogVisible: false,
  editDialogGameId: 0,
  deleteDialogVisible: false,
  deleteDialogGameName: '',
  deleteDialogGameId: 0,
  selectedContextGame: null
})

const defaultFormValues = reactive<{
  name: string
  description: string
  year: number
  genres: string[]
  platforms: string[]
}>({
  name: '',
  description: '',
  year: 0,
  genres: [],
  platforms: []
})

const createFormValues = reactive<{
  name: string
  description: string
  year: number
  genres: string[]
  platforms: string[]
  posterFile: File | null
}>({
  name: '',
  description: '',
  year: 0,
  genres: [],
  platforms: [],
  posterFile: null,
})

const editFormValues = reactive<{
  name: string
  description: string
  year: number
  genres: string[]
  platforms: string[]
}>({
  name: '',
  description: '',
  year: 0,
  genres: [],
  platforms: []
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

watch(
  () => state.searchName,
  () => {
    fetchGames()
  },
)

watch(
  () => state.searchGenre,
  () => {
    fetchGames()
  },
)

watch(
  () => state.searchPlatform,
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
    title: 'Erscheinungsjahr',
    sortable: true,
  },
  {
    key: 'ratingValue',
    title: 'Bewertung',
    rating: true
  },
])

const contextMenuModel = ref([
  {
    label: 'Bearbeiten',
    icon: 'pi pi-pencil',
    disabled: () => {
      return (authStore.decodedToken?.sub !== state.selectedContextGame?.user?.username) &&
        (!authStore.roles?.includes('ADMIN'))
    },
    command: () => {
      if (state.selectedContextGame == null) return
      showEditDialog(state.selectedContextGame)
    }
  },
  {
    separator: true
  },
  {
    label: 'Löschen',
    icon: 'pi pi-trash',
    color: '#c73c3c',
    disabled: () => {
      return (authStore.decodedToken?.sub !== state.selectedContextGame?.user?.username) &&
        (!authStore.roles?.includes('ADMIN'))
    },
    command: () => {
      if (state.selectedContextGame == null) return
      showDeleteDialog(state.selectedContextGame)
    }
  }
])

const onRowContextMenu = (event: DataTableRowContextMenuEvent) => {
  state.selectedContextGame = event.data
  cm.value.show(event.originalEvent)
}

const onRowClick = (event: DataTableRowClickEvent) => {
  goToGamePage(event.data.id)
}

const fetchGames = async () => {
  state.loading = true

  const params = {
    pageSize: String(state.pageSize),
    page: String(state.page),
    sortBy: state.sortBy,
    sortDir: state.sortDir,
    ...currentRoute.query,
    name: state.searchName ? state.searchName : '',
    genre: state.searchGenre ? state.searchGenre : '',
    platform: state.searchPlatform ? state.searchPlatform : '',
  }

  const response = await getPageableGames(params)
  state.gameList = response.content
  state.totalRecords = response.totalElements
  state.totalPages = response.totalPages

  state.loading = false
}

const fetchGenreList = async () => {
  state.genreListLoading = true
  const response = await getAllGameGenres()
  state.genreList = response
  state.genreListLoading = false
}

const fetchPlatformList = async () => {
  state.platformListLoading = true
  const response = await getAllGamePlatforms()
  state.platformList = response
  state.platformListLoading = false
}

const capDescription = (value: string) => {
  return value ? value.substring(0, 100) + '...' : ''
}

const goToGamePage = (id: number) => {
  router.push('/games/' + id)
}

const resolver = ref(
  zodResolver(
    z.object({
      name: z.string().min(1, 'Name ist erforderlich'),
      year: z.union([
        z
          .number()
          .gt(1958, {
            message: "Das älteste Spiel ist 'Tennis for Two' aus dem Jahr 1958.",
          })
          .lt(new Date().getFullYear() + 1, {
            message: 'Spiele aus der Zukunft werden nicht akzeptiert.',
          }),
        z.literal(null),
      ]),
    }),
  ),
)

const onCreateFormSubmit = async (e: { valid: boolean }) => {
  if (e.valid) {
    if (createFormValues.posterFile !== null) {
      const posterResponse = await uploadNewPoster(
        createFormValues.posterFile,
        'GAME',
        createFormValues.name,
        '',
        String(createFormValues.year),
      )

      if (!posterResponse) {
        console.error('Failed image upload')
        toast.add({
          severity: 'error',
          summary: 'Ein Poster für "' + createFormValues.name + '" konnte nicht hochgeladen werden.',
          life: 5000,
        })
        return
      }
    }

    const gameResponse = await createNewGame(createFormValues)

    if (!gameResponse) {
      if (createFormValues.posterFile) {
        toast.add({
          severity: 'error',
          summary: 'Das Bild wurde hochgeladen, aber das Spiel wurde nicht gespeichert',
          life: 5000,
        })
        return
      } else {
        toast.add({
          severity: 'error',
          summary: 'Das Spiel "' + createFormValues.name + '" existiert bereits',
          life: 5000,
        })
        return
      }
    }
    toast.add({
      severity: 'success',
      summary: 'Das Spiel "' + createFormValues.name + '" wurde gespeichert',
      life: 3000,
    })
    state.createDialogVisible = false
    fetchGames()
    fetchGenreList()
  }
}

const onEditFormSubmit = async () => {
  const editGameResponse = await editGame(state.editDialogGameId, editFormValues)

  if (editGameResponse === false) {
    toast.add({
      severity: 'error',
      summary: 'Fehler beim Bearbeiten des Spiels "' + editFormValues.name + '"',
      life: 5000
    })
  } else {
    toast.add({
      severity: 'success',
      summary: 'Spiel "' + editFormValues.name + '" erfolgreich bearbeitet',
      life: 3000
    })
  }

  state.editDialogVisible = false
  fetchGames()
}

const onDeleteFormSubmit = async () => {
  const deleteGameResponse = await deleteGame(state.deleteDialogGameId)

  if (deleteGameResponse === false) {
    toast.add({
      severity: 'error',
      summary: 'Fehler beim Löschen des Spiels "' + state.deleteDialogGameName + '"',
      life: 5000
    })
  } else {
    toast.add({
      severity: 'success',
      summary: 'Spiel "' + state.deleteDialogGameName + '" erfolgreich gelöscht',
      life: 3000
    })
  }
  state.deleteDialogVisible = false
  fetchGames()
}

const clearCreateDialogForm = () => {
  createFormValues.name = defaultFormValues.name
  createFormValues.description = defaultFormValues.description
  createFormValues.year = defaultFormValues.year
  createFormValues.genres = defaultFormValues.genres
  createFormValues.posterFile = null
}

const showEditDialog = (game: Game) => {
  state.editDialogGameId = Number.parseInt(String(game.id), 10)
  editFormValues.name = game.name
  editFormValues.description = game.description ?? ''
  editFormValues.year = game.year
  editFormValues.genres = game.genres ?? []
  editFormValues.platforms = game.platforms ?? []
  state.editDialogVisible = true
}

const clearEditDialogForm = () => {
  state.editDialogVisible = false

  editFormValues.name = ''
  editFormValues.description = ''
  editFormValues.year = 0
  editFormValues.genres = []
  editFormValues.platforms = []
}

const showDeleteDialog = async (game: Game) => {
  state.deleteDialogGameName = game.name
  state.deleteDialogGameId = game.id
  state.deleteDialogVisible = true
}

function onPosterSelect(event: FileUploadSelectEvent) {
  createFormValues.posterFile = event.files[0]
}

function onPosterRemove() {
  createFormValues.posterFile = null
}

fetchGenreList()
fetchPlatformList()
fetchGames()
</script>

<template>
  <div class="card">
    <div class="font-semibold text-xl mb-4">Spiele</div>
    <ContextMenu ref="cm" :model="contextMenuModel" @hide="state.selectedContextGame = null">
      <template #item="{ item, props }">
        <a class="flex items-center" v-bind="props.action"  :style="{ 'background-color': item.color, 'border-radius': '2px' }">
          <span :class="item.icon" />
          <span class="ml-2">{{ item.label }}</span>
        </a>
      </template>
    </ContextMenu>
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
      :first="state.page * state.pageSize"
      :sortField="state.sortBy"
      :sortOrder="state.sortDir === 'asc' ? 1 : -1"
      contextMenu
      selectionMode="single"
      :contextMenuSelection="state.selectedContextGame"
      @rowContextmenu="onRowContextMenu"
      @rowClick="onRowClick"
      @page="state.page = $event.page"
      @update:rows="state.pageSize = $event"
      @update:sortField="state.sortBy = $event"
      @update:sortOrder="state.sortDir = ($event ?? 1) > 0 ? 'asc' : 'desc'"
    >
      <template #header>
        <div class="flex justify-end">
          <Button @click="state.createDialogVisible = true" type="button" label="Neu" icon="pi pi-plus" />
          <Select
            v-model="state.searchGenre"
            :options="state.genreList"
            filter
            optionLabel="name"
            optionValue="name"
            placeholder="Filtern nach Genre"
            :showClear="state.searchGenre !== ''"
            class="md:w-56 ml-2"
            :loading="state.genreListLoading"
            :disabled="state.genreListLoading"
          />
          <Select
            v-model="state.searchPlatform"
            :options="state.platformList"
            filter
            optionLabel="name"
            optionValue="name"
            placeholder="Filtern nach Plattform"
            :showClear="state.searchPlatform !== ''"
            class="md:w-56 ml-2"
            :loading="state.platformListLoading"
            :disabled="state.platformListLoading"
          />
          <IconField class="ml-2">
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText
              v-model="state.searchName"
              placeholder="Suche..."
            />
            <InputIcon v-if="state.searchName" class="cursor-pointer" @click="state.searchName = ''">
              <Times />
            </InputIcon>
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
            :src="`${apiUrl}/api/file?filename=${data[header.key]}`"
            :alt="`${header.title || 'item'}.jpg`"
            style="width: 50px"
          />
          <span v-else-if="data[header.key].length > 100" v-tooltip.top="data[header.key]">{{
            capDescription(data[header.key])
          }}</span>
          <span v-else-if="header.rating">
            <b>{{ data[header.key] }}</b>
            <i class="pi pi-star-fill ml-2" style="color: #dfbf13" />
          </span>
          <span v-else>{{ data[header.key] }}</span>
        </template>
      </Column>
    </DataTable>

    <!-- CREATE GAME FORM DIALOG -->
    <Dialog
      @afterHide="clearCreateDialogForm"
      v-model:visible="state.createDialogVisible"
      modal
      header="Neues Spiel einfügen"
      :style="{ width: '32rem' }"
    >
      <Form
        v-slot="$createForm"
        :resolver="resolver"
        :initialValues="defaultFormValues"
        @submit="onCreateFormSubmit"
        class="formgrid grid"
      >
        <div class="field col-12 md:col-6">
          <FloatLabel variant="in">
            <InputText
              v-model="createFormValues.name"
              name="name"
              class="flex-auto w-full"
              autocomplete="off"
              autofocus
            />
            <Message
              v-if="$createForm.name?.invalid"
              severity="error"
              size="small"
              variant="simple"
              >{{ $createForm.name.error?.message }}</Message>
              <label for="name">Name</label>
          </FloatLabel>
        </div>
        <div class="field col-12 md:col-6">
          <FloatLabel variant="in">
            <InputNumber
              v-model="createFormValues.year"
              name="year"
              class="flex-auto w-full"
              :useGrouping="false"
            />
            <Message
              v-if="$createForm.year?.invalid"
              severity="error"
              size="small"
              variant="simple"
              >{{ $createForm.year.error?.message }}</Message
            >
            <label for="year">Erscheinungsjahr</label>
          </FloatLabel>
        </div>
        <div class="field col-12">
          <FloatLabel variant="in">
            <Textarea
              v-model="createFormValues.description"
              name="description"
              class="w-full"
              rows="5"
              style="resize: none"
            />
            <label for="description">Beschreibung</label>
          </FloatLabel>
        </div>
        <div class="field col-12 md:col-6">
          <FloatLabel variant="in">
            <MultiSelect
              v-model="createFormValues.genres"
              name="genres"
              fluid
              display="chip"
              :options="state.genreList"
              optionLabel="name"
              optionValue="name"
              filter
              placeholder="Genre auswählen"
              :maxSelectedLabels="2"
              selectedItemsLabel="{0} Genres ausgewählt"
              :loading="state.genreListLoading"
              :disabled="state.genreListLoading"
            />
            <label for="genres">Genres</label>
          </FloatLabel>
        </div>
        <div class="field col-12 md:col-6">
          <FloatLabel variant="in">
            <MultiSelect
              v-model="createFormValues.platforms"
              name="platforms"
              fluid
              display="chip"
              :options="state.platformList"
              optionLabel="name"
              optionValue="name"
              filter
              placeholder="Plattform auswählen"
              :maxSelectedLabels="2"
              selectedItemsLabel="{0} Plattformen ausgewählt"
              :loading="state.platformListLoading"
              :disabled="state.platformListLoading"
            />
            <label for="platforms">Plattformen</label>
          </FloatLabel>
        </div>
        <div class="field col-12">
          <FileUpload
            @select="onPosterSelect"
            @clear="onPosterRemove"
            customUpload
            name="posterFilepath"
            accept="image/*"
            :fileLimit="1"
          >
            <template #header="{ chooseCallback, clearCallback, files }">
              <div class="flex flex-wrap justify-between items-center flex-1 gap-4">
                <div class="flex gap-2">
                  <Button
                    @click="chooseCallback()"
                    icon="pi pi-cloud-upload"
                    rounded
                    variant="outlined"
                    severity="success"
                    :disabled="files.length > 0"
                  />
                  <Button
                    @click="clearCallback()"
                    icon="pi pi-times"
                    rounded
                    variant="outlined"
                    severity="danger"
                    :disabled="!files || files.length === 0"
                  />
                </div>
              </div>
            </template>
            <template #content="{ files }">
              <div class="flex flex-row gap-8">
                <div v-if="files.length > 0">
                  <div class="flex flex-wrap gap-4">
                    <div>
                      <img
                        role="presentation"
                        :alt="files[0]?.name"
                        :src="(files[0] as any)?.objectURL"
                        width="80"
                        height="40"
                      />
                    </div>
                    <span
                      class="font-semibold text-ellipsis max-w-60 whitespace-nowrap overflow-hidden"
                      >{{ files[0]?.name }}</span
                    >
                  </div>
                </div>
              </div>
            </template>
            <template #empty>
              <div class="flex items-center justify-center flex-col">
                <i
                  class="pi pi-cloud-upload border-2! rounded-full! p-4! text-4xl! text-muted-color!"
                />
                <p class="mt-6 mb-0">Bilddatei hierhin verschieben</p>
              </div>
            </template>
          </FileUpload>
        </div>
        <div class="field col-6">
          <Button type="submit" severity="success" label="Bestätigen" />
        </div>
      </Form>
    </Dialog>

    <!-- EDIT GAME FORM DIALOG -->
    <Dialog
      @afterHide="clearEditDialogForm"
      v-model:visible="state.editDialogVisible"
      modal
      header="Spiel bearbeiten"
      :style="{ width: '32rem' }"
    >
      <Form
        v-slot="$editForm"
        :resolver="resolver"
        @submit="onEditFormSubmit"
        class="formgrid grid"
      >
        <div class="field col-12 md:col-6">
          <FloatLabel variant="in">
            <InputText
              v-model="editFormValues.name"
              name="name"
              class="flex-auto w-full"
              autocomplete="off"
              autofocus
            />
            <Message
              v-if="$editForm.name?.invalid"
              severity="error"
              size="small"
              variant="simple"
              >{{ $editForm.name.error?.message }}</Message>
              <label for="name">Name</label>
          </FloatLabel>
        </div>
        <div class="field col-12 md:col-6">
          <FloatLabel variant="in">
            <InputNumber
              v-model="editFormValues.year"
              name="year"
              class="flex-auto w-full"
              :useGrouping="false"
            />
            <Message
              v-if="$editForm.year?.invalid"
              severity="error"
              size="small"
              variant="simple"
              >{{ $editForm.year.error?.message }}</Message
            >
            <label for="year">Erscheinungsjahr</label>
          </FloatLabel>
        </div>
        <div class="field col-12">
          <FloatLabel variant="in">
            <Textarea
              v-model="editFormValues.description"
              name="description"
              class="w-full"
              rows="5"
              style="resize: none"
            />
            <label for="description">Beschreibung</label>
          </FloatLabel>
        </div>
        <div class="field col-12 md:col-6">
          <FloatLabel variant="in">
            <MultiSelect
              v-model="editFormValues.genres"
              name="genres"
              fluid
              display="chip"
              :options="state.genreList"
              optionLabel="name"
              optionValue="name"
              filter
              placeholder="Genre auswählen"
              :maxSelectedLabels="2"
              selectedItemsLabel="{0} Genres ausgewählt"
              :loading="state.genreListLoading"
              :disabled="state.genreListLoading"
            />
            <label for="genres">Genres</label>
          </FloatLabel>
        </div>
        <div class="field col-12 md:col-6">
          <FloatLabel variant="in">
            <MultiSelect
              v-model="editFormValues.platforms"
              name="platforms"
              fluid
              display="chip"
              :options="state.platformList"
              optionLabel="name"
              optionValue="name"
              filter
              placeholder="Plattform auswählen"
              :maxSelectedLabels="2"
              selectedItemsLabel="{0} Plattformen ausgewählt"
              :loading="state.platformListLoading"
              :disabled="state.platformListLoading"
            />
            <label for="platforms">Plattformen</label>
          </FloatLabel>
        </div>
        <div class="field col-6">
          <Button type="submit" severity="success" label="Bestätigen" />
        </div>
      </Form>
    </Dialog>

    <!-- DELETE GAME FORM DIALOG -->
    <Dialog
      v-model:visible="state.deleteDialogVisible"
      modal
      header="Spiel löschen"
      :closable="false"
      :style="{ width: '32rem' }"
    >
      <div class="flex flex-col gap-4">
        <p>Möchten Sie das Spiel "{{ state.deleteDialogGameName }}" wirklich löschen?</p>
        <div class="flex justify-end gap-2">
          <Button
            label="Abbrechen"
            severity="secondary"
            @click="state.deleteDialogVisible = false"
          />
          <Button
            label="Löschen"
            severity="danger"
            @click="onDeleteFormSubmit"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>
