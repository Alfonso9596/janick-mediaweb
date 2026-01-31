<script setup lang="ts">
const props = defineProps({
  item: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue'])

const emitRating = (event) => {
  console.log(event)
  emit('update:modelValue', event.value)
}
</script>

<template>
  <div class="rating-overview mb-4" style="display: flex">
    <Rating @change="emitRating" :model-value="props.item.ratingValue" />
    <p class="ml-3 pt-1">
      {{ props.item.ratingValue }}/5 ({{ props.item.ratingAmount }} Bewertungen)
    </p>
  </div>
</template>
