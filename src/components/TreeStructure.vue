<script setup lang="ts">
import { computed, reactive, ref, watch, type PropType } from 'vue'
import { TreeTable, Column, ProgressBar, useToast } from 'primevue'
import { CloudUpload, Plus, Times } from '@primeicons/vue'
import type { TreeNode } from 'primevue/treenode'
import type { FileItem, MediaType} from '@/types/common'
import { uploadFile } from '@/api/networks/files.network'
import { formatSize, formatSpeed } from '@/helpers/format.helper.ts'
import { type AxiosProgressEvent } from 'axios'

const emit = defineEmits(['fileUpload'])

const toast = useToast()

const props = defineProps({
  files: {
    type: Array as PropType<FileItem[]>,
    default: () => [] as FileItem[],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  fileUploadTitle: {
    type: String,
    default: ''
  },
  mediaType: {
    type: String as PropType<MediaType>,
    default: ''
  },
  mediaId: {
    type: Number,
    default: 0
  }
})

const state = reactive<{
  uploadFileDialogVisible: boolean
  mediaFile: File | null
  uploading: boolean,
  uploadProgress: number
  uploadSpeed: number
  uploadTimeLeft: number
  uploadFileSize: number
}>({
  uploadFileDialogVisible: false,
  mediaFile: null,
  uploading: false,
  uploadProgress: 0,
  uploadSpeed: 0,
  uploadTimeLeft: 0,
  uploadFileSize: 0
})

const inputRef = ref()

watch(
  () => props.files,
  () => {
    if (props.files.length > 0) {
      numeratedTreeConfig()
    }
  }
)

const treeConfig = computed<TreeNode[]>(() => {
  const getTreeItem = (item: FileItem): TreeNode => ({
    data: item,
    key: item.key ?? '',
    label: item.name,
    children: item.children?.length
      ? item.children.map((child: FileItem) => getTreeItem(child))
      : undefined,
  })
  return props.files.map((file) => getTreeItem(file))
})

const numeratedTreeConfig = () => {
  props.files.forEach((file, index) => {
    const f = file as FileItem
    f.key = `${index}`
    f.size = formatFileSize(f)

    if (f.children && f.children.length > 0) {
      f.children.forEach((child: FileItem, childIndex: number) => {
        child.key = `${index}-${childIndex}`
        child.size = formatFileSize(child)
      })
    }
  })
}

function formatFileSize(file: FileItem): string {
  if (file.fileType === 'FOLDER') {
    return '-'
  }
  const size = typeof file.size === 'number' ? file.size : Number.parseInt(file.size, 10)
  return formatSize(size)
}

const handleFileUpload = async () => {
  state.uploading = true
  const startTime = Date.now()

  if (!state.mediaFile) {
    return
  }

  try {
    await uploadFile(
      state.mediaFile,
      props.mediaType,
      props.mediaId,
      {
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          const total = progressEvent.total ?? 0
          state.uploadProgress = total > 0 ? Math.round((progressEvent.loaded / total) * 100) : 0

          const currentTime = Date.now()
          const elapsedTime = (currentTime - startTime) / 1000
          const speed = progressEvent.loaded / elapsedTime
          const remainingBytes = total - progressEvent.loaded
          const estimatedTimeLeft = remainingBytes / speed

          state.uploadSpeed = speed
          state.uploadTimeLeft = Math.round(estimatedTimeLeft)
        }
      }
    )

    toast.add({
      severity: 'success',
      summary: 'Die Datei wurde erfolgreich hochgeladen',
      life: 3000
    })
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Die Datei konnte nicht hochgeladen werden',
      life: 5000
    })
  } finally {
    state.uploading = false
    state.mediaFile = null
    state.uploadProgress = 0
    state.uploadSpeed = 0
    state.uploadTimeLeft = 0
    state.uploadFileSize = 0
    emit('fileUpload')
  }
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  state.mediaFile = target.files?.[0] ?? null
  state.uploadFileSize = target.files?.[0].size ?? 0
}

function handleFileSelectClick(event: Event) {
  event.preventDefault()
  inputRef.value.click()
}

function handleCancelFileUpload() {
  state.mediaFile = null
}
</script>

<template>
	<div class="col-span-4 mt-5">
    <TreeTable :value="treeConfig" :loading="props.loading">
      <template #header>
        <div class="w-max">
          <div class="file-upload-header flex gap-2">
            <input ref="inputRef" hidden type="file" @change="handleFileChange" />
            <Button v-if="state.mediaFile === null" class="mb-2" type="button" @click="handleFileSelectClick"><Plus/>Neu</Button>
            <Button v-if="state.mediaFile !== null" type="button" @click="handleFileUpload" severity="success"><CloudUpload />Hochladen</Button>
            <Button v-if="state.mediaFile !== null" type="button" @click="handleCancelFileUpload" severity="danger"><Times />Abbrechen</Button>
          </div>
          <div v-if="state.mediaFile !== null" class="file-upload-content mt-2 h-full grid nested-grid">
            <div class="col-8">
              <div class="grid">
                <div class="col-12 pb-0">
                  <div class="text-left pt-2 pl-2">{{ state.mediaFile.name }}</div>
                </div>
                <div class="col-12 pt-0 pb-0">
                  <div class="text-left text-sm text-300 pb-2 pl-2"><span>Dateigrösse: {{ formatSize(state.mediaFile.size) }}</span></div>
                </div>
                <div class="col-12 pt-0">
                  <div class="text-left pl-2">
                    <ProgressBar :value="state.uploadProgress" :showValue="false" :pt="{ root: 'h-1.5! rounded-full!', value: '--p-primary-color! rounded-full!' }"/>
                  </div>
                </div>
                <div class="col-12">
                  <div class="grid pl-2 pr-2">
                    <div class="col-6">
                      <div class="text-left text-sm text-300"><span><b>Übrige Zeit: </b>{{ state.uploadTimeLeft }} Sekunden</span></div>
                    </div>
                    <div class="col-6">
                      <div class="text-right text-sm text-300"><span><b>Uploadrate: </b>{{ formatSpeed(state.uploadSpeed) }}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #empty> Keine Dateien gefunden. </template>
      <Column :expander="true" field="name" header="Dateiname" :showFilterMenu="false" />
      <Column field="size" header="Größe" :showFilterMenu="false" />
      <Column field="fileType" header="Dateityp" :showFilterMenu="false">
        <template #body="{ node }">
          <Chip v-if="node.data.fileType === 'FOLDER'" label="Ordner" icon="pi pi-folder" />
          <Chip v-else-if="node.data.fileType === 'VIDEO'" label="Video" icon="pi pi-video" />
          <Chip v-else label="ZIP" icon="pi pi-box" />
        </template>
      </Column>
      <Column class="w-24 text-end!">
        <template #body="{ node }">
          <Button
            v-if="node.data.fileType !== 'FOLDER'"
            as="a"
            icon="pi pi-download"
            class="p-button-text"
            :label="'Download'"
            :href="`${node.data.url}`"
            target="_blank"
          />
        </template>
      </Column>
    </TreeTable>
  </div>
</template>
