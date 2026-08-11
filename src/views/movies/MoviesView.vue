<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { getPageableMovies, createNewMovie, editMovie, deleteMovie } from '@/api/networks/movies.network'
import { uploadNewPoster } from '@/api/networks/files.network'
import { useMovieStore } from '@/stores/movies.store'
import { Column, ContextMenu, DataTable, FileUpload, type DataTableRowClickEvent, type DataTableRowContextMenuEvent, type FileUploadSelectEvent } from 'primevue'
import { useRoute } from 'vue-router'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'
import { useToast } from 'primevue/usetoast'
import router from '@/router'
import type { Movie, Genre } from '@/types/common'
import { useAuthStore } from '@/stores/auth.store'
import { getAllMovieGenres } from '@/api/networks/genres.network'

const apiUrl = import.meta.env.VITE_API_URL
const movieStore = useMovieStore()
const authStore = useAuthStore()
const currentRoute = useRoute()
const toast = useToast()
const cm = ref()

const state = reactive<{
  movieList: Movie[]
  page: number
  pageSize: number
  sortBy: string
  sortDir: string
  totalRecords: number
  totalPages: number | undefined
  loading: boolean
  searchName: string
  searchGenre: string
  createDialogVisible: boolean
  genreListLoading: boolean
  genreList: Genre[]
  editDialogVisible: boolean
  editDialogMovieId: number
  deleteDialogVisible: boolean
  deleteDialogMovieName: string
  deleteDialogMovieId: number
  selectedContextMovie: Movie | null
}>({
  movieList: [],
  page: movieStore.moviesPage,
  pageSize: movieStore.moviesPageSize,
  sortBy: movieStore.moviesSortBy,
  sortDir: movieStore.moviesSortDir,
  totalRecords: 0,
  totalPages: undefined,
  loading: false,
  searchName: '',
  searchGenre: '',
  createDialogVisible: false,
  genreListLoading: false,
  genreList: [],
  editDialogVisible: false,
  editDialogMovieId: 0,
  deleteDialogVisible: false,
  deleteDialogMovieName: '',
  deleteDialogMovieId: 0,
  selectedContextMovie: null
})

const defaultFormValues = reactive<{
  name: string
  description: string
  year: number
  length: number
  genres: string[]
}>({
  name: '',
  description: '',
  year: 0,
  length: 0,
  genres: [],
})

const createFormValues = reactive<{
  name: string
  description: string
  year: number
  length: number
  genres: string[]
  posterFile: File | null
}>({
  name: '',
  description: '',
  year: 0,
  length: 0,
  genres: [],
  posterFile: null,
})

const editFormValues = reactive<{
  name: string
  description: string
  year: number
  length: number
  genres: string[]
}>({
  name: '',
  description: '',
  year: 0,
  length: 0,
  genres: [],
})

watch(
  () => state.pageSize,
  () => {
    fetchMovies()
    movieStore.setMoviesPageSize(state.pageSize)
  },
)

watch(
  () => state.page,
  () => {
    fetchMovies()
    movieStore.setMoviesPage(state.page)
  },
)

watch(
  () => state.sortBy,
  () => {
    fetchMovies()
    movieStore.setMoviesSortBy(state.sortBy)
  },
)

watch(
  () => state.sortDir,
  () => {
    fetchMovies()
    movieStore.setMoviesSortDir(state.sortDir)
  },
)

watch(
  () => currentRoute.query,
  () => {
    fetchMovies()
  },
)

watch(
  () => state.searchName,
  () => {
    fetchMovies()
  },
)

watch(
  () => state.searchGenre,
  () => {
    fetchMovies()
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
    key: 'length',
    title: 'Länge (Minuten)',
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
      return (authStore.decodedToken?.sub !== state.selectedContextMovie?.user?.username) &&
        (!authStore.roles?.includes('ADMIN'))
    },
    command: () => {
      if (state.selectedContextMovie == null) return
      showEditDialog(state.selectedContextMovie)
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
      return (authStore.decodedToken?.sub !== state.selectedContextMovie?.user?.username) &&
        (!authStore.roles?.includes('ADMIN'))
    },
    command: () => {
      if (state.selectedContextMovie == null) return
      showDeleteDialog(state.selectedContextMovie)
    }
  }
])

const onRowContextMenu = (event: DataTableRowContextMenuEvent) => {
  state.selectedContextMovie = event.data
  cm.value.show(event.originalEvent)
}

const onRowClick = (event: DataTableRowClickEvent) => {
  goToMoviePage(event.data.id)
}

const fetchMovies = async () => {
  state.loading = true

  const params = {
    pageSize: String(state.pageSize),
    page: String(state.page),
    sortBy: state.sortBy,
    sortDir: state.sortDir,
    ...currentRoute.query,
    name: state.searchName ? state.searchName : '',
    genre: state.searchGenre ? state.searchGenre : '',
  }

  const response = await getPageableMovies(params)
  state.movieList = response.content
  state.totalRecords = response.totalElements
  state.totalPages = response.totalPages

  state.loading = false
}

const fetchGenreList = async () => {
  state.genreListLoading = true
  const response = await getAllMovieGenres()
  state.genreList = response
  state.genreListLoading = false
}

const capDescription = (value: string) => {
  return value ? value.substring(0, 100) + '...' : ''
}

const goToMoviePage = (id: number) => {
  router.push('/movies/' + id)
}

const resolver = ref(
  zodResolver(
    z.object({
      name: z.string().min(1, { message: 'Der Name wird benötigt.' }),
      year: z.union([
        z
          .number()
          .gt(1887, {
            message: "Der älteste Film ist der Kurzfilm 'Roundhay Garden Scene' aus dem Jahr 1888.",
          })
          .lt(new Date().getFullYear() + 1, {
            message: 'Filme aus der Zukunft werden nicht akzeptiert.',
          }),
        z.literal(null),
      ]),
      length: z.union([
        z.number().gt(0, { message: 'Muss länger als 0 Minuten sein.' }),
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
        'MOVIE',
        createFormValues.name,
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

    const movieResponse = await createNewMovie(createFormValues)

    if (!movieResponse) {
      if (createFormValues.posterFile) {
        console.log('Failed movie upload, Poster succeeded')
        toast.add({
          severity: 'error',
          summary: 'Das Bild wurde hochgeladen, aber der Film wurde nicht gespeichert',
          life: 5000,
        })
        return
      } else {
        console.log('Failed movie upload')
        toast.add({
          severity: 'error',
          summary: 'Der Film "' + createFormValues.name + '" existiert bereits',
          life: 5000,
        })
        return
      }
    }
    toast.add({
      severity: 'success',
      summary: 'Der Film "' + createFormValues.name + '" wurde gespeichert',
      life: 3000,
    })
    state.createDialogVisible = false
    fetchMovies()
    fetchGenreList()
  }
}

const onEditFormSubmit = async () => {
  const editMovieResponse = await editMovie(state.editDialogMovieId, editFormValues)

  if (editMovieResponse === false) {
    console.log('Failed movie edit')
    toast.add({
      severity: 'error',
      summary: 'Fehler beim Bearbeiten des Films "' + editFormValues.name + '"',
      life: 5000
    })
  } else {
    toast.add({
      severity: 'success',
      summary: 'Film "' + editFormValues.name + '" erfolgreich bearbeitet',
      life: 3000
    })
  }

  state.editDialogVisible = false
  fetchMovies()
}

const onDeleteFormSubmit = async () => {
  const deleteMovieResponse = await deleteMovie(state.deleteDialogMovieId)

  if (deleteMovieResponse === false) {
    console.log('Failed movie deletion')
    toast.add({
      severity: 'error',
      summary: 'Fehler beim Löschen des Films "' + state.deleteDialogMovieName + '"',
      life: 5000
    })
  } else {
    toast.add({
      severity: 'success',
      summary: 'Film "' + state.deleteDialogMovieName + '" erfolgreich gelöscht',
      life: 3000
    })
  }
  state.deleteDialogVisible = false
  fetchMovies()
}

const clearCreateDialogForm = () => {
  createFormValues.name = defaultFormValues.name
  createFormValues.description = defaultFormValues.description
  createFormValues.year = defaultFormValues.year
  createFormValues.length = defaultFormValues.length
  createFormValues.genres = defaultFormValues.genres
  createFormValues.posterFile = null
}

const showEditDialog = (movie: Movie) => {
  state.editDialogMovieId = Number.parseInt(String(movie.id), 10)
  editFormValues.name = movie.name
  editFormValues.description = movie.description ?? ''
  editFormValues.year = movie.year
  editFormValues.length = movie.length ?? 0
  editFormValues.genres = movie.genres ?? []
  state.editDialogVisible = true
}

const clearEditDialogForm = () => {
  state.editDialogVisible = false

  editFormValues.name = ''
  editFormValues.description = ''
  editFormValues.year = 0
  editFormValues.length = 0
  editFormValues.genres = []
}

const showDeleteDialog = async (movie: Movie) => {
  state.deleteDialogMovieName = movie.name
  state.deleteDialogMovieId = movie.id
  state.deleteDialogVisible = true
}

function onPosterSelect(event: FileUploadSelectEvent) {
  createFormValues.posterFile = event.files[0]
}

function onPosterRemove() {
  createFormValues.posterFile = null
}

fetchGenreList()
fetchMovies()
</script>

<template>
  <div class="card">
    <div class="font-semibold text-xl mb-4">Filme</div>
    <ContextMenu ref="cm" :model="contextMenuModel" @hide="state.selectedContextMovie = null">
      <template #item="{ item, props }">
        <a class="flex items-center" v-bind="props.action" :style="{ 'background-color': item.color, 'border-radius': '2px' }">
          <span :class="item.icon" />
          <span class="ml-2">{{ item.label }}</span>
        </a>
      </template>
    </ContextMenu>
    <DataTable
      lazy
      :value="state.movieList"
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
      :contextMenuSelection="state.selectedContextMovie"
      @rowContextmenu="onRowContextMenu"
      @rowClick="onRowClick"
      @page="state.page = $event.page"
      @update:rows="state.pageSize = $event"
      @update:sortField="state.sortBy = $event"
      @update:sortOrder="state.sortDir = ($event ?? 1) > 0 ? 'asc' : 'desc'"
    >
      <template #header>
        <div class="flex justify-end">
          <Button
            @click="state.createDialogVisible = true"
            type="button"
            label="Neu"
            icon="pi pi-plus"
          />
          <Select
            v-model="state.searchGenre"
            :options="state.genreList"
            filter
            optionLabel="name"
            optionValue="name"
            placeholder="Filtern nach Genre"
            showClear
            class="md:w-56 ml-2"
            :loading="state.genreListLoading"
            :disabled="state.genreListLoading"
          />
          <IconField class="ml-2">
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText v-model="state.searchName" placeholder="Suche..." />
            <InputIcon class="pi pi-times" style="cursor: pointer" @click="state.searchName = ''" />
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

    <!-- CREATE MOVIE FORM DIALOG -->
    <Dialog
      @afterHide="clearCreateDialogForm"
      v-model:visible="state.createDialogVisible"
      modal
      header="Neuen Film einfügen"
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
            />
            <Message
              v-if="$createForm.name?.invalid"
              severity="error"
              size="small"
              variant="simple"
              >{{ $createForm.name.error?.message }}</Message
            >
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
            <InputNumber
              v-model="createFormValues.length"
              name="length"
              class="w-full"
              :useGrouping="false"
            />
            <Message
              v-if="$createForm.length?.invalid"
              severity="error"
              size="small"
              variant="simple"
              >{{ $createForm.length.error?.message }}</Message
            >
            <label for="length">Länge (Min.)</label>
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

    <!-- EDIT MOVIE FORM DIALOG -->
    <Dialog
      @afterHide="clearEditDialogForm"
      v-model:visible="state.editDialogVisible"
      modal
      header="Film bearbeiten"
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
            />
            <Message
              v-if="$editForm.name?.invalid"
              severity="error"
              size="small"
              variant="simple"
              >{{ $editForm.name.error?.message }}</Message
            >
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
            <InputNumber
              v-model="editFormValues.length"
              name="length"
              class="w-full"
              :useGrouping="false"
            />
            <Message
              v-if="$editForm.length?.invalid"
              severity="error"
              size="small"
              variant="simple"
              >{{ $editForm.length.error?.message }}</Message
            >
            <label for="length">Länge (Min.)</label>
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
        <div class="field col-6">
          <Button type="submit" severity="success" label="Bestätigen" />
        </div>
      </Form>
    </Dialog>

    <!-- DELETE MOVIE FORM DIALOG -->
    <Dialog
      v-model:visible="state.deleteDialogVisible"
      modal
      header="Film löschen"
      :closable="false"
      :style="{ width: '32rem' }"
    >
      <div class="flex flex-col gap-4">
        <p>Möchten Sie den Film "{{ state.deleteDialogMovieName }}" wirklich löschen?</p>
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
