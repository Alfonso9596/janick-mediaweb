<script setup lang="ts">
const props = defineProps({
  item: {
    type: Object,
    default: () => ({}),
  },
})

const setRating = (event) => {
  console.log(event.value)
}
</script>

<template>
  <div class="rating-overview mb-4" style="display: flex">
    <Rating @change="setRating" :model-value="props.item.ratingValue" />
    <p class="ml-3 pt-1">
      {{ props.item.ratingValue }}/5 ({{ props.item.ratingAmount }} Bewertungen)
    </p>
  </div>
</template>
