<template>
  <div class="notes-container">
    <h1>Mis Notas</h1>
    
    <!-- Barra de búsqueda y filtros -->
    <Card class="search-card">
      <template #content>
        <div class="search-section">
          <div class="search-bar">
            <IconField iconPosition="left" class="w-full">
              <InputIcon class="pi pi-search" />
              <InputText 
                v-model="searchQuery"
                @input="searchNotes"
                placeholder="Buscar notas..."
                class="w-full"
              />
            </IconField>
          </div>
          
          <div class="filter-bar">
            <Dropdown 
              v-model="selectedTagFilter" 
              :options="tagFilterOptions" 
              optionLabel="name" 
              optionValue="id"
              placeholder="Filtrar por tag"
              showClear
              @change="filterByTag"
              class="w-full"
            />
            
            <Button 
              label="Limpiar filtros" 
              icon="pi pi-filter-slash"
              severity="secondary"
              text
              @click="clearFilters"
              v-if="searchQuery || selectedTagFilter"
            />
          </div>
          
          <div class="notes-count">
            <span>{{ notes.length }} nota(s) encontrada(s)</span>
          </div>
        </div>
      </template>
    </Card>
    
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

    <div class="notes-list" v-if="notes.length > 0">
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
              @click="quickFilterByTag(tag.id)"
              style="cursor: pointer;"
            />
          </div>
        </template>
      </Card>
    </div>
    
    <div v-else class="empty-state">
      <i class="pi pi-inbox" style="font-size: 3rem; color: #ccc;"></i>
      <p>No se encontraron notas</p>
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
import { ref, computed, onMounted } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import api from '@/services/api'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import MultiSelect from 'primevue/multiselect'
import Dropdown from 'primevue/dropdown'
import Dialog from 'primevue/dialog'
import ConfirmDialog from 'primevue/confirmdialog'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'

const confirm = useConfirm()

const notes = ref([])
const availableTags = ref([])
const showNewTagDialog = ref(false)
const showEditDialog = ref(false)
const newTagName = ref('')
const searchQuery = ref('')
const selectedTagFilter = ref(null)

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

const tagFilterOptions = computed(() => {
  return availableTags.value
})

const tagColors = ['info', 'success', 'warning', 'danger']

const getTagColor = (tagId) => {
  return tagColors[tagId % tagColors.length]
}

const fetchNotes = async (params = {}) => {
  try {
    const response = await api.get('/notes', { params })
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

const searchNotes = () => {
  const params = {}
  if (searchQuery.value) {
    params.search = searchQuery.value
  }
  if (selectedTagFilter.value) {
    params.tag = selectedTagFilter.value
  }
  fetchNotes(params)
}

const filterByTag = () => {
  const params = {}
  if (searchQuery.value) {
    params.search = searchQuery.value
  }
  if (selectedTagFilter.value) {
    params.tag = selectedTagFilter.value
  }
  fetchNotes(params)
}

const quickFilterByTag = (tagId) => {
  selectedTagFilter.value = tagId
  filterByTag()
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedTagFilter.value = null
  fetchNotes()
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
    
    // Mantener filtros activos después de actualizar
    const params = {}
    if (searchQuery.value) params.search = searchQuery.value
    if (selectedTagFilter.value) params.tag = selectedTagFilter.value
    fetchNotes(params)
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
    
    // Mantener filtros activos después de eliminar
    const params = {}
    if (searchQuery.value) params.search = searchQuery.value
    if (selectedTagFilter.value) params.tag = selectedTagFilter.value
    fetchNotes(params)
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

.search-card {
  margin-bottom: 1.5rem;
}

.search-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-bar,
.filter-bar {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.notes-count {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
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

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #999;
}

.empty-state p {
  margin-top: 1rem;
  font-size: 1.1rem;
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