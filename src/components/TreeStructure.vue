<script setup lang="ts">
import { computed, reactive, watch, type PropType } from 'vue'
import { TreeTable, Column, FileUpload, type FileUploadSelectEvent, useToast } from 'primevue'
import type { TreeNode } from 'primevue/treenode'
import type { FileItem } from '@/types/common'
import { uploadFile } from '@/api/networks/files.network'

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
    type: String as PropType<'MOVIE' | 'SERIES' | 'GAME'>,
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
}>({
  uploadFileDialogVisible: false,
  mediaFile: null
})

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
  if (size < 1024) {
    return size + ' B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB'
  } else if (size < 1024 * 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(2) + ' MB'
  } else {
    return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }
}

const onUploadFileSubmit = async () => {
  if (state.mediaFile !== null) {
    console.log('Media ID: ' + props.mediaId)
    console.log('Media Type: ' + props.mediaType)
    const fileResponse = await uploadFile(
      state.mediaFile,
      props.mediaType,
      props.mediaId
    )

    if (!fileResponse) {
      console.error('Failed file upload')
      toast.add({
        severity: 'error',
        summary: 'Die Datei konnte nicht hochgeladen werden',
        life: 5000
      })
      return
    }
    toast.add({
      severity: 'success',
      summary: 'Die Datei wurde erfolgreich hochgeladen',
      life: 3000
    })
    state.uploadFileDialogVisible = false
    emit('fileUpload')
  }
}

const clearUploadFileDialog = () => {
  state.mediaFile = null
}

function onFileSelect(event: FileUploadSelectEvent) {
  state.mediaFile = event.files[0]
}

function onFileRemove() {
  state.mediaFile = null
}
</script>

<template>
	<div class="col-span-4 mt-5">
    <TreeTable :value="treeConfig" :loading="props.loading">
      <template #header>
        <div class="flex justify-end">
          <Button @click="state.uploadFileDialogVisible = true" type="button" label="Neu" icon="pi pi-plus" />
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

    <!-- UPLOAD FILE DIALOG -->
    <Dialog
      @afterHide="clearUploadFileDialog"
      v-model:visible="state.uploadFileDialogVisible"
      modal
      :header="props.fileUploadTitle"
      :style="{ width: '32rem' }"
    >
      <Form
        @submit="onUploadFileSubmit"
        class="formgrid grid"
      >
        <div class="field col-12">
          <FileUpload
            @select="onFileSelect"
            @clear="onFileRemove"
            customUpload
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
            <template #empty>
              <div class="flex items-center justify-center flex-col">
                <i
                  class="pi pi-cloud-upload border-2! rounded-full! p-4! text-4xl! text-muted-color!"
                />
                <p class="mt-6 mb-0">Datei hierhin verschieben</p>
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
