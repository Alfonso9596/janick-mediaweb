<script setup lang="ts">
import { Column, ContextMenu, DataTable, FloatLabel, InputText, Message, type DataTableRowContextMenuEvent } from 'primevue'
import { createGameGenre, deleteGameGenre, editGameGenre, getPageableGameGenres } from '@/api/networks/genres.network'
import { computed, reactive, ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'
import type { Genre } from '@/types/common'

const toast = useToast()
const cm = ref()

const state = reactive<{
  gameGenreList: Genre[]
  totalRecords: number
  totalPages: number
  page: number
  pageSize: number
  sortBy: string
  sortDir: 'asc' | 'desc'
  loading: boolean
  searchName: string
  createDialogVisible: boolean
  editDialogVisible: boolean
  editDialogGenreId: number
  deleteDialogVisible: boolean
  deleteDialogGenreName: string
  deleteDialogGenreId: number
  selectedContextGameGenre: Genre | null
}>({
  gameGenreList: [],
  totalRecords: 0,
  totalPages: 0,
  page: 0,
  pageSize: 10,
  sortBy: 'name',
  sortDir: 'asc',
  loading: false,
  searchName: '',
  createDialogVisible: false,
  editDialogVisible: false,
  editDialogGenreId: 0,
  deleteDialogVisible: false,
  deleteDialogGenreName: '',
  deleteDialogGenreId: 0,
  selectedContextGameGenre: null
})

const headers = computed(() => [
  {
    key: 'name',
    title: 'Name',
    sortable: true
  }
])

const contextMenuModel = ref([
  {
    label: 'Bearbeiten',
    icon: 'pi pi-pencil',
    command: () => {
      if (state.selectedContextGameGenre == null) return
      showEditGameGenreDialog(state.selectedContextGameGenre)
    }
  },
  {
    label: 'Löschen',
    icon: 'pi pi-trash',
    color: '#c73c3c',
    command: () => {
      if (state.selectedContextGameGenre == null) return
      showDeleteGameGenreDialog(state.selectedContextGameGenre)
    }
  }
])

const onRowContextMenu = (event: DataTableRowContextMenuEvent) => {
  state.selectedContextGameGenre = event.data
  cm.value.show(event.originalEvent)
}

const createGameGenreInitialValues = reactive<{
  name: string
}>({
  name: ''
})

const createGameGenreFormValues = reactive<{
  name: string
}>({
  name: ''
})

const editGameGenreFormValues = reactive<{
  name: string
}>({
  name: ''
})

const resolver = ref(
  zodResolver(
    z.object({
      name: z.string().min(3, 'Das Genre muss mindestends 3 Zeichen lang sein.')
    })
  )
)

const onCreateGameGenreFormSubmit = async (e: { valid: boolean }) => {
  if (e.valid) {
    const createGameGenreResponse = await createGameGenre(createGameGenreFormValues)

    if (!createGameGenreResponse) {
      console.log('Failed genre creation')
      toast.add({
        severity: 'error',
        summary: 'Genre "' + createGameGenreFormValues.name + '" existiert bereits',
        life: 5000,
      })
      return
    }
    toast.add({
      severity: 'success',
      summary: 'Genre "' + createGameGenreFormValues.name + '" erfolgreich erstellt',
      life: 3000
    })
    state.createDialogVisible = false
  }
  fetchGameGenres()
}

const onEditGameGenreFormSubmit = async () => {
  const editGameGenreResponse = await editGameGenre(state.editDialogGenreId, editGameGenreFormValues)

  if (editGameGenreResponse === false) {
    console.log('Failed game genre edit')
    toast.add({
      severity: 'error',
      summary: 'Fehler beim Bearbeiten des Genres "' + editGameGenreFormValues.name + '"',
      life: 5000
    })
  } else {
    toast.add({
      severity: 'success',
      summary: 'Genre "' + editGameGenreFormValues.name + '" erfolgreich bearbeitet',
      life: 3000
    })
  }
  state.editDialogVisible = false
  fetchGameGenres()
}

const onDeleteGameGenreFormSubmit = async () => {
  const deleteGameGenreResponse = await deleteGameGenre(state.deleteDialogGenreId)

  if (deleteGameGenreResponse === false) {
    console.log('Failed game genre deletion')
    toast.add({
      severity: 'error',
      summary: 'Fehler beim Löschen des Genres "' + state.deleteDialogGenreName + '"',
      life: 5000
    })
  } else {
    toast.add({
      severity: 'success',
      summary: 'Genre "' + state.deleteDialogGenreName + '" erfolgreich gelöscht',
      life: 3000
    })
  }
  state.deleteDialogVisible = false
  fetchGameGenres()
}

const clearCreateDialogForm = () => {
  createGameGenreFormValues.name = ''
}

const showEditGameGenreDialog = (genre: Genre) => {
  state.editDialogGenreId = genre.id
  editGameGenreFormValues.name = genre.name
  state.editDialogVisible = true
}

const clearEditDialogForm = () => {
  state.editDialogVisible = false

  editGameGenreFormValues.name = ''
}

const showDeleteGameGenreDialog = async (genre: Genre) => {
  state.deleteDialogGenreName = genre.name
  state.deleteDialogGenreId = genre.id
  state.deleteDialogVisible = true
}

watch(
  () => [
    state.page,
    state.pageSize,
    state.sortBy,
    state.sortDir,
    state.searchName
  ],
  () => {
    fetchGameGenres()
  }
)

const fetchGameGenres = async () => {
  state.loading = true

  const params = {
    pageSize: String(state.pageSize),
    page: String(state.page),
    sortBy: state.sortBy,
    sortDir: state.sortDir,
    name: state.searchName ? state.searchName : ''
  }

  const response = await getPageableGameGenres(params)
  state.gameGenreList = response.content
  state.totalRecords = response.totalElements
  state.totalPages = response.totalPages

  state.loading = false
}

fetchGameGenres()
</script>

<template>
  <div class="card">
    <div class="font-semibold text-xl mb-4">Genreübersicht (Spiele)</div>
    <ContextMenu ref="cm" :model="contextMenuModel" @hide="state.selectedContextGameGenre = null">
      <template #item="{ item, props }">
        <a class="flex items-center" v-bind="props.action" :style="{ 'background-color': item.color, 'border-radius': '2px' }">
          <span :class="item.icon" />
          <span class="ml-2">{{ item.label }}</span>
        </a>
      </template>
    </ContextMenu>
    <DataTable
      lazy
      :value="state.gameGenreList"
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
      :contextMenuSelection="state.selectedContextGameGenre"
      @rowContextmenu="onRowContextMenu"
      @page="state.page = $event.page"
      @update:rows="state.pageSize = $event"
      @update:sortFields="state.sortBy = $event"
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
          <IconField class="ml-2">
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText v-model="state.searchName" placeholder="Suche..." />
            <InputIcon class="pi pi-times cursor-pointer" @click="state.searchName = ''" />
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
          <span>{{ data[header.key] }}</span>
        </template>
      </Column>
    </DataTable>

    <!-- CREATE GAME GENRE FORM DIALOG -->
    <Dialog
      @afterHide="clearCreateDialogForm"
      v-model:visible="state.createDialogVisible"
      modal
      header="Genre erstellen"
      :style="{ width: '32rem' }"
    >
      <Form
        v-slot="$createForm"
        :resolver="resolver"
        :initialValues="createGameGenreInitialValues"
        @submit="onCreateGameGenreFormSubmit"
        class="formgrid grid"
      >
        <div class="field col-12">
          <FloatLabel variant="in">
            <InputText
              v-model="createGameGenreFormValues.name"
              name="name"
              class="flex-auto"
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
        <div class="field col-6">
          <Button type="submit" severity="success" label="Bestätigen" />
        </div>
      </Form>
    </Dialog>

    <!-- EDIT GAME GENRE FORM DIALOG -->
    <Dialog
      @afterHide="clearEditDialogForm"
      v-model:visible="state.editDialogVisible"
      modal
      header="Genre bearbeiten"
      :style="{ width: '32rem' }"
    >
      <Form
        v-slot="$editForm"
        :resolver="resolver"
        @submit="onEditGameGenreFormSubmit"
        class="formgrid grid"
      >
        <div class="field col-12">
          <FloatLabel variant="in">
            <InputText
              v-model="editGameGenreFormValues.name"
              name="name"
              class="flex-auto"
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
        <div class="field col-6">
          <Button type="submit" severity="success" label="Bestätigen" />
        </div>
      </Form>
    </Dialog>

    <!-- DELETE GAME GENRE FORM DIALOG -->
    <Dialog
      v-model:visible="state.deleteDialogVisible"
      modal
      header="Genre löschen"
      :closable="false"
      :style="{ width: '32rem' }"
    >
      <div class="flex flex-col gap-4">
        <p>Möchten Sie das Genre "{{ state.deleteDialogGenreName }}" wirklich löschen?</p>
        <div class="flex justify-end gap-2">
          <Button
            label="Abbrechen"
            severity="secondary"
            @click="state.deleteDialogVisible = false"
          />
          <Button
            label="Löschen"
            severity="danger"
            @click="onDeleteGameGenreFormSubmit"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>
