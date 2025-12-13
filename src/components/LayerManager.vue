<script setup>
import { defineProps, defineEmits } from 'vue';
import SkeletonImage from './SkeletonImage.vue';

const props = defineProps({
  layers: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['reorder', 'remove', 'add']);

const moveUp = (index) => {
  if (index > 0) {
    const newLayers = [...props.layers];
    const temp = newLayers[index];
    newLayers[index] = newLayers[index - 1];
    newLayers[index - 1] = temp;
    emit('reorder', newLayers);
  }
};

const moveDown = (index) => {
  if (index < props.layers.length - 1) {
    const newLayers = [...props.layers];
    const temp = newLayers[index];
    newLayers[index] = newLayers[index + 1];
    newLayers[index + 1] = temp;
    emit('reorder', newLayers);
  }
};

const removeLayer = (index) => {
  const layer = props.layers[index];
  if (layer.type !== 'character') {
    // Protect Character layer
    emit('remove', index);
  }
};
</script>

<template>
  <div class="layer-manager">
    <div class="layer-list">
      <div
        v-for="(layer, index) in layers"
        :key="layer.id || index"
        class="layer-item"
        :class="{ 'is-character': layer.type === 'character' }"
      >
        <div class="layer-thumb">
          <SkeletonImage
            v-if="layer.type === 'image'"
            :src="layer.value"
            alt="Thumb"
            class="thumb-img"
          />
          <div v-else class="char-placeholder">👤</div>
        </div>
        <div class="layer-info">
          <span class="layer-name">{{ layer.label }}</span>
        </div>
        <div class="layer-controls">
          <button
            @click="moveUp(index)"
            :disabled="index === 0"
            class="ctrl-btn"
          >
            ↑
          </button>
          <button
            @click="moveDown(index)"
            :disabled="index === layers.length - 1"
            class="ctrl-btn"
          >
            ↓
          </button>
          <button
            @click="removeLayer(index)"
            class="ctrl-btn delete-btn"
            :disabled="layer.type === 'character'"
            v-if="layer.type !== 'character'"
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

.layer-item.is-character {
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
