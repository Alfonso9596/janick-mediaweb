<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { getPageableMusic, createNewMusic, editMusic, deleteMusic } from '@/api/networks/music.network'
import { uploadNewPoster } from '@/api/networks/files.network'
import { useMusicStore } from '@/stores/music.store'
import { Column, ContextMenu, DataTable, FileUpload, type DataTableRowClickEvent, type DataTableRowContextMenuEvent, type FileUploadSelectEvent } from 'primevue'
import { useRoute } from 'vue-router'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth.store'
import router from '@/router'
import type { Music, Genre } from '@/types/common'
import { getAllMusicGenres } from '@/api/networks/genres.network'
import { Times } from '@primeicons/vue'

const apiUrl = import.meta.env.VITE_API_URL
const musicStore = useMusicStore()
const authStore = useAuthStore()
const currentRoute = useRoute()
const toast = useToast()
const cm = ref()

const state = reactive<{
  musicList: Music[]
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
  editDialogMusicId: number
  deleteDialogVisible: boolean
  deleteDialogMusicName: string
  deleteDialogMusicId: number
  selectedContextMusic: Music | null
}>({
  musicList: [],
  page: musicStore.musicPage,
  pageSize: musicStore.musicPageSize,
  sortBy: musicStore.musicSortBy,
  sortDir: musicStore.musicSortDir,
  totalRecords: 0,
  totalPages: undefined,
  loading: false,
  searchName: '',
  searchGenre: '',
  createDialogVisible: false,
  genreListLoading: false,
  genreList: [],
  editDialogVisible: false,
  editDialogMusicId: 0,
  deleteDialogVisible: false,
  deleteDialogMusicName: '',
  deleteDialogMusicId: 0,
  selectedContextMusic: null
})

const defaultFormValues = reactive<{
  name: string
  artist: string
  description: string
  year: number
  genres: string[]
}>({
  name: '',
  artist: '',
  description: '',
  year: 0,
  genres: []
})

const createFormValues = reactive<{
  name: string
  artist: string
  description: string
  year: number
  genres: string[]
  posterFile: File | null
}>({
  name: '',
  artist: '',
  description: '',
  year: 0,
  genres: [],
  posterFile: null
})

const editFormValues = reactive<{
  name: string
  artist: string
  description: string
  year: number
  genres: string[]
}>({
  name: '',
  artist: '',
  description: '',
  year: 0,
  genres: []
})

watch(
  () => state.pageSize,
  () => {
    fetchMusic()
    musicStore.setMusicPageSize(state.pageSize)
  },
)

watch(
  () => state.page,
  () => {
    fetchMusic()
    musicStore.setMusicPage(state.page)
  },
)

watch(
  () => state.sortBy,
  () => {
    fetchMusic()
    musicStore.setMusicSortBy(state.sortBy)
  },
)

watch(
  () => state.sortDir,
  () => {
    fetchMusic()
    musicStore.setMusicSortDir(state.sortDir)
  },
)

watch(
  () => currentRoute.query,
  () => {
    fetchMusic()
  },
)

watch(
  () => state.searchName,
  () => {
    fetchMusic()
  },
)

watch(
  () => state.searchGenre,
  () => {
    fetchMusic()
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
    key: 'artist',
    title: 'Künstler',
    sortable: true
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
      return (authStore.decodedToken?.sub !== state.selectedContextMusic?.user?.username) &&
        (!authStore.roles?.includes('ADMIN'))
    },
    command: () => {
      if (state.selectedContextMusic == null) return
      showEditDialog(state.selectedContextMusic)
    }
  },
  {
    separator: true
  },
  {
    label: 'Löschen',
    icon: 'pi pi-trash',
    disabled: () => {
      return (authStore.decodedToken?.sub !== state.selectedContextMusic?.user?.username) &&
        (!authStore.roles?.includes('ADMIN'))
    },
    command: () => {
      if (state.selectedContextMusic == null) return
      showDeleteDialog(state.selectedContextMusic)
    }
  }
])

const onRowContextMenu = (event: DataTableRowContextMenuEvent) => {
  state.selectedContextMusic = event.data
  cm.value.show(event.originalEvent)
}

const onRowClick = (event: DataTableRowClickEvent) => {
  goToMusicPage(event.data.id)
}

const fetchMusic = async () => {
  state.loading = true

  const params = {
    pageSize: String(state.pageSize),
    page: String(state.page),
    sortBy: state.sortBy,
    sortDir: state.sortDir,
    ...currentRoute.query,
    name: state.searchName ? state.searchName : '',
    artist: state.searchName ? state.searchName : '',
    genre: state.searchGenre ? state.searchGenre : ''
  }

  const response = await getPageableMusic(params)
  state.musicList = response.content
  state.totalRecords = response.totalElements
  state.totalPages = response.totalPages

  state.loading = false
}

const fetchGenreList = async () => {
  state.genreListLoading = true
  const response = await getAllMusicGenres()
  state.genreList = response
  state.genreListLoading = false
}

const capDescription = (value: string) => {
  return value ? value.substring(0, 100) + '...' : ''
}

const goToMusicPage = (id: number) => {
  router.push('/music/' + id)
}

const resolver = ref(
  zodResolver(
    z.object({
      name: z.string().min(1, 'Name ist erforderlich'),
      artist: z.string().min(1, 'Künstler ist erforderlich'),
      year: z.union([
        z
          .number()
          .gt(1, {
            message: 'Das Jahr ist erforderlich und muss größer als 1 sein',
          })
          .lt(new Date().getFullYear() + 1, {
            message: 'Das Jahr darf nicht in der Zukunft liegen',
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
        'MUSIC',
        createFormValues.name,
        createFormValues.artist,
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

    const musicResponse = await createNewMusic(createFormValues)

    if (!musicResponse) {
      if (createFormValues.posterFile) {
        toast.add({
          severity: 'error',
          summary: 'Das Musikstück "' + createFormValues.name + '" konnte nicht erstellt werden, obwohl das Poster erfolgreich hochgeladen wurde.',
          life: 5000,
        })
        return
      }
    }
    toast.add({
      severity: 'success',
      summary: 'Das Musikstück "' + createFormValues.name + '" wurde erfolgreich erstellt.',
      life: 3000,
    })
    state.createDialogVisible = false
    fetchMusic()
    fetchGenreList()
  }
}

const onEditFormSubmit = async () => {
  const editMusicResponse = await editMusic(state.editDialogMusicId, editFormValues)

  if (editMusicResponse === false) {
    toast.add({
      severity: 'error',
      summary: 'Das Musikstück "' + editFormValues.name + '" konnte nicht bearbeitet werden.',
      life: 5000,
    })
  } else {
    toast.add({
      severity: 'success',
      summary: 'Das Musikstück "' + editFormValues.name + '" wurde erfolgreich bearbeitet.',
      life: 3000,
    })
    state.editDialogVisible = false
    fetchMusic()
  }
}

const onDeleteFormSubmit = async () => {
  const deleteMusicResponse = await deleteMusic(state.deleteDialogMusicId)

  if (deleteMusicResponse === false) {
    toast.add({
      severity: 'error',
      summary: 'Das Musikstück "' + state.deleteDialogMusicName + '" konnte nicht gelöscht werden.',
      life: 5000,
    })
  } else {
    toast.add({
      severity: 'success',
      summary: 'Das Musikstück "' + state.deleteDialogMusicName + '" wurde erfolgreich gelöscht.',
      life: 3000,
    })
    state.deleteDialogVisible = false
    fetchMusic()
  }
}

const clearCreateDialogForm = () => {
  createFormValues.name = defaultFormValues.name
  createFormValues.artist = defaultFormValues.artist
  createFormValues.description = defaultFormValues.description
  createFormValues.year = defaultFormValues.year
  createFormValues.genres = defaultFormValues.genres
  createFormValues.posterFile = null
}

const showEditDialog = (music: Music) => {
  state.editDialogMusicId = Number.parseInt(String(music.id), 10)
  editFormValues.name = music.name
  editFormValues.artist = music.artist
  editFormValues.description = music.description ?? ''
  editFormValues.year = music.year
  editFormValues.genres = music.genres ?? []
  state.editDialogVisible = true
}

const clearEditDialogForm = () => {
  state.editDialogVisible = false

  editFormValues.name = ''
  editFormValues.artist = ''
  editFormValues.description = ''
  editFormValues.year = 0
  editFormValues.genres = []
}

const showDeleteDialog = async (music: Music) => {
  state.deleteDialogMusicId = music.id
  state.deleteDialogMusicName = music.name
  state.deleteDialogVisible = true
}

function onPosterSelect(event: FileUploadSelectEvent) {
  createFormValues.posterFile = event.files[0]
}

function onPosterRemove() {
  createFormValues.posterFile = null
}

fetchGenreList()
fetchMusic()
</script>

<template>
  <div class="card">
    <div class="font-semibold text-xl mb-4">Musik</div>
    <ContextMenu ref="cm" :model="contextMenuModel" @hide="state.selectedContextMusic = null">
      <template #item="{ item, props }">
        <a class="flex items-center" v-bind="props.action" :style="{ 'background-color': item.color, 'border-radius': '2px' }">
          <span :class="item.icon" />
          <span class="ml-2">{{ item.label }}</span>
        </a>
      </template>
    </ContextMenu>
    <DataTable
      lazy
      :value="state.musicList"
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
      :contextMenuSelection="state.selectedContextMusic"
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
          <span v-else-if="data[header.key].length > 100" v-tooltip.top="data[header.key]">
            {{ capDescription(data[header.key]) }}
          </span>
          <span v-else-if="header.rating">
            <b>{{ data[header.key] }}</b>
            <i class="pi pi-star-fill ml-2" style="color: #dfbf13" />
          </span>
          <span v-else>{{ data[header.key] }}</span>
        </template>
      </Column>
    </DataTable>

    <!-- CREATE MUSIC FORM DIALOG -->
    <Dialog
      @afterHide="clearCreateDialogForm"
      v-model:visible="state.createDialogVisible"
      modal
      header="Neue Musik einfügen"
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
        <div class="field col-12 md:col-6">
          <FloatLabel variant="in">
            <InputText
              v-model="createFormValues.artist"
              name="artist"
              class="flex-auto w-full"
              autocomplete="off"
            />
            <Message
              v-if="$createForm.artist?.invalid"
              severity="error"
              size="small"
              variant="simple"
              >{{ $createForm.artist.error?.message }}</Message>
              <label for="artist">Künstler</label>
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

    <!-- EDIT MUSIC FORM DIALOG -->
    <Dialog
      @afterHide="clearEditDialogForm"
      v-model:visible="state.editDialogVisible"
      modal
      header="Musik bearbeiten"
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
        <div class="field col-12 md:col-6">
          <FloatLabel variant="in">
            <InputText
              v-model="editFormValues.artist"
              name="artist"
              class="flex-auto w-full"
              autocomplete="off"
            />
            <Message
              v-if="$editForm.artist?.invalid"
              severity="error"
              size="small"
              variant="simple"
              >{{ $editForm.artist.error?.message }}</Message>
              <label for="artist">Künstler</label>
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
        <div class="field col-6">
          <Button type="submit" severity="success" label="Bestätigen" />
        </div>
      </Form>
    </Dialog>

    <!-- DELETE MUSIC FORM DIALOG -->
    <Dialog
      v-model:visible="state.deleteDialogVisible"
      modal
      header="Musik löschen"
      :closable="false"
      :style="{ width: '32rem' }"
    >
      <div class="flex flex-col gap-4">
        <p>Möchten Sie die Musik "{{ state.deleteDialogMusicName }}" wirklich löschen?</p>
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
