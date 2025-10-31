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
          
          <div class="tags-section">
            <label>Tags:</label>
            <div class="tags-input-group">
              <MultiSelect 
                v-model="newNote.selectedTags" 
                :options="availableTags" 
                optionLabel="name" 
                optionValue="id"
                placeholder="Selecciona tags"
                class="w-full"
              />
              <Button 
                type="button"
                icon="pi pi-plus" 
                @click="showNewTagDialog = true"
                severity="secondary"
                label="Nuevo Tag"
              />
            </div>
          </div>

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
        <template #title>
          <div class="note-header">
            <span>{{ note.title }}</span>
            <div class="note-actions">
              <Button 
                icon="pi pi-pencil" 
                size="small"
                text
                @click="openEditDialog(note)"
              />
              <Button 
                icon="pi pi-trash" 
                size="small"
                severity="danger"
                text
                @click="confirmDelete(note.id)"
              />
            </div>
          </div>
        </template>
        <template #content>
          <p>{{ note.content }}</p>
          <div class="tags" v-if="note.tags && note.tags.length">
            <Tag 
              v-for="tag in note.tags" 
              :key="tag.id" 
              :value="tag.name"
              :severity="getTagColor(tag.id)"
            />
          </div>
        </template>
      </Card>
    </div>

    <!-- Dialog para crear nuevo tag -->
    <Dialog v-model:visible="showNewTagDialog" header="Crear nuevo Tag" :style="{ width: '25rem' }">
      <div class="flex gap-3 flex-column">
        <InputText 
          v-model="newTagName" 
          placeholder="Nombre del tag"
          @keyup.enter="createTag"
        />
      </div>
      <template #footer>
        <Button label="Cancelar" text @click="showNewTagDialog = false" />
        <Button label="Crear" @click="createTag" />
      </template>
    </Dialog>

    <!-- Dialog para editar nota -->
    <Dialog v-model:visible="showEditDialog" header="Editar Nota" :style="{ width: '35rem' }">
      <div class="flex gap-3 flex-column">
        <InputText 
          v-model="editingNote.title" 
          placeholder="Título de la nota"
        />
        <Textarea 
          v-model="editingNote.content" 
          placeholder="Contenido..."
          :rows="5"
        />
        <MultiSelect 
          v-model="editingNote.selectedTags" 
          :options="availableTags" 
          optionLabel="name" 
          optionValue="id"
          placeholder="Selecciona tags"
          class="w-full"
        />
      </div>
      <template #footer>
        <Button label="Cancelar" text @click="showEditDialog = false" />
        <Button label="Guardar" @click="updateNote" />
      </template>
    </Dialog>

    <!-- Dialog de confirmación para eliminar -->
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import api from '@/services/api'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import MultiSelect from 'primevue/multiselect'
import Dialog from 'primevue/dialog'
import ConfirmDialog from 'primevue/confirmdialog'

const confirm = useConfirm()

const notes = ref([])
const availableTags = ref([])
const showNewTagDialog = ref(false)
const showEditDialog = ref(false)
const newTagName = ref('')

const newNote = ref({
  title: '',
  content: '',
  selectedTags: []
})

const editingNote = ref({
  id: null,
  title: '',
  content: '',
  selectedTags: []
})

const tagColors = ['info', 'success', 'warning', 'danger']

const getTagColor = (tagId) => {
  return tagColors[tagId % tagColors.length]
}

const fetchNotes = async () => {
  try {
    const response = await api.get('/notes')
    notes.value = response.data
  } catch (error) {
    console.error('Error fetching notes:', error)
  }
}

const fetchTags = async () => {
  try {
    const response = await api.get('/tags')
    availableTags.value = response.data
  } catch (error) {
    console.error('Error fetching tags:', error)
  }
}

const createNote = async () => {
  try {
    await api.post('/notes', {
      title: newNote.value.title,
      content: newNote.value.content,
      tags: newNote.value.selectedTags
    })
    newNote.value = { title: '', content: '', selectedTags: [] }
    fetchNotes()
  } catch (error) {
    console.error('Error creating note:', error)
  }
}

const createTag = async () => {
  if (!newTagName.value.trim()) return
  
  try {
    await api.post('/tags', { name: newTagName.value })
    newTagName.value = ''
    showNewTagDialog.value = false
    fetchTags()
  } catch (error) {
    console.error('Error creating tag:', error)
  }
}

const openEditDialog = (note) => {
  editingNote.value = {
    id: note.id,
    title: note.title,
    content: note.content,
    selectedTags: note.tags.map(tag => tag.id)
  }
  showEditDialog.value = true
}

const updateNote = async () => {
  try {
    await api.put(`/notes/${editingNote.value.id}`, {
      title: editingNote.value.title,
      content: editingNote.value.content,
      tags: editingNote.value.selectedTags
    })
    showEditDialog.value = false
    fetchNotes()
  } catch (error) {
    console.error('Error updating note:', error)
  }
}

const confirmDelete = (noteId) => {
  confirm.require({
    message: '¿Estás seguro de eliminar esta nota?',
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí, eliminar',
    rejectLabel: 'Cancelar',
    accept: () => {
      deleteNote(noteId)
    }
  })
}

const deleteNote = async (noteId) => {
  try {
    await api.delete(`/notes/${noteId}`)
    fetchNotes()
  } catch (error) {
    console.error('Error deleting note:', error)
  }
}

onMounted(() => {
  fetchNotes()
  fetchTags()
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

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.note-actions {
  display: flex;
  gap: 0.25rem;
}

.tags-section label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: block;
}

.tags-input-group {
  display: flex;
  gap: 0.5rem;
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

.flex {
  display: flex;
}

.flex-column {
  flex-direction: column;
}

.gap-3 {
  gap: 1rem;
}
</style>