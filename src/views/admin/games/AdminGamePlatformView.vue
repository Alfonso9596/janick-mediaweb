<script setup lang="ts">
import { Column, ContextMenu, DataTable, FloatLabel, InputText, Message, type DataTableRowContextMenuEvent } from 'primevue'
import { createGamePlatform, deleteGamePlatform, editGamePlatform, getPageableGamePlatforms } from '@/api/networks/platforms.network'
import { computed, reactive, ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import type { Platform } from '@/types/common'

const toast = useToast()
const cm = ref()

const state = reactive<{
  gamePlatformList: Platform[]
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
  editDialogPlatformId: number
  deleteDialogVisible: boolean
  deleteDialogPlatformName: string
  deleteDialogPlatformId: number
  selectedContextGamePlatform: Platform | null
}>({
  gamePlatformList: [],
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
  editDialogPlatformId: 0,
  deleteDialogVisible: false,
  deleteDialogPlatformName: '',
  deleteDialogPlatformId: 0,
  selectedContextGamePlatform: null
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
      if (state.selectedContextGamePlatform == null) return
      showEditGamePlatformDialog(state.selectedContextGamePlatform)
    }
  },
  {
    label: 'Löschen',
    icon: 'pi pi-trash',
    color: '#c73c3c',
    command: () => {
      if (state.selectedContextGamePlatform == null) return
      showDeleteGamePlatformDialog(state.selectedContextGamePlatform)
    }
  }
])

const onRowContextMenu = (event: DataTableRowContextMenuEvent) => {
  state.selectedContextGamePlatform = event.data
  cm.value.show(event.originalEvent)
}

const createGamePlatformInitialValues = reactive<{
  name: string
}>({
  name: ''
})

const createGamePlatformFormValues = reactive<{
  name: string
}>({
  name: ''
})

const editGamePlatformFormValues = reactive<{
  name: string
}>({
  name: ''
})

const onCreateGamePlatformFormSubmit = async (e: { valid: boolean }) => {
  if (e.valid) {
    const createGamePlatformResponse = await createGamePlatform(createGamePlatformFormValues)

    if (!createGamePlatformResponse) {
      console.log('Failed platform creation')
      toast.add({
        severity: 'error',
        summary: 'Plattform "' + createGamePlatformFormValues.name + '" existiert bereits',
        life: 5000,
      })
      return
    }
    toast.add({
      severity: 'success',
      summary: 'Plattform "' + createGamePlatformFormValues.name + '" erfolgreich erstellt',
      life: 3000
    })
    state.createDialogVisible = false
  }
  fetchGamePlatforms()
}

const onEditGamePlatformFormSubmit = async () => {
  const editGamePlatformResponse = await editGamePlatform(state.editDialogPlatformId, editGamePlatformFormValues)

  if (editGamePlatformResponse === false) {
    console.log('Failed game platform edit')
    toast.add({
      severity: 'error',
      summary: 'Fehler beim Bearbeiten der Plattform "' + editGamePlatformFormValues.name + '"',
      life: 5000
    })
  } else {
    toast.add({
      severity: 'success',
      summary: 'Plattform "' + editGamePlatformFormValues.name + '" erfolgreich bearbeitet',
      life: 3000
    })
  }
  state.editDialogVisible = false
  fetchGamePlatforms()
}

const onDeleteGamePlatformFormSubmit = async () => {
  const deleteGamePlatformResponse = await deleteGamePlatform(state.deleteDialogPlatformId)

  if (deleteGamePlatformResponse === false) {
    console.log('Failed game platform deletion')
    toast.add({
      severity: 'error',
      summary: 'Fehler beim Löschen der Plattform "' + state.deleteDialogPlatformName + '"',
      life: 5000
    })
  } else {
    toast.add({
      severity: 'success',
      summary: 'Plattform "' + state.deleteDialogPlatformName + '" erfolgreich gelöscht',
      life: 3000
    })
  }
  state.deleteDialogVisible = false
  fetchGamePlatforms()
}

const clearCreateDialogForm = () => {
  createGamePlatformFormValues.name = ''
}

const showEditGamePlatformDialog = (platform: Platform) => {
  state.editDialogPlatformId = platform.id
  editGamePlatformFormValues.name = platform.name
  state.editDialogVisible = true
}

const clearEditDialogForm = () => {
  state.editDialogVisible = false

  editGamePlatformFormValues.name = ''
}

const showDeleteGamePlatformDialog = async (platform: Platform) => {
  state.deleteDialogPlatformName = platform.name
  state.deleteDialogPlatformId = platform.id
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
    fetchGamePlatforms()
  }
)

const fetchGamePlatforms = async () => {
  state.loading = true

  const params = {
    pageSize: String(state.pageSize),
    page: String(state.page),
    sortBy: state.sortBy,
    sortDir: state.sortDir,
    name: state.searchName ? state.searchName : ''
  }

  const response = await getPageableGamePlatforms(params)
  state.gamePlatformList = response.content
  state.totalRecords = response.totalElements
  state.totalPages = response.totalPages

  state.loading = false
}

fetchGamePlatforms()
</script>

<template>
  <div class="card">
    <div class="font-semibold text-xl mb-4">Plattformübersicht (Spiele)</div>
    <ContextMenu ref="cm" :model="contextMenuModel" @hide="state.selectedContextGamePlatform = null">
      <template #item="{ item, props }">
        <a class="flex items-center" v-bind="props.action" :style="{ 'background-color': item.color, 'border-radius': '2px' }">
          <span :class="item.icon" />
          <span class="ml-2">{{ item.label }}</span>
        </a>
      </template>
    </ContextMenu>
    <DataTable
      lazy
      :value="state.gamePlatformList"
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
      :contextMenuSelection="state.selectedContextGamePlatform"
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

    <!-- CREATE GAME PLATFORM FORM DIALOG -->
    <Dialog
      @afterHide="clearCreateDialogForm"
      v-model:visible="state.createDialogVisible"
      modal
      header="Plattform erstellen"
      :style="{ width: '32rem' }"
    >
      <Form
        v-slot="$createForm"
        :initialValues="createGamePlatformInitialValues"
        @submit="onCreateGamePlatformFormSubmit"
        class="formgrid grid"
      >
        <div class="field col-12">
          <FloatLabel variant="in">
            <InputText
              v-model="createGamePlatformFormValues.name"
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

    <!-- EDIT GAME PLATFORM FORM DIALOG -->
    <Dialog
      @afterHide="clearEditDialogForm"
      v-model:visible="state.editDialogVisible"
      modal
      header="Plattform bearbeiten"
      :style="{ width: '32rem' }"
    >
      <Form
        v-slot="$editForm"
        @submit="onEditGamePlatformFormSubmit"
        class="formgrid grid"
      >
        <div class="field col-12">
          <FloatLabel variant="in">
            <InputText
              v-model="editGamePlatformFormValues.name"
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

    <!-- DELETE GAME PLATFORM FORM DIALOG -->
    <Dialog
      v-model:visible="state.deleteDialogVisible"
      modal
      header="Plattform löschen"
      :closable="false"
      :style="{ width: '32rem' }"
    >
      <div class="flex flex-col gap-4">
        <p>Möchten Sie die Plattform "{{ state.deleteDialogPlatformName }}" wirklich löschen?</p>
        <div class="flex justify-end gap-2">
          <Button
            label="Abbrechen"
            severity="secondary"
            @click="state.deleteDialogVisible = false"
          />
          <Button
            label="Löschen"
            severity="danger"
            @click="onDeleteGamePlatformFormSubmit"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>
