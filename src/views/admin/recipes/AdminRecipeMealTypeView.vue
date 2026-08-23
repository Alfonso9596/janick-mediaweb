<script setup lang="ts">
import { Column, ContextMenu, DataTable, FloatLabel, InputText, Message, type DataTableRowContextMenuEvent } from 'primevue'
import { createMealType, deleteMealType, editMealType, getPageableMealTypes } from '@/api/networks/mealTypes.network'
import { computed, reactive, ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'
import type { MealType } from '@/types/common'

const toast = useToast()
const cm = ref()

const state = reactive<{
  mealTypeList: MealType[]
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
  editDialogMealTypeId: number
  deleteDialogVisible: boolean
  deleteDialogMealTypeName: string
  deleteDialogMealTypeId: number
  selectedContextMealType: MealType | null
}>({
  mealTypeList: [],
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
  editDialogMealTypeId: 0,
  deleteDialogVisible: false,
  deleteDialogMealTypeName: '',
  deleteDialogMealTypeId: 0,
  selectedContextMealType: null
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
      if (state.selectedContextMealType == null) return
      showEditMealTypeDialog(state.selectedContextMealType)
    }
  },
  {
    label: 'Löschen',
    icon: 'pi pi-trash',
    color: '#c73c3c',
    command: () => {
      if (state.selectedContextMealType == null) return
      showDeleteMealTypeDialog(state.selectedContextMealType)
    }
  }
])

const onRowContextMenu = (event: DataTableRowContextMenuEvent) => {
  state.selectedContextMealType = event.data
  cm.value.show(event.originalEvent)
}

const createMealTypeInitialValues = reactive<{
  name: string
}>({
  name: ''
})

const createMealTypeFormValues = reactive<{
  name: string
}>({
  name: ''
})

const editMealTypeFormValues = reactive<{
  name: string
}>({
  name: ''
})

const resolver = ref(
  zodResolver(
    z.object({
      name: z.string().min(3, 'Die Mahlzeitart muss mindestens 3 Zeichen lang sein.')
    })
  )
)

const onCreateMealTypeFormSubmit = async (e: { valid: boolean }) => {
  if (e.valid) {
    const createMealTypeResponse = await createMealType(createMealTypeFormValues)

    if (!createMealTypeResponse) {
      toast.add({
        severity: 'error',
        summary: 'Mahlzeitart "' + createMealTypeFormValues.name + '" existiert bereits',
        life: 5000,
      })
      return
    }
    toast.add({
      severity: 'success',
      summary: 'Mahlzeitart "' + createMealTypeFormValues.name + '" erfolgreich erstellt',
      life: 3000
    })
    state.createDialogVisible = false
  }
  fetchMealTypes()
}

const onEditMealTypeFormSubmit = async () => {
  const editMealTypeResponse = await editMealType(state.editDialogMealTypeId, editMealTypeFormValues)

  if (editMealTypeResponse === false) {
    toast.add({
      severity: 'error',
      summary: 'Fehler beim Bearbeiten der Mahlzeitart "' + editMealTypeFormValues.name + '"',
      life: 5000
    })
  } else {
    toast.add({
      severity: 'success',
      summary: 'Mahlzeitart "' + editMealTypeFormValues.name + '" erfolgreich bearbeitet',
      life: 3000
    })
  }
  state.editDialogVisible = false
  fetchMealTypes()
}

const onDeleteMealTypeFormSubmit = async () => {
  const deleteMealTypeResponse = await deleteMealType(state.deleteDialogMealTypeId)

  if (deleteMealTypeResponse === false) {
    toast.add({
      severity: 'error',
      summary: 'Fehler beim Löschen der Mahlzeitart "' + state.deleteDialogMealTypeName + '"',
      life: 5000
    })
  } else {
    toast.add({
      severity: 'success',
      summary: 'Mahlzeitart "' + state.deleteDialogMealTypeName + '" erfolgreich gelöscht',
      life: 3000
    })
  }
  state.deleteDialogVisible = false
  fetchMealTypes()
}

const clearCreateDialogForm = () => {
  createMealTypeFormValues.name = ''
}

const showEditMealTypeDialog = (mealType: MealType) => {
  state.editDialogMealTypeId = mealType.id
  editMealTypeFormValues.name = mealType.name
  state.editDialogVisible = true
}

const clearEditDialogForm = () => {
  state.editDialogVisible = false

  editMealTypeFormValues.name = ''
}

const showDeleteMealTypeDialog = async (mealType: MealType) => {
  state.deleteDialogMealTypeName = mealType.name
  state.deleteDialogMealTypeId = mealType.id
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
    fetchMealTypes()
  }
)

const fetchMealTypes = async () => {
  state.loading = true

  const params = {
    pageSize: String(state.pageSize),
    page: String(state.page),
    sortBy: state.sortBy,
    sortDir: state.sortDir,
    name: state.searchName ? state.searchName : ''
  }

  const response = await getPageableMealTypes(params)
  state.mealTypeList = response.content
  state.totalRecords = response.totalElements
  state.totalPages = response.totalPages

  state.loading = false
}

fetchMealTypes()
</script>

<template>
  <div class="card">
    <div class="font-semibold text-xl mb-4">Mahlzeitartenübersicht (Rezepte)</div>
    <ContextMenu ref="cm" :model="contextMenuModel" @hide="state.selectedContextMealType = null">
      <template #item="{ item, props }">
        <a class="flex items-center" v-bind="props.action" :style="{ 'background-color': item.color, 'border-radius': '2px' }">
          <span :class="item.icon" />
          <span class="ml-2">{{ item.label }}</span>
        </a>
      </template>
    </ContextMenu>
    <DataTable
      lazy
      :value="state.mealTypeList"
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
      :contextMenuSelection="state.selectedContextMealType"
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
            <InputIcon v-if="state.searchName" class="pi pi-times cursor-pointer" @click="state.searchName = ''" />
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

    <!-- CREATE MEAL TYPE FORM DIALOG -->
    <Dialog
      @afterHide="clearCreateDialogForm"
      v-model:visible="state.createDialogVisible"
      modal
      header="Mahlzeitart erstellen"
      :style="{ width: '32rem' }"
    >
      <Form
        v-slot="$createForm"
        :resolver="resolver"
        :initialValues="createMealTypeInitialValues"
        @submit="onCreateMealTypeFormSubmit"
        class="formgrid grid"
      >
        <div class="field col-12">
          <FloatLabel variant="in">
            <InputText
              v-model="createMealTypeFormValues.name"
              name="name"
              class="flex-auto"
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
        <div class="field col-6">
          <Button type="submit" severity="success" label="Bestätigen" />
        </div>
      </Form>
    </Dialog>

    <!-- EDIT MEAL TYPE FORM DIALOG -->
    <Dialog
      @afterHide="clearEditDialogForm"
      v-model:visible="state.editDialogVisible"
      modal
      header="Mahlzeitart bearbeiten"
      :style="{ width: '32rem' }"
    >
      <Form
        v-slot="$editForm"
        :resolver="resolver"
        @submit="onEditMealTypeFormSubmit"
        class="formgrid grid"
      >
        <div class="field col-12">
          <FloatLabel variant="in">
            <InputText
              v-model="editMealTypeFormValues.name"
              name="name"
              class="flex-auto"
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
        <div class="field col-6">
          <Button type="submit" severity="success" label="Bestätigen" />
        </div>
      </Form>
    </Dialog>

    <!-- DELETE MEAL TYPE FORM DIALOG -->
    <Dialog
      v-model:visible="state.deleteDialogVisible"
      modal
      header="Mahlzeitart löschen"
      :closable="false"
      :style="{ width: '32rem' }"
    >
      <div class="flex flex-col gap-4">
        <p>Möchten Sie die Mahlzeitart "{{ state.deleteDialogMealTypeName }}" wirklich löschen?</p>
        <div class="flex justify-end gap-2">
          <Button
            label="Abbrechne"
            severity="secondary"
            @click="state.deleteDialogVisible = false"
          />
          <Button
            label="Löschen"
            severity="danger"
            @click="onDeleteMealTypeFormSubmit"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>
