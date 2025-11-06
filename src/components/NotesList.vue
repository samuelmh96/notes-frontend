<template>
  <div class="notes-container">
    <h1>Mis Notas</h1>
    <Toast position="top-right" />

    <!-- Barra de búsqueda y filtros -->
    <Card class="search-card">
      <template #content>
        <div class="search-section">
          <div class="search-bar">
            <IconField iconPosition="left" class="w-full">
              <InputIcon class="pi pi-search" />
              <InputText v-model="searchQuery" @input="searchNotes" placeholder="Buscar notas..." class="w-full" />
            </IconField>
          </div>

          <div class="filter-bar">
            <Dropdown v-model="selectedTagFilter" :options="tagFilterOptions" optionLabel="name" optionValue="id"
              placeholder="Filtrar por tag" showClear @change="filterByTag" class="filter-item" />

            <Dropdown v-model="sortBy" :options="sortOptions" optionLabel="label" optionValue="value"
              placeholder="Ordenar por" @change="handleSortChange" class="filter-item" />

            <Button :label="showOnlyFavorites ? 'Mostrar todas' : 'Solo favoritas'"
              :icon="showOnlyFavorites ? 'pi pi-star-fill' : 'pi pi-star'"
              :severity="showOnlyFavorites ? 'warning' : 'secondary'" @click="toggleFavoritesFilter" />

            <Button label="Limpiar" icon="pi pi-filter-slash" severity="secondary" text @click="clearFilters"
              v-if="searchQuery || selectedTagFilter || showOnlyFavorites" />
          </div>

          <div class="notes-count">
            <span>{{ totalNotes }} nota(s) total(es)</span>
            <Dropdown v-model="perPage" :options="perPageOptions" optionLabel="label" optionValue="value"
              @change="handlePerPageChange" class="per-page-selector" />
          </div>
        </div>
      </template>
    </Card>

    <Card>
      <template #content>
        <form @submit.prevent="createNote" class="note-form">
          <InputText v-model="newNote.title" placeholder="Título de la nota" class="w-full" />
          <Textarea v-model="newNote.content" placeholder="Contenido..." :rows="5" class="w-full" />

          <div class="tags-section">
            <label>Tags:</label>
            <div class="tags-input-group">
              <MultiSelect v-model="newNote.selectedTags" :options="availableTags" optionLabel="name" optionValue="id"
                placeholder="Selecciona tags" class="w-full" />
              <Button type="button" icon="pi pi-plus" @click="showNewTagDialog = true" severity="secondary"
                label="Nuevo Tag" />
            </div>
          </div>

          <Button type="submit" label="Crear Nota" icon="pi pi-plus" class="w-full" :loading="isCreating" />
        </form>
      </template>
    </Card>

    <!-- Botón de exportación -->
    <div class="export-section" v-if="notes.length > 0">
      <Button label="Exportar notas" icon="pi pi-download" @click="toggleExportMenu" outlined />
      <Menu ref="exportMenu" :model="exportMenuItems" :popup="true" />
    </div>

    <!-- Loading skeletons -->
    <div class="notes-list" v-if="isLoadingNotes">
      <LoadingSkeleton type="note" v-for="n in perPage" :key="n" />
    </div>

    <!-- Lista de notas -->
    <div class="notes-list" v-else-if="notes.length > 0">
      <Card v-for="note in notes" :key="note.id">
        <template #title>
          <div class="note-header">
            <div class="note-title-section">
              <Button :icon="note.is_favorite ? 'pi pi-star-fill' : 'pi pi-star'" text rounded size="small"
                :severity="note.is_favorite ? 'warning' : 'secondary'" @click="toggleFavorite(note.id)"
                v-tooltip.top="note.is_favorite ? 'Quitar de favoritos' : 'Marcar como favorito'" />
              <span>{{ note.title }}</span>
            </div>
            <div class="note-actions">
              <Button icon="pi pi-file-pdf" size="small" text severity="secondary" @click="handleExportSingleNote(note)"
                v-tooltip.bottom="'Exportar a PDF'" />
              <Button icon="pi pi-pencil" size="small" text @click="openEditDialog(note)"
                v-tooltip.bottom="'Editar nota'" />
              <Button icon="pi pi-trash" size="small" severity="danger" text @click="confirmDelete(note)"
                v-tooltip.bottom="'Eliminar nota'" />
            </div>
          </div>
        </template>
        <template #content>
          <p>{{ note.content }}</p>
          <div class="tags" v-if="note.tags && note.tags.length">
            <Tag v-for="tag in note.tags" :key="tag.id" :value="tag.name" :severity="getTagColor(tag.id)"
              @click="quickFilterByTag(tag.id)" style="cursor: pointer;" />
          </div>
        </template>
      </Card>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <i class="pi pi-inbox" style="font-size: 3rem; color: #ccc;"></i>
      <p>No se encontraron notas</p>
    </div>

    <!-- Agregar paginador aquí -->
    <Paginator v-if="totalNotes > perPage" :rows="perPage" :totalRecords="totalNotes"
      :first="(currentPage - 1) * perPage" @page="handlePageChange" class="notes-paginator" />

    <div v-if="notes.length === 0" class="empty-state">
      <!-- ... -->
    </div>


    <!-- Dialog para crear nuevo tag -->
    <Dialog v-model:visible="showNewTagDialog" header="Crear nuevo Tag" :style="{ width: '25rem' }">
      <div class="flex gap-3 flex-column">
        <InputText v-model="newTagName" placeholder="Nombre del tag" @keyup.enter="createTag" />
      </div>
      <template #footer>
        <Button label="Cancelar" text @click="showNewTagDialog = false" />
        <Button label="Crear" @click="createTag" />
      </template>
    </Dialog>

    <!-- Dialog para editar nota -->
    <Dialog v-model:visible="showEditDialog" header="Editar Nota" :style="{ width: '35rem' }">
      <div class="flex gap-3 flex-column">
        <InputText v-model="editingNote.title" placeholder="Título de la nota" />
        <Textarea v-model="editingNote.content" placeholder="Contenido..." :rows="5" />
        <MultiSelect v-model="editingNote.selectedTags" :options="availableTags" optionLabel="name" optionValue="id"
          placeholder="Selecciona tags" class="w-full" />
      </div>
      <template #footer>
        <Button label="Cancelar" text @click="showEditDialog = false" />
        <Button label="Guardar" @click="updateNote" :loading="isUpdating" />
      </template>
    </Dialog>

    <!-- Dialog de confirmación para eliminar -->
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script setup>
import Paginator from 'primevue/paginator'
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
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
import { exportNotesToPDF, exportSingleNoteToPDF, exportNotesToCSV } from '@/utils/exportNotes'
import Menu from 'primevue/menu'
import LoadingSkeleton from './LoadingSkeleton.vue'
import Tooltip from 'primevue/tooltip'

const confirm = useConfirm()

const notes = ref([])
const availableTags = ref([])
const showNewTagDialog = ref(false)
const showEditDialog = ref(false)
const newTagName = ref('')
const searchQuery = ref('')
const selectedTagFilter = ref(null)

const showOnlyFavorites = ref(false)
const sortBy = ref('date_desc')

const currentPage = ref(1)
const perPage = ref(10)
const totalNotes = ref(0)
const lastPage = ref(1)

const allNotes = ref([]) // Para guardar todas las notas sin paginar
const isLoadingNotes = ref(false)
const vTooltip = Tooltip

const perPageOptions = [
  { label: '5 por página', value: 5 },
  { label: '10 por página', value: 10 },
  { label: '20 por página', value: 20 },
  { label: '50 por página', value: 50 }
]

const sortOptions = [
  { label: 'Más recientes', value: 'date_desc' },
  { label: 'Más antiguas', value: 'date_asc' },
  { label: 'Título A-Z', value: 'title_asc' },
  { label: 'Título Z-A', value: 'title_desc' },
  { label: 'Favoritas primero', value: 'favorites' }
]

const toast = useToast()
const isCreating = ref(false)
const isUpdating = ref(false)

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

const exportMenu = ref()
const exportMenuItems = ref([
  {
    label: 'Exportar a PDF',
    icon: 'pi pi-file-pdf',
    command: () => handleExportPDF()
  },
  {
    label: 'Exportar a CSV',
    icon: 'pi pi-file-excel',
    command: () => handleExportCSV()
  }
])

const tagFilterOptions = computed(() => {
  return availableTags.value
})

const tagColors = ['info', 'success', 'warning', 'danger']

const getTagColor = (tagId) => {
  return tagColors[tagId % tagColors.length]
}

const fetchNotes = async (params = {}) => {
  isLoadingNotes.value = true
  try {
    const allParams = {
      ...params,
      sort: sortBy.value,
      favorites: showOnlyFavorites.value,
      page: currentPage.value,
      per_page: perPage.value
    }

    const response = await api.get('/notes', { params: allParams })

    notes.value = response.data.data
    totalNotes.value = response.data.total
    lastPage.value = response.data.last_page
    currentPage.value = response.data.current_page
  } catch (error) {
    console.error('Error fetching notes:', error)
  } finally {
    isLoadingNotes.value = false
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
  currentPage.value = 1 // Agregar esta línea
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
  currentPage.value = 1 // Agregar esta línea
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
  showOnlyFavorites.value = false
  sortBy.value = 'date_desc'
  currentPage.value = 1
  fetchNotes()
}

const createNote = async () => {
  // Validación frontend
  if (!newNote.value.title.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Título requerido',
      detail: 'Por favor ingresa un título para la nota',
      life: 3000
    })
    return
  }

  if (!newNote.value.content.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Contenido requerido',
      detail: 'Por favor ingresa contenido para la nota',
      life: 3000
    })
    return
  }

  isCreating.value = true

  try {
    const response = await api.post('/notes', {
      title: newNote.value.title,
      content: newNote.value.content,
      tags: newNote.value.selectedTags
    })

    newNote.value = { title: '', content: '', selectedTags: [] }
    fetchNotes()

    toast.add({
      severity: 'success',
      summary: 'Nota creada',
      detail: response.data.message || 'La nota se creó exitosamente',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'No se pudo crear la nota',
      life: 3000
    })
  } finally {
    isCreating.value = false
  }
}

const createTag = async () => {
  if (!newTagName.value.trim()) return

  try {
    await api.post('/tags', { name: newTagName.value })
    newTagName.value = ''
    showNewTagDialog.value = false
    fetchTags()
    toast.add({
      severity: 'success',
      summary: 'Tag creado',
      detail: 'El tag se creó exitosamente',
      life: 3000
    })
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
  if (!editingNote.value.title.trim() || !editingNote.value.content.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Campos requeridos',
      detail: 'Título y contenido son obligatorios',
      life: 3000
    })
    return
  }

  isUpdating.value = true

  try {
    const response = await api.put(`/notes/${editingNote.value.id}`, {
      title: editingNote.value.title,
      content: editingNote.value.content,
      tags: editingNote.value.selectedTags
    })

    showEditDialog.value = false

    const params = {}
    if (searchQuery.value) params.search = searchQuery.value
    if (selectedTagFilter.value) params.tag = selectedTagFilter.value
    fetchNotes(params)

    toast.add({
      severity: 'success',
      summary: 'Nota actualizada',
      detail: response.data.message || 'La nota se actualizó exitosamente',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'No se pudo actualizar la nota',
      life: 3000
    })
  } finally {
    isUpdating.value = false
  }
}

const confirmDelete = (note) => {
  confirm.require({
    message: `¿Estás seguro de eliminar la nota "${note.title}"?`,
    header: '⚠️ Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí, eliminar',
    rejectLabel: 'Cancelar',
    acceptClass: 'p-button-danger',
    accept: () => {
      deleteNote(note.id)
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
    toast.add({
      severity: 'success',
      summary: 'Nota eliminada',
      detail: 'La nota se eliminó exitosamente',
      life: 3000
    })
  } catch (error) {
    console.error('Error deleting note:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo eliminar la nota',
      life: 3000
    })
  }
}
const toggleFavorite = async (noteId) => {
  try {
    const response = await api.post(`/notes/${noteId}/toggle-favorite`)

    // Mantener filtros activos después de actualizar
    const params = {}
    if (searchQuery.value) params.search = searchQuery.value
    if (selectedTagFilter.value) params.tag = selectedTagFilter.value
    fetchNotes(params)

    toast.add({
      severity: 'success',
      summary: 'Actualizado',
      detail: response.data.message,
      life: 2000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo actualizar la nota',
      life: 3000
    })
  }
}

const handleSortChange = () => {
  currentPage.value = 1 // Agregar esta línea
  const params = {}
  if (searchQuery.value) params.search = searchQuery.value
  if (selectedTagFilter.value) params.tag = selectedTagFilter.value
  fetchNotes(params)
}

const toggleFavoritesFilter = () => {
  showOnlyFavorites.value = !showOnlyFavorites.value
  currentPage.value = 1 // Agregar esta línea
  const params = {}
  if (searchQuery.value) params.search = searchQuery.value
  if (selectedTagFilter.value) params.tag = selectedTagFilter.value
  fetchNotes(params)
}

const handlePageChange = (event) => {
  currentPage.value = event.page + 1 // PrimeVue usa base 0, Laravel usa base 1
  const params = {}
  if (searchQuery.value) params.search = searchQuery.value
  if (selectedTagFilter.value) params.tag = selectedTagFilter.value
  fetchNotes(params)

  // Scroll suave al inicio
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handlePerPageChange = () => {
  currentPage.value = 1 // Reset a primera página
  const params = {}
  if (searchQuery.value) params.search = searchQuery.value
  if (selectedTagFilter.value) params.tag = selectedTagFilter.value
  fetchNotes(params)
}

const handleExportPDF = async () => {
  if (totalNotes.value === 0) {
    toast.add({
      severity: 'warn',
      summary: 'Sin notas',
      detail: 'No hay notas para exportar',
      life: 3000
    })
    return
  }

  try {
    // Obtener TODAS las notas, no solo la página actual
    const allNotesData = await fetchAllNotes()

    if (allNotesData.length === 0) {
      toast.add({
        severity: 'warn',
        summary: 'Sin notas',
        detail: 'No hay notas para exportar',
        life: 3000
      })
      return
    }

    exportNotesToPDF(allNotesData)
    toast.add({
      severity: 'success',
      summary: 'PDF exportado',
      detail: `${allNotesData.length} nota(s) exportada(s) correctamente`,
      life: 3000
    })
  } catch (error) {
    console.error('Error al exportar PDF:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'No se pudo exportar a PDF',
      life: 3000
    })
  }
}

const handleExportCSV = async () => {
  if (totalNotes.value === 0) {
    toast.add({
      severity: 'warn',
      summary: 'Sin notas',
      detail: 'No hay notas para exportar',
      life: 3000
    })
    return
  }

  try {
    // Obtener TODAS las notas, no solo la página actual
    const allNotesData = await fetchAllNotes()

    if (allNotesData.length === 0) {
      toast.add({
        severity: 'warn',
        summary: 'Sin notas',
        detail: 'No hay notas para exportar',
        life: 3000
      })
      return
    }

    exportNotesToCSV(allNotesData)
    toast.add({
      severity: 'success',
      summary: 'CSV exportado',
      detail: `${allNotesData.length} nota(s) exportada(s) correctamente`,
      life: 3000
    })
  } catch (error) {
    console.error('Error al exportar CSV:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'No se pudo exportar a CSV',
      life: 3000
    })
  }
}

const handleExportSingleNote = (note) => {
  try {
    exportSingleNoteToPDF(note)
    toast.add({
      severity: 'success',
      summary: 'PDF exportado',
      detail: `Nota "${note.title}" exportada`,
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo exportar la nota',
      life: 3000
    })
  }
}

const toggleExportMenu = (event) => {
  exportMenu.value.toggle(event)
}

const fetchAllNotes = async () => {
  try {
    const allParams = {
      sort: sortBy.value,
      favorites: showOnlyFavorites.value,
      per_page: 1000 // Obtener todas (límite alto)
    }

    if (searchQuery.value) allParams.search = searchQuery.value
    if (selectedTagFilter.value) allParams.tag = selectedTagFilter.value

    const response = await api.get('/notes', { params: allParams })
    return response.data.data || response.data // Manejar respuesta paginada o no
  } catch (error) {
    console.error('Error fetching all notes:', error)
    return []
  }
}

onMounted(() => {
  fetchNotes()
  fetchTags()
})
</script>

<style scoped>
.notes-container {
  max-width: 1200px;
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
  flex-wrap: wrap;
}

.filter-item {
  min-width: 180px;
  flex: 1;
}

.notes-count {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
  flex-wrap: wrap;
  gap: 1rem;
}

.per-page-selector {
  min-width: 150px;
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
  flex-wrap: wrap;
  gap: 0.5rem;
}

.note-title-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}

.note-title-section span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.note-actions {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
}

.tags-section label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: block;
}

.tags-input-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.notes-list {
  display: grid;
  gap: 1rem;
  margin-top: 2rem;
  grid-template-columns: 1fr;
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

.notes-paginator {
  margin-top: 2rem;
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

.export-section {
  margin: 1rem 0;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 767px) {
  .export-section {
    justify-content: stretch;
  }

  .export-section button {
    width: 100%;
  }
}

/* Responsive Design */

/* Tablets */
@media (min-width: 768px) {
  .notes-list {
    grid-template-columns: repeat(2, 1fr);
  }

  .filter-bar {
    flex-wrap: nowrap;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .notes-container {
    padding: 30px;
  }

  .notes-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Large Desktop */
@media (min-width: 1400px) {
  .notes-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Mobile específico */
@media (max-width: 767px) {
  .notes-container {
    padding: 15px;
  }

  .search-card,
  .note-form {
    margin-bottom: 1rem;
  }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-item {
    width: 100%;
    min-width: auto;
  }

  .notes-count {
    flex-direction: column;
    align-items: stretch;
  }

  .per-page-selector {
    width: 100%;
  }

  .tags-input-group {
    flex-direction: column;
  }

  .tags-input-group>* {
    width: 100%;
  }
}
</style>