<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { getPageableSeries, createNewSeries, editSeries, deleteSeries } from '@/api/networks/series.network'
import { uploadNewPoster } from '@/api/networks/files.network'
import { useSeriesStore } from '@/stores/series.store'
import { Column, ContextMenu, DataTable, FileUpload, type DataTableRowClickEvent, type DataTableRowContextMenuEvent, type FileUploadSelectEvent } from 'primevue'
import { useRoute } from 'vue-router'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth.store'
import router from '@/router'
import type { Series, Genre } from '@/types/common'
import { getAllMovieGenres } from '@/api/networks/genres.network'
import { Times } from '@primeicons/vue'

const apiUrl = import.meta.env.VITE_API_URL
const seriesStore = useSeriesStore()
const authStore = useAuthStore()
const currentRoute = useRoute()
const toast = useToast()
const cm = ref<InstanceType<typeof ContextMenu> | null>(null)

const state = reactive<{
  seriesList: Series[]
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
  editDialogSeriesId: number
  deleteDialogVisible: boolean
  deleteDialogSeriesName: string
  deleteDialogSeriesId: number
  selectedContextSeries: Series | null
}>({
  seriesList: [],
  page: seriesStore.seriesPage,
  pageSize: seriesStore.seriesPageSize,
  sortBy: seriesStore.seriesSortBy,
  sortDir: seriesStore.seriesSortDir,
  totalRecords: 0,
  totalPages: undefined,
  loading: false,
  searchName: '',
  searchGenre: '',
  createDialogVisible: false,
  genreListLoading: false,
  genreList: [],
  editDialogVisible: false,
  editDialogSeriesId: 0,
  deleteDialogVisible: false,
  deleteDialogSeriesName: '',
  deleteDialogSeriesId: 0,
  selectedContextSeries: null
})

const defaultFormValues = reactive<{
  name: string
  description: string
  yearStart: number
  yearEnd: number
  episodeLength: number
  genres: string[]
}>({
  name: '',
  description: '',
  yearStart: 0,
  yearEnd: 0,
  episodeLength: 0,
  genres: [],
})

const createFormValues = reactive<{
  name: string
  description: string
  yearStart: number
  yearEnd: number
  episodeLength: number
  genres: string[]
  posterFile: File | null
}>({
  name: '',
  description: '',
  yearStart: 0,
  yearEnd: 0,
  episodeLength: 0,
  genres: [],
  posterFile: null,
})

const editFormValues = reactive<{
  name: string
  description: string
  yearStart: number
  yearEnd: number
  episodeLength: number
  genres: string[]
}>({
  name: '',
  description: '',
  yearStart: 0,
  yearEnd: 0,
  episodeLength: 0,
  genres: []
})

watch(
  () => state.pageSize,
  () => {
    fetchSeries()
    seriesStore.setSeriesPageSize(state.pageSize)
  },
)

watch(
  () => state.page,
  () => {
    fetchSeries()
    seriesStore.setSeriesPage(state.page)
  },
)

watch(
  () => state.sortBy,
  () => {
    fetchSeries()
    seriesStore.setSeriesSortBy(state.sortBy)
  },
)

watch(
  () => state.sortDir,
  () => {
    fetchSeries()
    seriesStore.setSeriesSortDir(state.sortDir)
  },
)

watch(
  () => currentRoute.query,
  () => {
    fetchSeries()
  },
)

watch(
  () => state.searchName,
  () => {
    fetchSeries()
  },
)

watch(
  () => state.searchGenre,
  () => {
    fetchSeries()
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
    key: 'yearStart',
    title: 'Erscheinungsjahr',
    sortable: true,
  },
  {
    key: 'episodeLength',
    title: 'Episodenlänge (Minuten)',
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
      return (authStore.decodedToken?.sub !== state.selectedContextSeries?.user?.username) &&
        (!authStore.isUserAdmin())
    },
    command: () => {
      if (state.selectedContextSeries == null) return
      showEditDialog(state.selectedContextSeries)
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
      return (authStore.decodedToken?.sub !== state.selectedContextSeries?.user?.username) &&
        (!authStore.isUserAdmin())
    },
    command: () => {
      if (state.selectedContextSeries == null) return
      showDeleteDialog(state.selectedContextSeries)
    }
  }
])

const onRowContextMenu = (event: DataTableRowContextMenuEvent) => {
  state.selectedContextSeries = event.data
  cm.value?.show(event.originalEvent)
}

const onRowClick = (event: DataTableRowClickEvent) => {
  goToSeriesPage(event.data.id)
}

const fetchSeries = async () => {
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

  const response = await getPageableSeries(params)
  state.seriesList = response.content
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

const goToSeriesPage = (id: number) => {
  router.push('/series/' + id)
}

const resolver = ref(
  zodResolver(
    z.object({
      name: z.string().min(1, { message: 'Der name wird benötigt.' }),
      yearStart: z.union([
        z
          .number()
          .gt(1887, {
            message: "Der älteste Film ist der Kurzfilm 'Roundhay Garden Scene' aus dem Jahr 1888.",
          })
          .lt(new Date().getFullYear() + 1, {
            message: 'Seroem aus der Zukunft werden nicht akzeptiert.',
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
        'SERIES',
        createFormValues.name,
        '',
        String(createFormValues.yearStart),
      )

      if (!posterResponse) {
        console.error('Failed image upload')
        toast.add({
          severity: 'error',
          summary: 'Ein Poster für "' + createFormValues.name + '" existiert bereits',
          life: 5000,
        })
        return
      }
    }

    const seriesResponse = await createNewSeries(createFormValues)

    if (!seriesResponse) {
      if (createFormValues.posterFile) {
        toast.add({
          severity: 'error',
          summary: 'Das Bild wurde hochgeladen, aber die Serie wurde nicht gespeichert',
          life: 5000,
        })
        return
      } else {
        toast.add({
          severity: 'error',
          summary: 'Die Serie "' + createFormValues.name + '" existiert bereits',
          life: 5000,
        })
        return
      }
    }
    toast.add({
      severity: 'success',
      summary: 'Die Serie "' + createFormValues.name + '" wurde gespeichert',
      life: 3000,
    })
    state.createDialogVisible = false
    fetchSeries()
    fetchGenreList()
  }
}

const onEditFormSubmit = async () => {
  const editSeriesResponse = await editSeries(state.editDialogSeriesId, editFormValues)

  if (editSeriesResponse === false) {
    toast.add({
      severity: 'error',
      summary: 'Fehler beim Bearbeiten der Serie "' + editFormValues.name + '"',
      life: 5000
    })
  } else {
    toast.add({
      severity: 'success',
      summary: 'Serie "' + editFormValues.name + '" erfolgreich bearbeitet',
      life: 3000
    })
  }

  state.editDialogVisible = false
  fetchSeries()
}

const onDeleteFormSubmit = async () => {
  const deleteSeriesResponse = await deleteSeries(state.deleteDialogSeriesId)

  if (deleteSeriesResponse === false) {
    toast.add({
      severity: 'error',
      summary: 'Fehler beim Löschen der Serie "' + state.deleteDialogSeriesName + '"',
      life: 5000
    })
  } else {
    toast.add({
      severity: 'success',
      summary: 'Serie "' + state.deleteDialogSeriesName + '" erfolgreich gelöscht',
      life: 3000
    })
  }
  state.deleteDialogVisible = false
  fetchSeries()
}

const clearCreateDialogForm = () => {
  createFormValues.name = defaultFormValues.name
  createFormValues.description = defaultFormValues.description
  createFormValues.yearStart = defaultFormValues.yearStart
  createFormValues.yearEnd = defaultFormValues.yearEnd
  createFormValues.episodeLength = defaultFormValues.episodeLength
  createFormValues.genres = defaultFormValues.genres
  createFormValues.posterFile = null
}

const showEditDialog = (series: Series) => {
  state.editDialogSeriesId = Number.parseInt(String(series.id), 10)
  editFormValues.name = series.name
  editFormValues.description = series.description ?? ''
  editFormValues.yearStart = series.yearStart
  editFormValues.yearEnd = series.yearEnd ?? new Date().getFullYear()
  editFormValues.episodeLength = series.episodeLength ?? 0
  editFormValues.genres = series.genres ?? []
  state.editDialogVisible = true
}

const clearEditDialogForm = () => {
  state.editDialogVisible = false

  editFormValues.name = ''
  editFormValues.description = ''
  editFormValues.yearStart = 0
  editFormValues.yearEnd = 0
  editFormValues.episodeLength = 0
  editFormValues.genres = []
}

const showDeleteDialog = async (series: Series) => {
  state.deleteDialogSeriesName = series.name
  state.deleteDialogSeriesId = series.id
  state.deleteDialogVisible = true
}

function onPosterSelect(event: FileUploadSelectEvent) {
  createFormValues.posterFile = event.files[0]
}

function onPosterRemove() {
  createFormValues.posterFile = null
}

onMounted(() => {
  fetchGenreList()
  fetchSeries()
})
</script>

<template>
  <div class="card">
    <div class="font-semibold text-xl mb-4">Serien</div>
    <ContextMenu ref="cm" :model="contextMenuModel" @hide="state.selectedContextSeries = null">
      <template #item="{ item, props }">
        <a class="flex items-center" v-bind="props.action" :style="{ 'background-color': item.color, 'border-radius': '2px' }">
          <span :class="item.icon" />
          <span class="ml-2">{{ item.label }}</span>
        </a>
      </template>
    </ContextMenu>
    <DataTable
      lazy
      :value="state.seriesList"
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
      :contextMenuSelection="state.selectedContextSeries"
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
            :showClear="state.searchGenre !== ''"
            class="md:w-56 ml-2"
            :loading="state.genreListLoading"
            :disabled="state.genreListLoading"
            aria-label="Filtern nach Genre"
          />
          <IconField class="ml-2">
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText v-model="state.searchName" placeholder="Suche..." />
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

    <!-- CREATE SERIES FORM DIALOG -->
    <Dialog
      @afterHide="clearCreateDialogForm"
      v-model:visible="state.createDialogVisible"
      modal
      header="Neue Serie einfügen"
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
              >{{ $createForm.name.error?.message }}</Message
            >
            <label for="name">Name</label>
          </FloatLabel>
        </div>
        <div class="field col-12 md:col-6">
          <FloatLabel variant="in">
            <InputNumber
              v-model="createFormValues.yearStart"
              name="yearStart"
              class="flex-auto w-full"
              :useGrouping="false"
            />
            <Message
              v-if="$createForm.yearStart?.invalid"
              severity="error"
              size="small"
              variant="simple"
              >{{ $createForm.yearStart.error?.message }}</Message
            >
            <label for="yearStart">Erscheinungsjahr</label>
          </FloatLabel>
        </div>
        <div class="field col-12 md:col-6">
          <FloatLabel variant="in">
            <InputNumber
              v-model="createFormValues.yearEnd"
              name="yearEnd"
              class="flex-auto w-full"
              :useGrouping="false"
            />
            <Message
              v-if="$createForm.yearEnd?.invalid"
              severity="error"
              size="small"
              variant="simple"
              >{{ $createForm.yearEnd.error?.message }}</Message
            >
            <label for="yearEnd">Endjahr</label>
          </FloatLabel>
        </div>
        <div class="field col-12">
          <FloatLabel variant="in">
            <Textarea
              v-model="createFormValues.description"
              id="description"
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
              v-model="createFormValues.episodeLength"
              name="episodeLength"
              class="w-full"
              :useGrouping="false"
            />
            <Message
              v-if="$createForm.episodeLength?.invalid"
              severity="error"
              size="small"
              variant="simple"
              >{{ $createForm.episodeLength.error?.message }}</Message
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

    <!-- EDIT SERIES FORM DIALOG -->
    <Dialog
      @afterHide="clearEditDialogForm"
      v-model:visible="state.editDialogVisible"
      modal
      header="Serie bearbeiten"
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
              >{{ $editForm.name.error?.message }}</Message
            >
            <label for="name">Name</label>
          </FloatLabel>
        </div>
        <div class="field col-12 md:col-6">
          <FloatLabel variant="in">
            <InputNumber
              v-model="editFormValues.yearStart"
              name="yearStart"
              class="flex-auto w-full"
              :useGrouping="false"
            />
            <Message
              v-if="$editForm.yearStart?.invalid"
              severity="error"
              size="small"
              variant="simple"
              >{{ $editForm.yearStart.error?.message }}</Message
            >
            <label for="yearStart">Erscheinungsjahr</label>
          </FloatLabel>
        </div>
        <div class="field col-12 md:col-6">
          <FloatLabel variant="in">
            <InputNumber
              v-model="editFormValues.yearEnd"
              name="yearEnd"
              class="flex-auto w-full"
              :useGrouping="false"
            />
            <Message
              v-if="$editForm.yearEnd?.invalid"
              severity="error"
              size="small"
              variant="simple"
              >{{ $editForm.yearEnd.error?.message }}</Message
            >
            <label for="yearEnd">Endjahr</label>
          </FloatLabel>
        </div>
        <div class="field col-12">
          <FloatLabel variant="in">
            <Textarea
              v-model="editFormValues.description"
              id="editDescription"
              name="editDescription"
              class="w-full"
              rows="5"
              style="resize: none"
            />
            <label for="editDescription">Beschreibung</label>
          </FloatLabel>
        </div>
        <div class="field col-12 md:col-6">
          <FloatLabel variant="in">
            <InputNumber
              v-model="editFormValues.episodeLength"
              name="episodeLength"
              class="w-full"
              :useGrouping="false"
            />
            <Message
              v-if="$editForm.episodeLength?.invalid"
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

    <!-- DELETE SERIES FORM DIALOG -->
    <Dialog
      v-model:visible="state.deleteDialogVisible"
      modal
      header="Serie löschen"
      :closable="false"
      :style="{ width: '32rem' }"
    >
      <div class="flex flex-col gap-4">
        <p>Möchten Sie die Serie "{{ state.deleteDialogSeriesName }}" wirklich löschen?</p>
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
