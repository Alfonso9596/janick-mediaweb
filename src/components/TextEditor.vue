<script setup lang="ts">
import { QuillEditor } from '@vueup/vue-quill'
import { computed, type PropType } from 'vue'
import '@vueup/vue-quill/dist/vue-quill.snow.prod.css'

const props = defineProps({
  content: {
    type: String,
    default: () => ('')
  },
  contentType: {
    type: String as PropType<'text' | 'delta' | 'html'>,
    default: () => ('text')
  }
})

const emit = defineEmits(['update:content'])

const editorContent = computed({
  get: () => props.content,
  set: (value: string) => emit('update:content', value)
})

</script>
<template>
  <QuillEditor class="quill-editor" v-model:content="editorContent" :content-type="props.contentType" toolbar="#quill-toolbar">
    <template #toolbar>
      <div id="quill-toolbar" class="quill-toolbar">
        <span class="ql-formats">
          <button type="button" class="ql-header" value="1" />
          <button type="button" class="ql-header" value="2" />
        </span>
        <span class="ql-formats">
          <button type="button" class="ql-bold" />
          <button type="button" class="ql-italic" />
          <button type="button" class="ql-underline" />
        </span>
        <span class="ql-formats">
          <button type="button" class="ql-list" value="ordered" />
          <button type="button" class="ql-list" value="bullet" />
        </span>
      </div>
    </template>
  </QuillEditor>
</template>
