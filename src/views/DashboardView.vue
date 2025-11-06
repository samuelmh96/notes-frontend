<template>
  <div>
    <Navbar />
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>📊 Dashboard</h1>
        <p>Resumen de tus notas</p>
      </div>
      <!-- Loading skeletons -->
      <div class="stats-grid" v-if="loading">
        <LoadingSkeleton type="stat" v-for="n in 3" :key="n" />
      </div>
      <div class="stats-grid" v-else>
        <!-- Card: Total de notas -->
        <Card class="stat-card">
          <template #content>
            <div class="stat-content">
              <i class="pi pi-book stat-icon"></i>
              <div>
                <div class="stat-number">{{ stats.total_notes }}</div>
                <div class="stat-label">Total de Notas</div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Card: Notas favoritas -->
        <Card class="stat-card">
          <template #content>
            <div class="stat-content">
              <i class="pi pi-star-fill stat-icon star"></i>
              <div>
                <div class="stat-number">{{ stats.favorite_notes }}</div>
                <div class="stat-label">Notas Favoritas</div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Card: Tags -->
        <Card class="stat-card">
          <template #content>
            <div class="stat-content">
              <i class="pi pi-tags stat-icon"></i>
              <div>
                <div class="stat-number">{{ stats.top_tags?.length || 0 }}</div>
                <div class="stat-label">Tags en Uso</div>
              </div>
            </div>
          </template>
        </Card>
      </div>
      <!-- Loading skeletons para dashboard grid -->
      <div class="dashboard-grid" v-if="loading">
        <Card class="chart-card">
          <template #content>
            <div class="skeleton skeleton-card"></div>
          </template>
        </Card>
        <Card class="list-card">
          <template #content>
            <LoadingSkeleton type="list" :count="5" />
          </template>
        </Card>
      </div>

      <div class="dashboard-grid" v-else>
        <!-- Gráfico de notas por tag -->
        <Card class="chart-card">
          <template #title>Notas por Tag</template>
          <template #content>
            <div class="chart-container" v-if="stats.notes_by_tag?.length > 0">
              <Chart type="bar" :data="chartData" :options="chartOptions" />
            </div>
            <div v-else class="empty-chart">
              <i class="pi pi-chart-bar"></i>
              <p>No hay datos para mostrar</p>
            </div>
          </template>
        </Card>

        <!-- Tags más usados -->
        <Card class="list-card">
          <template #title>Tags Más Usados</template>
          <template #content>
            <div class="tags-list" v-if="stats.top_tags?.length > 0">
              <div v-for="tag in stats.top_tags" :key="tag.id" class="tag-item">
                <Tag :value="tag.name" />
                <span class="tag-count">{{ tag.usage_count }} nota(s)</span>
              </div>
            </div>
            <div v-else class="empty-list">
              <i class="pi pi-tags"></i>
              <p>No hay tags todavía</p>
            </div>
          </template>
        </Card>

        <!-- Notas recientes -->
        <Card class="list-card recent-notes">
          <template #title>Notas Recientes</template>
          <template #content>
            <div class="notes-list" v-if="stats.recent_notes?.length > 0">
              <div v-for="note in stats.recent_notes" :key="note.id" class="note-item" @click="goToNotes">
                <div class="note-info">
                  <i v-if="note.is_favorite" class="pi pi-star-fill favorite-icon"></i>
                  <span class="note-title">{{ note.title }}</span>
                </div>
                <span class="note-date">{{ formatDate(note.created_at) }}</span>
              </div>
            </div>
            <div v-else class="empty-list">
              <i class="pi pi-file"></i>
              <p>No hay notas todavía</p>
            </div>
          </template>
        </Card>
      </div>

      <div v-if="loading" class="loading-state">
        <ProgressSpinner />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import Navbar from '../components/Navbar.vue'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import ProgressSpinner from 'primevue/progressspinner'
import Chart from 'primevue/chart'
import LoadingSkeleton from '../components/LoadingSkeleton.vue'

const router = useRouter()
const loading = ref(true)
const stats = ref({
  total_notes: 0,
  favorite_notes: 0,
  notes_by_tag: [],
  recent_notes: [],
  top_tags: []
})

const chartData = computed(() => ({
  labels: stats.value.notes_by_tag?.map(item => item.name) || [],
  datasets: [
    {
      label: 'Cantidad de Notas',
      backgroundColor: '#667eea',
      borderColor: '#667eea',
      data: stats.value.notes_by_tag?.map(item => item.total) || []
    }
  ]
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1
      }
    }
  }
}))

const fetchStats = async () => {
  loading.value = true
  try {
    const response = await api.get('/stats')
    stats.value = response.data
  } catch (error) {
    console.error('Error fetching stats:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const goToNotes = () => {
  router.push('/')
}

onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
}

.dashboard-header p {
  color: var(--text-secondary);
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--bg-card);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.stat-icon {
  font-size: 3rem;
  color: #667eea;
}

.stat-icon.star {
  color: #f59e0b;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.chart-card,
.list-card {
  background: var(--bg-card);
}

.recent-notes {
  grid-column: span 2;
}

.chart-container {
  height: 300px;
  padding: 1rem 0;
}

.empty-chart,
.empty-list {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.empty-chart i,
.empty-list i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.tags-list,
.notes-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tag-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.tag-count {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.note-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.note-item:hover {
  background: var(--border-color);
}

.note-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}

.favorite-icon {
  color: #f59e0b;
  font-size: 0.9rem;
}

.note-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.note-date {
  color: var(--text-secondary);
  font-size: 0.85rem;
  flex-shrink: 0;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

/* Responsive */
@media (max-width: 767px) {
  .dashboard-container {
    padding: 15px;
  }

  .dashboard-header h1 {
    font-size: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .recent-notes {
    grid-column: span 1;
  }

  .stat-content {
    gap: 1rem;
  }

  .stat-icon {
    font-size: 2rem;
  }

  .stat-number {
    font-size: 2rem;
  }
}
</style>