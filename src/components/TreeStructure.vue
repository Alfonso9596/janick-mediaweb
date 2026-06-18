<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { TreeTable, Column } from 'primevue'
import type { TreeNode } from 'primevue/treenode'

const props = defineProps({
  files: {
    type: Array,
    default: () => [] as File[],
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

const treeConfig = computed(() => {
  const getTreeItem = (item: any): TreeNode => ({
    data: item,
    key: item.key,
    label: item.name,
    children: item.children?.length
      ? item.children.map((child: any) => getTreeItem(child))
      : undefined,
  })
  return props.files.map((file) => getTreeItem(file))
})

const numeratedTreeConfig = () => {
  props.files.forEach((file, index) => {
    const f: any = file
    f.key = `${index}`
    f.size = formatFileSize(f)

    if (f.children && f.children.length > 0) {
      f.children.forEach((child: any, childIndex: number) => {
        child.key = `${index}-${childIndex}`
        child.size = formatFileSize(child)
      })
    }
  })
}

function formatFileSize(file: any): string {
  if (file.fileType === 'FOLDER') {
    return '-'
  }
  if (file.size < 1024) {
    return file.size + ' B'
  } else if (file.size < 1024 * 1024) {
    return (file.size / 1024).toFixed(2) + ' KB'
  } else if (file.size < 1024 * 1024 * 1024) {
    return (file.size / (1024 * 1024)).toFixed(2) + ' MB'
  } else {
    return (file.size / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
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
