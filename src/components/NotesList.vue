<template>
  <div class="notes-container">
    <h1>Mis Notas</h1>
    
    <Card>
      <template #content>
        <form @submit.prevent="createNote" class="note-form">
          <InputText 
            v-model="newNote.title" 
            placeholder="Título de la nota"
            class="w-full"
          />
          <Textarea 
            v-model="newNote.content" 
            placeholder="Contenido..."
            :rows="5"
            class="w-full"
          />
          <Button 
            type="submit" 
            label="Crear Nota" 
            icon="pi pi-plus"
            class="w-full"
          />
        </form>
      </template>
    </Card>

    <div class="notes-list">
      <Card v-for="note in notes" :key="note.id">
        <template #title>{{ note.title }}</template>
        <template #content>
          <p>{{ note.content }}</p>
          <div class="tags" v-if="note.tags && note.tags.length">
            <Tag 
              v-for="tag in note.tags" 
              :key="tag.id" 
              :value="tag.name"
              severity="info"
            />
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Tag from 'primevue/tag'

const notes = ref([])
const newNote = ref({
  title: '',
  content: ''
})

const fetchNotes = async () => {
  try {
    const response = await api.get('/notes')
    notes.value = response.data
  } catch (error) {
    console.error('Error fetching notes:', error)
  }
}

const createNote = async () => {
  try {
    await api.post('/notes', newNote.value)
    newNote.value = { title: '', content: '' }
    fetchNotes()
  } catch (error) {
    console.error('Error creating note:', error)
  }
}

onMounted(() => {
  fetchNotes()
})
</script>

<style scoped>
.notes-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.note-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notes-list {
  display: grid;
  gap: 1rem;
  margin-top: 2rem;
}

.tags {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.w-full {
  width: 100%;
}
</style>