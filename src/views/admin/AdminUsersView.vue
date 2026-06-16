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
import { getAllRoles, getPageableUsers } from '@/api/networks/admin.network'
import { useAuthStore } from '@/stores/auth.store'
import { computed, reactive, ref, watch } from 'vue'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'

const authStore = useAuthStore()

const state = reactive<{
  userList: any[]
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
  roleList: any[]
  editDialogVisible: boolean
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
  editDialogVisible: false,
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

const editUserInitialValues = reactive<{
  username: string
  password: string
  roles: string[]
  editPassword: boolean
}>({
  username: '',
  password: '',
  roles: [],
  editPassword: false,
})

const editUserFormValues = reactive<{
  username: string
  password: string
  roles: string[]
  editPassword: boolean
}>({
  username: '',
  password: '',
  roles: [],
  editPassword: false,
})

const editUserResolver = ref(
  zodResolver(
    z.object({
      username: z.string().min(3, 'Der Benutzername muss mindestens 3 Zeichen lang sein.'),
    }),
  ),
)

const onEditUserFormSubmit = async (e) => {
  console.log(e)
}

const showEditUserDialog = (user: any) => {
  editUserInitialValues.username = user.username
  editUserInitialValues.password = ''
  editUserInitialValues.roles = [...user.roles]
  editUserInitialValues.editPassword = false
  state.editDialogVisible = true
}

const hideEditUserDialog = () => {
  state.editDialogVisible = false
  editUserInitialValues.username = ''
  editUserInitialValues.password = ''
  editUserInitialValues.roles = []

  editUserFormValues.username = ''
  editUserFormValues.password = ''
  editUserFormValues.roles = []
  editUserFormValues.editPassword = false
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
    pageSize: state.pageSize,
    page: state.page,
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
      removableSort
      @page="state.page = $event.page"
      @update:rows="state.pageSize = $event"
      @update:sortFields="state.sortBy = $event"
      @update:sortOrder="state.sortDir = $event > 0 || $event === undefined ? 'asc' : 'desc'"
    >
      <template #header>
        <div class="flex justify-end">
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
            <Chip v-for="role in data[header.key]" :key="role" :label="role">
              <template #icon>
                <v-icon v-if="role === 'ADMIN'" name="fa-user-shield" />
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
                cursor: 'pointer',
              }"
              v-tooltip.top="data[header.key] ? 'Deaktivieren' : 'Aktivieren'"
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
          />
        </template>
      </Column>
    </DataTable>

    <!-- Edit User Dialog -->
    <Dialog
      v-model:visible="state.editDialogVisible"
      @hide="hideEditUserDialog"
      header="Benutzer bearbeiten"
      modal
      style="width: 32rem"
    >
      <Form
        v-slot="$editUserForm"
        :resolver="editUserResolver"
        :initialValues="editUserInitialValues"
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
        <div class="field col-6">
          <Button type="submit" severity="success" label="Bestätigen" />
          <Button
            type="button"
            severity="danger"
            label="Abbrechen"
            class="ml-2"
            @click="hideEditUserDialog"
          />
        </div>
      </Form>
    </Dialog>
  </div>
</template>
