<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { getPageableSeries, createNewSeries } from '@/api/networks/series.network'
import { getAllGenres } from '@/api/networks/movies.network'
import { uploadNewPoster } from '@/api/networks/files.network'
import { useSeriesStore } from '@/stores/series.store'
import { Column, DataTable, type FileUploadSelectEvent } from 'primevue'
import { useRoute } from 'vue-router'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'
import { useToast } from 'primevue/usetoast'
import router from '@/router'
import type { Series, Genre } from '@/types/common'

const seriesStore = useSeriesStore()
const currentRoute = useRoute()
const toast = useToast()

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
})

const defaultFormValues = reactive<{
  name: string
  description: string
  yearStart: number
  yearEnd: number
  length: number
  genres: string[]
}>({
  name: '',
  description: '',
  yearStart: 0,
  yearEnd: 0,
  length: 0,
  genres: [],
})

const createFormValues = reactive<{
  name: string
  description: string
  yearStart: number
  yearEnd: number
  length: number
  genres: string[]
  posterFile: File | null
}>({
  name: '',
  description: '',
  yearStart: 0,
  yearEnd: 0,
  length: 0,
  genres: [],
  posterFile: null,
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
    key: 'ratingValue',
    title: 'Bewertung',
  },
])

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
  const response = await getAllGenres()
  state.genreList = response
  state.genreListLoading = false
}

const capDescription = (value: string) => {
  return value ? value.substring(0, 100) + '...' : ''
}

const goToSeriesPage = (series: Series) => {
  router.push('/series/' + series.id)
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
        console.log('Failed series upload, Poster succeeded')
        toast.add({
          severity: 'error',
          summary: 'Das Bild wurde hochgeladen, aber die Serie wurde nicht gespeichert',
          life: 5000,
        })
        return
      } else {
        console.log('Failed series upload')
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

const clearCreateDialogForm = () => {
  createFormValues.name = defaultFormValues.name
  createFormValues.description = defaultFormValues.description
  createFormValues.yearStart = defaultFormValues.yearStart
  createFormValues.yearEnd = defaultFormValues.yearEnd
  createFormValues.length = defaultFormValues.length
  createFormValues.genres = defaultFormValues.genres
  createFormValues.posterFile = null
}

function onPosterSelect(event: FileUploadSelectEvent) {
  createFormValues.posterFile = event.files[0]
}

function onPosterRemove() {
  createFormValues.posterFile = null
}

fetchGenreList()
fetchSeries()
</script>

<template>
  <div class="card">
    <div class="font-semibold text-xl mb-4">Serien</div>
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
            :src="`http://localhost:8080/api/file?filename=${data[header.key]}`"
            :alt="`${header.title || 'item'}.jpg`"
            style="width: 50px"
          />
          <span v-else-if="data[header.key].length > 100" v-tooltip.top="data[header.key]">{{
            capDescription(data[header.key])
          }}</span>
          <span v-else>{{ data[header.key] }}</span>
        </template>
      </Column>
      <Column class="w-24 text-end!">
        <template #body="{ data }">
          <Button
            icon="pi pi-info-circle"
            outline
            rounded
            class="mr-2"
            severity="info"
            @click="goToSeriesPage(data)"
          />
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
              class="flex-auto"
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
              v-model="createFormValues.yearStart"
              name="yearStart"
              class="flex-auto"
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
              class="flex-auto"
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
  </div>
</template>
