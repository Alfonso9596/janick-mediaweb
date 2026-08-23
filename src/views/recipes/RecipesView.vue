<script setup lang="ts">
import { computed, reactive, ref, shallowRef, watch } from 'vue'
import { getPageableRecipes, createNewRecipe, editRecipe, deleteRecipe } from '@/api/networks/recipes.network'
import { uploadNewPoster } from '@/api/networks/files.network'
import { useRecipeStore } from '@/stores/recipes.store'
import { Column, ContextMenu, DataTable, FileUpload, type DataTableRowClickEvent, type DataTableRowContextMenuEvent, type FileUploadSelectEvent } from 'primevue'
import { useRoute } from 'vue-router'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'
import { useToast } from 'primevue'
import router from '@/router'
import type { ContextMenuInstance, MealType, Recipe } from '@/types/common'
import { useAuthStore } from '@/stores/auth.store'
import { getAllMealTypes } from '@/api/networks/mealTypes.network'
import { Check, Times } from '@primeicons/vue'

const apiUrl = import.meta.env.VITE_API_URL
const recipeStore = useRecipeStore()
const authStore = useAuthStore()
const currentRoute = useRoute()
const toast = useToast()
const cm = shallowRef<ContextMenuInstance | null>(null)

const state = reactive<{
  recipeList: Recipe[]
  page: number
  pageSize: number
  sortBy: string
  sortDir: string
  totalRecords: number
  totalPages: number | undefined
  loading: boolean
  searchName: string
  searchMealType: string
  createDialogVisible: boolean
  mealTypeListLoading: boolean
  mealTypeList: MealType[]
  editDialgoVisible: boolean
  editDialogRecipeId: number
  deleteDialogVisible: boolean
  deleteDialogRecipeName: string
  deleteDialogRecipeId: number
  selectedContextRecipe: Recipe | null
}>({
  recipeList: [],
  page: recipeStore.recipesPage,
  pageSize: recipeStore.recipesPageSize,
  sortBy: recipeStore.recipesSortBy,
  sortDir: recipeStore.recipesSortDir,
  totalRecords: 0,
  totalPages: undefined,
  loading: false,
  searchName: '',
  searchMealType: '',
  createDialogVisible: false,
  mealTypeListLoading: false,
  mealTypeList: [],
  editDialgoVisible: false,
  editDialogRecipeId: 0,
  deleteDialogVisible: false,
  deleteDialogRecipeName: '',
  deleteDialogRecipeId: 0,
  selectedContextRecipe: null
})

const defaultFormValues = reactive<{
  name: string
  description: string
  mealTypes: string[]
  vegetarian: boolean
  vegan: boolean
  glutenfree: boolean
  lactosefree: boolean
}>({
  name: '',
  description: '',
  mealTypes: [],
  vegetarian: false,
  vegan: false,
  glutenfree: false,
  lactosefree: false
})

const createFormValues = reactive<{
  name: string
  description: string
  mealTypes: string[]
  vegetarian: boolean
  vegan: boolean
  glutenfree: boolean
  lactosefree: boolean
  posterFile: File | null
}>({
  name: '',
  description: '',
  mealTypes: [],
  vegetarian: false,
  vegan: false,
  glutenfree: false,
  lactosefree: false,
  posterFile: null
})

const editFormValues = reactive<{
  name: string
  description: string
  mealTypes: string[]
  vegetarian: boolean
  vegan: boolean
  glutenfree: boolean
  lactosefree: boolean
}>({
  name: '',
  description: '',
  mealTypes: [],
  vegetarian: false,
  vegan: false,
  glutenfree: false,
  lactosefree: false
})

watch(
  () => state.pageSize,
  () => {
    fetchRecipes()
    recipeStore.setRecipesPageSize(state.pageSize)
  }
)

watch(
  () => state.page,
  () => {
    fetchRecipes()
    recipeStore.setRecipesPage(state.page)
  }
)

watch(
  () => state.sortBy,
  () => {
    fetchRecipes()
    recipeStore.setRecipesSortBy(state.sortBy)
  }
)

watch(
  () => state.sortDir,
  () => {
    fetchRecipes()
    recipeStore.setRecipesSortDir(state.sortDir)
  }
)

watch(
  () => currentRoute.query,
  () => {
    fetchRecipes()
  }
)

watch(
  () => state.searchName,
  () => {
    fetchRecipes()
  }
)

watch(
  () => state.searchMealType,
  () => {
    fetchRecipes()
  }
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
    sortable: true
  },
  {
    key: 'description',
    title: 'Beschreibung'
  },
  {
    key:  'vegetarian',
    title: 'Vegetarisch'
  },
  {
    key:  'vegan',
    title: 'Vegan'
  },
  {
    key:  'glutenfree',
    title: 'Glutenfrei'
  },
  {
    key:  'lactosefree',
    title: 'Laktosefrei'
  },
  {
    key: 'ratingValue',
    title: 'Bewertung',
    rating: true
  }
])

const contextMenuModel = ref([
  {
    label: 'Bearbeiten',
    icon: 'pi pi-pencil',
    disabled: () => {
      return (authStore.decodedToken?.sub !== state.selectedContextRecipe?.user?.username) &&
        (!authStore.roles?.includes('ADMIN'))
    },
    command: () => {
      if (state.selectedContextRecipe == null) return
      showEditDialog(state.selectedContextRecipe)
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
      return (authStore.decodedToken?.sub !== state.selectedContextRecipe?.user?.username) &&
        (!authStore.roles?.includes('ADMIN'))
    },
    command: () => {
      if (state.selectedContextRecipe == null) return
      showDeleteDialog(state.selectedContextRecipe)
    }
  }
])

const onRowContextMenu = (event: DataTableRowContextMenuEvent) => {
  state.selectedContextRecipe = event.data
  cm.value?.show(event.originalEvent)
}

const onRowClick = (event: DataTableRowClickEvent) => {
  goToRecipePage(event.data.id)
}

const fetchRecipes = async () => {
  state.loading = true

  const params = {
    pageSize: String(state.pageSize),
    page: String(state.page),
    sortBy: state.sortBy,
    sortDir: state.sortDir,
    ...currentRoute.query,
    name: state.searchName ? state.searchName : '',
    mealType: state.searchMealType ? state.searchMealType : ''
  }

  const response = await getPageableRecipes(params)
  state.recipeList = response.content
  state.totalRecords = response.totalElements
  state.totalPages = response.totalPages

  state.loading = false
}

const fetchMealTypeList = async () => {
  state.mealTypeListLoading = true
  const response = await getAllMealTypes()
  state.mealTypeList = response
  state.mealTypeListLoading = false
}

const capDescription = (value: string) => {
  return value ? value.substring(0, 100) + '...' : ''
}

const goToRecipePage = (id: number) => {
  router.push('/recipes/' + id)
}

const resolver = ref(
  zodResolver(
    z.object({
      name: z.string().min(1, { message: 'Der Name wird benötigt.' })
    })
  )
)

const onCreateFormSubmit = async (e: { valid: boolean }) => {
  if (e.valid) {
    if (createFormValues.posterFile !== null) {
      const posterResponse = await uploadNewPoster(
        createFormValues.posterFile,
        'RECIPE',
        createFormValues.name,
        '',
        ''
      )

      if (!posterResponse) {
        console.error('Failed image upload')
        toast.add({
          severity: 'error',
          summary: 'Ein Poster für "' + createFormValues.name + '" konnte nicht hochgeladen werden.',
          life: 5000
        })
        return
      }
    }

    const recipeResponse = await createNewRecipe(createFormValues)

    if (!recipeResponse) {
      if (createFormValues.posterFile) {
        toast.add({
          severity: 'error',
          summary: 'Das Bild wurde hochgeladen, aber das Rezept wurde nicht gespeichert',
          life: 5000
        })
        return
      } else {
        toast.add({
          severity: 'error',
          summary: 'Das Rezept "' + createFormValues.name + '" existiert bereits',
          life: 5000
        })
        return
      }
    }
    toast.add({
      severity: 'success',
      summary: 'Das Rezept "' + createFormValues.name + '" wurde gespeichert',
      life: 3000
    })
    state.createDialogVisible = false
    fetchRecipes()
    fetchMealTypeList()
  }
}

const onEditFormSubmit = async () => {
  const editRecipeResponse = await editRecipe(state.editDialogRecipeId, editFormValues)

  if (editRecipeResponse === false) {
    toast.add({
      severity: 'error',
      summary: 'Fehler beim Bearbeiten des Rezepts "' + editFormValues.name + '"',
      life: 5000
    })
  } else {
    toast.add({
      severity: 'success',
      summary: 'Rezept "' + editFormValues.name + '" erfolgreich bearbeitet',
      life: 3000
    })
  }

  state.editDialgoVisible = false
  fetchRecipes()
}

const onDeleteFormSubmit = async () => {
  const deleteRecipeResponse = await deleteRecipe(state.deleteDialogRecipeId)

  if (deleteRecipeResponse === false) {
    toast.add({
      severity: 'error',
      summary: 'Fehler beim Löschen des Rezepts "' + state.deleteDialogRecipeName + '"',
      life: 5000
    })
  } else {
    toast.add({
      severity: 'success',
      summary: 'Rezept "' + state.deleteDialogRecipeName + '" erfolgreich gelöscht',
      life: 3000
    })
  }
  state.deleteDialogVisible = false
  fetchRecipes()
}

const clearCreateDialogForm = () => {
  createFormValues.name = defaultFormValues.name
  createFormValues.description = defaultFormValues.description
  createFormValues.mealTypes = defaultFormValues.mealTypes
  createFormValues.vegetarian = defaultFormValues.vegetarian
  createFormValues.vegan = defaultFormValues.vegan
  createFormValues.glutenfree = defaultFormValues.glutenfree
  createFormValues.lactosefree = defaultFormValues.lactosefree
  createFormValues.posterFile = null
}

const showEditDialog = (recipe: Recipe) => {
  state.editDialogRecipeId = Number.parseInt(String(recipe.id), 10)
  editFormValues.name = recipe.name
  editFormValues.description = recipe.description ?? ''
  editFormValues.mealTypes = recipe.mealTypes ?? []
  editFormValues.vegetarian = recipe.vegetarian
  editFormValues.vegan = recipe.vegan
  editFormValues.glutenfree = recipe.glutenfree
  editFormValues.lactosefree = recipe.lactosefree
  state.editDialgoVisible = true
}

const clearEditDialogForm = () => {
  state.editDialgoVisible = false

  editFormValues.name = ''
  editFormValues.description = ''
  editFormValues.mealTypes = []
  editFormValues.vegetarian = false
  editFormValues.vegan = false
  editFormValues.glutenfree = false
  editFormValues.lactosefree = false
}

const showDeleteDialog = async (recipe: Recipe) => {
  state.deleteDialogRecipeName = recipe.name
  state.deleteDialogRecipeId = recipe.id
  state.deleteDialogVisible = true
}

function onPosterSelect(event: FileUploadSelectEvent) {
  createFormValues.posterFile = event.files[0]
}

function onPosterRemove() {
  createFormValues.posterFile = null
}

fetchMealTypeList()
fetchRecipes()
</script>
<template>
  <div class="card">
    <div class="font-semibold text-xl mb-4">Rezepte</div>
    <ContextMenu ref="cm" :model="contextMenuModel" @hide="state.selectedContextRecipe = null">
      <template #item="{ item, props }">
        <a class="flex items-center" v-bind="props.action" :style="{ 'background-color': item.color, 'border-radius': '2px' }">
          <span :class="item.icon" />
          <span class="ml-2">{{ item.label }}</span>
        </a>
      </template>
    </ContextMenu>
    <DataTable
      lazy
      :value="state.recipeList"
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
      :contextMenuSelection="state.selectedContextRecipe"
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
            v-model="state.searchMealType"
            :options="state.mealTypeList"
            filter
            optionLabel="name"
            optionValue="name"
            placeholder="Filtern nach Mahlzeitart"
            :showClear="state.searchMealType !== ''"
            class="md:w-56 ml-2"
            :loading="state.mealTypeListLoading"
            :disabled="state.mealTypeListLoading"
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
          <span v-else-if="typeof data[header.key] == 'boolean'">
            <Check v-if="data[header.key] === true" color="green" :size="24" />
            <Times v-else color="red" :size="24" />
          </span>
          <span v-else>{{ data[header.key] }}</span>
        </template>
      </Column>
    </DataTable>

    <!-- CREATE RECIPE FORM DIALOG -->
    <Dialog
      @afterHide="clearCreateDialogForm"
      v-model:visible="state.createDialogVisible"
      modal
      header="Neues Rezept einfügen"
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
            <MultiSelect
              v-model="createFormValues.mealTypes"
              name="mealTypes"
              fluid
              display="chip"
              :options="state.mealTypeList"
              optionLabel="name"
              optionValue="name"
              filter
              placeholder="Mahlzeitart auswählen"
              :maxSelectedLabels="2"
              selectedItemsLabel="{0} Mahlzeitarten ausgewählt"
              :loading="state.mealTypeListLoading"
              :disabled="state.mealTypeListLoading"
            />
            <label for="mealTypes">Mahlzeitarten</label>
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
        <div class="flex justify-start gap-2 field col-12 md:col-6">
          <ToggleSwitch
            v-model="createFormValues.vegetarian"
            name="vegetarian"
          />
          <label for="vegetarian">Vegetarisch</label>
        </div>
        <div class="flex justify-start gap-2 field col-12 md:col-6">
          <ToggleSwitch
            v-model="createFormValues.vegan"
            name="vegan"
          />
          <label for="vegan">Vegan</label>
        </div>
        <div class="flex justify-start gap-2 field col-12 md:col-6">
          <ToggleSwitch
            v-model="createFormValues.glutenfree"
            name="glutenfree"
          />
          <label for="glutenfree">Glutenfrei</label>
        </div>
        <div class="flex justify-start gap-2 field col-12 md:col-6">
          <ToggleSwitch
            v-model="createFormValues.lactosefree"
            name="lactosefree"
          />
          <label for="lactosefree">Laktosefrei</label>
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

    <!-- EDIT RECIPE FORM DIALOG -->
     <Dialog
      @afterHide="clearEditDialogForm"
      v-model:visible="state.editDialgoVisible"
      modal
      header="Rezept bearbeiten"
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
            <MultiSelect
              v-model="editFormValues.mealTypes"
              name="mealTypes"
              fluid
              display="chip"
              :options="state.mealTypeList"
              optionLabel="name"
              optionValue="name"
              filter
              placeholder="Mahlzeitart auswählen"
              :maxSelectedLabels="2"
              selectedItemsLabel="{0} Mahlzeitarten ausgewählt"
              :loading="state.mealTypeListLoading"
              :disabled="state.mealTypeListLoading"
            />
            <label for="mealTypes">Mahlzeitarten</label>
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
        <div class="flex justify-start gap-2 field col-12 md:col-6">
          <ToggleSwitch
            v-model="editFormValues.vegetarian"
            name="vegetarian"
          />
          <label for="vegetarian">Vegetarisch</label>
        </div>
        <div class="flex justify-start gap-2 field col-12 md:col-6">
          <ToggleSwitch
            v-model="editFormValues.vegan"
            name="vegan"
          />
          <label for="vegan">Vegan</label>
        </div>
        <div class="flex justify-start gap-2 field col-12 md:col-6">
          <ToggleSwitch
            v-model="editFormValues.glutenfree"
            name="glutenfree"
          />
          <label for="glutenfree">Glutenfrei</label>
        </div>
        <div class="flex justify-start gap-2 field col-12 md:col-6">
          <ToggleSwitch
            v-model="editFormValues.lactosefree"
            name="lactosefree"
          />
          <label for="lactosefree">Laktosefrei</label>
        </div>
        <div class="field col-6">
          <Button type="submit" severity="success" label="Bestätigen" />
        </div>
      </Form>
    </Dialog>

    <!-- DELETE RECIPE FORM DIALOG -->
     <Dialog
      v-model:visible="state.deleteDialogVisible"
      modal
      header="Rezept löschen"
      :closable="false"
      :style="{ width: '32rem' }"
    >
      <div class="flex flex-col gap-4">
        <p>Möchten Sie das Rezept "{{ state.deleteDialogRecipeName }}" wirklich löschen?</p>
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
