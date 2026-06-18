<script setup lang="ts">
import { computed, watch, type PropType } from 'vue'
import { TreeTable, Column } from 'primevue'
import type { TreeNode } from 'primevue/treenode'
import type { FileItem } from '@/types/common'

const props = defineProps({
  files: {
    type: Array as PropType<FileItem[]>,
    default: () => [] as FileItem[],
  },
  loading: {
    type: Boolean,
    default: false,
  },
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
</script>

<template>
	<div class="col-span-4 mt-5">
    <TreeTable :value="treeConfig" :loading="props.loading">
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
