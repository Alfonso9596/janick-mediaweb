<script setup lang="ts">
import {
  Chip,
  Column,
  DataTable,
  FloatLabel,
  IconField,
  InputIcon,
  InputText,
  Message,
  MultiSelect,
} from 'primevue'
import { getAllRoles, getPageableUsers, createUser, deleteUser, editUser } from '@/api/networks/admin.network'
import { useAuthStore } from '@/stores/auth.store'
import { computed, reactive, ref, watch } from 'vue'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'
import { useToast } from 'primevue/usetoast'
import type { User, Role } from '@/types/common'

const toast = useToast()

const authStore = useAuthStore()

const state = reactive<{
  userList: User[]
  totalRecrods: number
  totalPages: number
  page: number
  pageSize: number
  sortBy: string
  sortDir: 'asc' | 'desc'
  loading: boolean
  searchName: string
  searchRole: string
  roleListLoading: boolean
  roleList: Role[]
  createDialogVisible: boolean
  editDialogVisible: boolean
  editDialogUserId: number
  deleteDialogVisible: boolean
  deleteDialogUsername: string
  deleteDialogUserId: number
}>({
  userList: [],
  totalRecrods: 0,
  totalPages: 0,
  page: 0,
  pageSize: 10,
  sortBy: 'id',
  sortDir: 'asc',
  loading: false,
  searchName: '',
  searchRole: '',
  roleListLoading: false,
  roleList: [],
  createDialogVisible: false,
  editDialogUserId: 0,
  editDialogVisible: false,
  deleteDialogVisible: false,
  deleteDialogUsername: '',
  deleteDialogUserId: 0,
})

const headers = computed(() => [
  {
    key: 'username',
    title: 'Benutzername',
    sortable: false,
  },
  {
    key: 'roles',
    title: 'Rollen',
    sortable: false,
    type: 'array',
  },
  {
    key: 'enabled',
    title: 'Aktiv',
    sortable: false,
    type: 'boolean',
  },
])

const createUserInitialValues = reactive<{
  username: string
  password: string
  roles: string[]
  isEnabled: boolean
}>({
  username: '',
  password: '',
  roles: [],
  isEnabled: true,
})

const createUserFormValues = reactive<{
  username: string
  password: string
  roles: string[]
  isEnabled: boolean
}>({
  username: '',
  password: '',
  roles: [],
  isEnabled: true,
})

const editUserFormValues = reactive<{
  username?: string
  password?: string
  roles: string[]
  editPassword?: boolean
  isEnabled: boolean
}>({
  username: '',
  password: '',
  roles: [],
  editPassword: false,
  isEnabled: false,
})

const createUserResolver = ref(
  zodResolver(
    z.object({
      username: z.string().min(3, 'Der Benutzername muss mindestens 3 Zeichen lang sein.'),
      password: z.string().min(5, 'Das Passwort muss mindestens 5 Zeichen lang sein.'),
    }),
  ),
)

const editUserResolver = ref(
  zodResolver(
    z.object({
      username: z.string().min(3, 'Der Benutzername muss mindestens 3 Zeichen lang sein.'),
      password: z.string().min(5, 'Das Passwort muss mindestens 5 Zeichen lang sein.'),
    }),
  ),
)

const onCreateUserFormSubmit = async (e: { valid: boolean}) => {
  if (e.valid) {
    const createUserResponse = await createUser(createUserFormValues)

    if (!createUserResponse) {
      console.log('Failed user creation')
      toast.add({
        severity: 'error',
        summary: 'Benutzer "' + createUserFormValues.username + '" existiert bereits',
        life: 5000,
      })
    }
    toast.add({
      severity: 'success',
      summary: 'Benutzer "' + createUserFormValues.username + '" erfolgreich erstellt',
      life: 3000,
    })
    state.createDialogVisible = false
  }
  fetchUsers()
  fetchRoleList()
}

const onDeleteUserSubmit = async () => {
  console.log('Deleting user with ID:', state.deleteDialogUserId)
  const deleteUserResponse = await deleteUser(state.deleteDialogUserId)

  if (deleteUserResponse === false) {
    console.log('Failed user deletion')
    toast.add({
      severity: 'error',
      summary: 'Fehler beim Löschen des Benutzers "' + state.deleteDialogUsername + '"',
      life: 5000,
    })
  } else {
    toast.add({
      severity: 'success',
      summary: 'Benutzer "' + state.deleteDialogUsername + '" erfolgreich gelöscht',
      life: 3000,
    })
  }
  state.deleteDialogVisible = false
  fetchUsers()
}

const onEditUserFormSubmit = async () => {
  if (!editUserFormValues.editPassword) {
    delete editUserFormValues.password
  }
  delete editUserFormValues.editPassword
  const editUserResponse = await editUser(state.editDialogUserId, editUserFormValues)

  if (editUserResponse === false) {
    console.log('Failed user edit')
    toast.add({
      severity: 'error',
      summary: 'Fehler beim Bearbeiten des Benutzers "' + editUserFormValues.username + '"',
      life: 5000,
    })
  } else {
    toast.add({
      severity: 'success',
      summary: 'Benutzer "' + editUserFormValues.username + '" erfolgreich bearbeitet',
      life: 3000,
    })
  }
  state.editDialogVisible = false
  fetchUsers()
}

const clearCreateDialogForm = () => {
  createUserFormValues.username = ''
  createUserFormValues.password = ''
  createUserFormValues.roles = []
  createUserFormValues.isEnabled = true
}

const showEditUserDialog = (user: User) => {
  console.log(user.enabled)
  state.editDialogUserId = user.id
  editUserFormValues.username = user.username
  editUserFormValues.password = ''
  editUserFormValues.roles = user.roles ?? []
  editUserFormValues.editPassword = false
  editUserFormValues.isEnabled = user.enabled
  state.editDialogVisible = true
}

const clearEditDialogForm = () => {
  state.editDialogVisible = false

  editUserFormValues.username = ''
  editUserFormValues.password = ''
  editUserFormValues.roles = []
  editUserFormValues.editPassword = false
  editUserFormValues.isEnabled = false
}

const showDeleteUserDialog = async (user: User) => {
  state.deleteDialogUsername = user.username
  state.deleteDialogUserId = user.id
  state.deleteDialogVisible = true
}

watch(
  () => [
    state.page,
    state.pageSize,
    state.sortBy,
    state.sortDir,
    state.searchName,
    state.searchRole,
  ],
  () => {
    fetchUsers()
  },
)

const fetchUsers = async () => {
  state.loading = true

  const params = {
    pageSize: String(state.pageSize),
    page: String(state.page),
    username: state.searchName ? state.searchName : '',
    role: state.searchRole ? state.searchRole : '',
  }

  const response = await getPageableUsers(params)
  state.userList = response.content
  state.totalRecrods = response.totalElements
  state.totalPages = response.totalPages

  state.loading = false
}

const fetchRoleList = async () => {
  state.roleListLoading = true

  const response = await getAllRoles()
  state.roleList = response

  state.roleListLoading = false
}

fetchUsers()
fetchRoleList()
</script>

<template>
  <div class="card">
    <div class="font-semibold text-xl mb-4">Benutzerübersicht</div>
    <DataTable
      lazy
      :value="state.userList"
      :paginator="true"
      :rows="state.pageSize"
      :rowsPerPageOptions="[10, 20, 50]"
      :totalRecords="state.totalRecrods"
      :pageCount="state.totalPages"
      dataKey="id"
      :rowHover="true"
      :loading="state.loading"
      :first="state.page * state.pageSize"
      :sortField="state.sortBy"
      :sortOrder="state.sortDir === 'asc' ? 1 : -1"
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
          <div v-if="header.type === 'array'">
            <Chip class="mr-2" v-for="role in data[header.key]" :key="role" :label="role">
              <template #icon>
                <v-icon  v-if="role === 'ADMIN'" name="fa-user-shield" />
                <v-icon v-else name="fa-user" />
              </template>
            </Chip>
          </div>
          <div v-else-if="header.type === 'boolean'">
            <Chip
              :label="data[header.key] ? 'Ja' : 'Nein'"
              :style="{
                background: data[header.key] ? `var(--p-green-700)` : `var(--p-red-700)`,
                color: '#FFFFFF',
              }"
            >
              <template #icon>
                <i :class="data[header.key] ? 'pi pi-check' : 'pi pi-times'" />
              </template>
            </Chip>
          </div>
          <span v-else>{{ data[header.key] }}</span>
        </template>
      </Column>
      <Column class="w-40 text-end!">
        <template #body="{ data }">
          <Button
            icon="pi pi-pencil"
            variant="outlined"
            :severity="authStore.decodedToken?.sub === data.username ? 'secondary' : 'primary'"
            rounded
            :disabled="authStore.decodedToken?.sub === data.username"
            class="mr-2"
            v-tooltip.top="'Bearbeiten'"
            @click="showEditUserDialog(data)"
          />
          <Button
            icon="pi pi-trash"
            variant="outlined"
            :severity="authStore.decodedToken?.sub === data.username ? 'secondary' : 'danger'"
            rounded
            :disabled="authStore.decodedToken?.sub === data.username"
            v-tooltip.top="'Löschen'"
            @click="showDeleteUserDialog(data)"
          />
        </template>
      </Column>
    </DataTable>

    <!-- CREATE USER FORM DIALOG -->
    <Dialog
      @afterHide="clearCreateDialogForm"
      v-model:visible="state.createDialogVisible"
      modal
      header="Benutzer erstellen"
      :style="{ width: '32rem' }"
    >
      <Form
        v-slot="$createForm"
        :resolver="createUserResolver"
        :initialValues="createUserInitialValues"
        @submit="onCreateUserFormSubmit"
        class="formgrid grid"
      >
        <div class="field col-12 md:col-6">
          <FloatLabel variant="in">
            <InputText
              v-model="createUserFormValues.username"
              name="username"
              class="flex-auto"
              autocomplete="off"
            />
            <Message
              v-if="$createForm.username?.invalid"
              severity="error"
              size="small"
              variant="simple"
              >{{ $createForm.username.error?.message }}</Message
            >
            <label for="username">Benutzername</label>
          </FloatLabel>
        </div>
        <div class="field col-12 md:col-6">
          <FloatLabel variant="in">
            <MultiSelect
              v-model="createUserFormValues.roles"
              name="roles"
              fluid
              :options="state.roleList"
              optionLabel="name"
              optionValue="name"
              filter
              placeholder="Rolle auswählen"
              :maxSelectedLabels="2"
              selectedItemsLabel="{0} Rolles ausgewählt"
              :loading="state.roleListLoading"
              :disabled="state.roleListLoading"
            />
            <label for="roles">Rollen</label>
          </FloatLabel>
        </div>
        <div class="field col-12 md:col-6">
          <FloatLabel variant="in">
            <InputText
              v-model="createUserFormValues.password"
              name="password"
              class="flex-auto"
              autocomplete="new-password"
              type="password"
            />
            <Message
              v-if="$createForm.password?.invalid"
              severity="error"
              size="small"
              variant="simple"
              >{{ $createForm.password.error?.message }}</Message
            >
            <label for="password">Passwort</label>
          </FloatLabel>
        </div>
        <div class="field col-12 md:col-6">
          <div class="flex items-center gap-2 mt-3">
            <Checkbox
              v-model="createUserFormValues.isEnabled"
              name="isEnabled"
              :binary="true"
            />
            <label for="isEnabled" class="ml-2">Benutzer aktivieren</label>
          </div>
        </div>
        <div class="field col-6">
          <Button type="submit" severity="success" label="Bestätigen" />
        </div>
      </Form>
    </Dialog>

    <!-- EDIT USER FORM DIALOG -->
    <Dialog
      v-model:visible="state.editDialogVisible"
      @afterHide="clearEditDialogForm"
      header="Benutzer bearbeiten"
      modal
      :style="{ width: '32rem' }"
    >
      <Form
        v-slot="$editUserForm"
        :resolver="editUserResolver"
        @submit="onEditUserFormSubmit"
        class="formgrid grid"
      >
        <div class="field col-12 md:col-6">
          <FloatLabel variant="in">
            <InputText
              v-model="editUserFormValues.username"
              name="username"
              class="flex-auto"
              autocomplete="off"
            />
            <Message
              v-if="$editUserForm.username?.invalid"
              severity="error"
              size="small"
              variant="simple"
              >{{ $editUserForm.username.error?.message }}</Message
            >
            <label for="username">Benutzername</label>
          </FloatLabel>
        </div>
        <div class="field col-12 md:col-6">
          <FloatLabel variant="in">
            <MultiSelect
              v-model="editUserFormValues.roles"
              name="roles"
              fluid
              :options="state.roleList"
              optionLabel="name"
              optionValue="name"
              filter
              placeholder="Rolle auswählen"
              :maxSelectedLabels="2"
              selectedItemsLabel="{0} Rolles ausgewählt"
              :loading="state.roleListLoading"
              :disabled="state.roleListLoading"
            />
            <label for="roles">Rollen</label>
          </FloatLabel>
        </div>
        <div class="field col-12 md:col-6">
          <FloatLabel variant="in">
            <InputText
              v-model="editUserFormValues.password"
              name="password"
              class="flex-auto"
              autocomplete="new-password"
              type="password"
              :disabled="!editUserFormValues.editPassword"
            />
            <Message
              v-if="$editUserForm.password?.invalid"
              severity="error"
              size="small"
              variant="simple"
              >{{ $editUserForm.password.error?.message }}</Message
            >
            <label for="password">Passwort</label>
          </FloatLabel>
        </div>
        <div class="field col-12 md:col-6">
          <div class="flex items-center gap-2 mt-3">
            <Checkbox
              v-model="editUserFormValues.editPassword"
              name="editPassword"
              :binary="true"
            />
            <label for="editPassword" class="ml-2">Passwort ändern</label>
          </div>
        </div>
        <div class="field col-12 md:col-6">
          <div class="flex items-center gap-2 mt-3">
            <Checkbox
              v-model="editUserFormValues.isEnabled"
              name="isEnabled"
              :binary="true"
            />
            <label for="isEnabled" class="ml-2">Benutzer aktivieren</label>
          </div>
        </div>
        <div class="field col-12">
          <Button type="submit" severity="success" label="Bestätigen" />
        </div>
      </Form>
    </Dialog>

    <!-- DELETE USER FORM DIALOG -->
    <Dialog
      v-model:visible="state.deleteDialogVisible"
      modal
      header="Benutzer löschen"
      :style="{ width: '32rem' }"
    >
      <div class="flex flex-col gap-4">
        <p>Möchten Sie den Benutzer "{{ state.deleteDialogUsername }}" wirklich löschen?</p>
        <div class="flex justify-end gap-2">
          <Button
            label="Abbrechen"
            severity="secondary"
            @click="state.deleteDialogVisible = false"
          />
          <Button
            @click="onDeleteUserSubmit"
            label="Löschen"
            severity="danger"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>
