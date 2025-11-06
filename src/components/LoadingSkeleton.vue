<template>
  <div class="skeleton-container">
    <div v-if="type === 'card'" class="skeleton-card"></div>
    
    <div v-if="type === 'note'" class="note-skeleton">
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text" style="width: 80%"></div>
      <div class="skeleton skeleton-text" style="width: 40%"></div>
    </div>
    
    <div v-if="type === 'list'" class="list-skeleton">
      <div v-for="n in count" :key="n" class="skeleton-item">
        <div class="skeleton skeleton-text"></div>
      </div>
    </div>
    
    <div v-if="type === 'stat'" class="stat-skeleton">
      <div class="skeleton" style="width: 60px; height: 60px; border-radius: 50%;"></div>
      <div>
        <div class="skeleton skeleton-title" style="width: 80px"></div>
        <div class="skeleton skeleton-text" style="width: 120px"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'card'
  },
  count: {
    type: Number,
    default: 3
  }
})
</script>

<style scoped>
.skeleton-container {
  width: 100%;
}

.note-skeleton {
  padding: 1.5rem;
  background: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.list-skeleton {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-item {
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.stat-skeleton {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}
</style>