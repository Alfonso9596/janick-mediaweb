<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox, Select, type SelectChangeEvent } from 'primevue'

const props = defineProps({
  initialValue: {
    type: Array,
    default: () => ([])
  },
  items: {
    type: Array,
    default: () => ([])
  },
  optionLabel: {
    type: String,
    default: () => ('name')
  },
  optionValue: {
    type: String,
    default: () => ('name')
  },
  placeholder: {
    type: String,
    default: () => ('Placeholder')
  },
  fluid: {
    type: Boolean,
    default: () => (true)
  },
  disabled: {
    type: Boolean,
    default: () => (false)
  },
  loading: {
    type: Boolean,
    default: () => (false)
  }
})

const emit = defineEmits(['update:modelValue'])

const emitModelValue = (event: SelectChangeEvent) => {
  if (event.value !== null) {
    emit('update:modelValue', event.value)
  }
}

const selectedValues = ref<unknown[]>(
  (props.items as Record<string, unknown>[]).filter((i) =>
    (props.initialValue as unknown[]).includes(i[props.optionValue])
  ).map((i) => i[props.optionValue])
)

const getLabel = () => {
  if (selectedValues.value.length === 0) {
    return ''
  }
  const firstItem = (props.items as Record<string, unknown>[]).find((v) => v[props.optionValue] === selectedValues.value[0])
  const first = firstItem?.[props.optionLabel] ?? selectedValues.value[0]
  return selectedValues.value.length > 1 ? `${first} +${selectedValues.value.length - 1}` : first
}

const isItemSelected = (item: Record<string, unknown>) => selectedValues.value.includes(item[props.optionValue])

const selectAll = () => {
  selectedValues.value = (props.items as Record<string, unknown>[]).map(
    (item) => item[props.optionValue],
  )
  emit('update:modelValue', selectedValues.value)
}

const unselectAll = () => {
  selectedValues.value = []
  emit('update:modelValue', selectedValues.value)
}
</script>

<template>
  <Select
    v-model:modelValue="selectedValues"
    :options="props.items"
    multiple
    filter
    :aria-label="props.placeholder"
    :filterBy="props.optionLabel"
    :optionLabel="props.optionLabel"
    :optionValue="props.optionValue"
    :placeholder="props.placeholder"
    filterPlaceholder="Suche..."
    :fluid="props.fluid"
    :disabled="props.disabled"
    :loading="props.loading"
    @change="emitModelValue"
  >
    <template #header>
      <div class="flex items-center gap-1 px-3 pt-2">
        <Button variant="text" size="small" @click="selectAll">Alle auswählen</Button>
        <Button variant="text" size="small" severity="secondary" @click="unselectAll">Auswahl aufheben</Button>
      </div>
    </template>
    <template #value="slotProps">
      <span>{{ getLabel() !== '' ? getLabel() : slotProps.placeholder }}</span>
    </template>
    <template #option="slotProps">
      <div class="flex items-center gap-2">
        <Checkbox :modelValue="isItemSelected(slotProps.option)" binary :tabindex="-1" readonly />
        <span class="truncate">{{ slotProps.option[props.optionLabel] }}</span>
      </div>
    </template>
  </Select>
</template>
