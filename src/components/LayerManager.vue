<script setup>
import { defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
  layers: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['reorder', 'remove', 'add']);

// Display layers from Front (High Index) to Back (Low Index)
const displayLayers = computed(() => {
  return props.layers.map((layer, index) => ({ layer, index })).reverse();
});

const moveUp = (originalIndex) => {
  // Move towards Front (Higher Index)
  // If we are at the top (length-1), we can't move up.
  if (originalIndex < props.layers.length - 1) {
    const newLayers = [...props.layers];
    const temp = newLayers[originalIndex];
    newLayers[originalIndex] = newLayers[originalIndex + 1];
    newLayers[originalIndex + 1] = temp;
    emit('reorder', newLayers);
  }
};

const moveDown = (originalIndex) => {
  // Move towards Back (Lower Index)
  if (originalIndex > 0) {
    const newLayers = [...props.layers];
    const temp = newLayers[originalIndex];
    newLayers[originalIndex] = newLayers[originalIndex - 1];
    newLayers[originalIndex - 1] = temp;
    emit('reorder', newLayers);
  }
};

const removeLayer = (index) => {
  const layer = props.layers[index];
  if (!layer.locked) {
    emit('remove', index);
  }
};
</script>

<template>
  <div class="layer-manager">
    <div class="layer-list">
      <div
        v-for="item in displayLayers"
        :key="item.layer.id || item.index"
        class="layer-item"
        :class="{ 'is-locked': item.layer.locked }"
      >
        <!-- Thumbnail (Character Only) -->
        <div v-if="item.layer.type === 'character'" class="layer-thumb">
          <div class="char-placeholder">👤</div>
        </div>

        <div class="layer-info">
          <span class="layer-name">{{ item.layer.label }}</span>
        </div>
        <div class="layer-controls">
          <!-- Visual UP (Swaps with item above in list, which is Higher Index + 1) -->
          <button
            @click="moveUp(item.index)"
            :disabled="item.index === layers.length - 1"
            class="ctrl-btn"
            title="Bring Forward"
          >
            ↑
          </button>
          <!-- Visual DOWN (Swaps with item below in list, which is Lower Index - 1) -->
          <button
            @click="moveDown(item.index)"
            :disabled="item.index === 0"
            class="ctrl-btn"
            title="Send Backward"
          >
            ↓
          </button>
          <button
            @click="removeLayer(item.index)"
            class="ctrl-btn delete-btn"
            :disabled="item.layer.locked"
            v-if="!item.layer.locked"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.layer-manager {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  min-height: 0; /* Fix flex scrolling issue */
  padding: 0 1rem 1rem 1rem;
  box-sizing: border-box;
}

.layer-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-bottom: 0.5rem;
}

.layer-item {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0.5rem;
  gap: 0.8rem;
}

.layer-item.is-locked {
  background: #f0f8ff;
  border-color: #b0c4de;
}

.layer-thumb {
  width: 48px;
  height: 48px;
  background: #f5f5f5;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.char-placeholder {
  font-size: 1.8rem;
}

.layer-info {
  flex: 1;
  font-size: 0.95rem;
  color: #333;
  font-weight: 500;
}

.layer-controls {
  display: flex;
  gap: 0.5rem;
}

.ctrl-btn {
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #555;
  font-size: 1rem;
}

.ctrl-btn:hover:not(:disabled) {
  background: #f0f0f0;
}

.ctrl-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.delete-btn {
  color: #ef5350;
  border-color: #ef9a9a;
}
.delete-btn:hover:not(:disabled) {
  background: #ffebee;
}
</style>
