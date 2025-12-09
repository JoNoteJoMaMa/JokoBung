<script setup>
import { defineProps, defineEmits } from 'vue';
import SkeletonImage from './SkeletonImage.vue';

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  mode: {
    type: String, // 'color', 'folder', 'image', 'category'
    default: 'image',
  },
  showAddButton: {
    type: Boolean,
    default: false,
  },
  selectedValue: {
    type: [String, Object],
    default: null,
  },
});

const emit = defineEmits(['select', 'add']);
</script>

<template>
  <div class="popup-slider" :class="{ 'centered-slider': mode === 'color' }">
    <div class="slider-container">
      <!-- Items List -->
      <div
        v-for="item in items"
        :key="item.id"
        class="slider-item"
        @click="$emit('select', item)"
      >
        <!-- Color Mode -->
        <div
          v-if="item.type === 'color'"
          class="color-swatch"
          :class="{ selected: item.value === selectedValue }"
          :style="{ backgroundColor: item.value }"
        ></div>

        <!-- Folder Mode -->
        <div v-if="item.type === 'folder'" class="folder-box">
          <svg
            v-if="item.icon"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            :viewBox="item.icon.viewBox || '0 0 24 24'"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path :d="item.icon.path"></path>
            <!-- Render second path if exists (hacky for simple items, but mainly checked against single path) -->
            <template v-if="item.icon.paths">
              <path v-for="(p, idx) in item.icon.paths" :key="idx" :d="p" />
            </template>
            <!-- Wait, the eye icon example I used has two paths in one string 'M... z M... z' which works in 'd' attribute? Yes standard SVG allows multiple commands. -->
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
            ></path>
          </svg>
          <span class="item-label">{{ item.label }}</span>
        </div>

        <!-- Image Mode -->
        <div v-if="item.type === 'image' || item.type === 'remove'">
          <!-- Remove Button Special Case -->
          <div v-if="item.type === 'remove'" class="image-box default-box">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            <span class="item-label">Default</span>
          </div>
          <!-- Normal Image -->
          <div
            v-else
            class="image-box"
            :class="{ selected: item.value === selectedValue }"
          >
            <SkeletonImage :src="item.value" :alt="item.label" />
          </div>
          <span v-if="item.type !== 'remove'" class="item-label">{{
            item.label
          }}</span>
        </div>

        <!-- Category Mode -->
        <div v-if="item.type === 'category'" class="folder-box">
          <!-- Reuse folder style but maybe different icon -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          <span class="item-label">{{ item.label }}</span>
        </div>
      </div>

      <!-- Add Button for Color Mode -->
      <div v-if="showAddButton" class="slider-item">
        <button class="add-btn" @click="$emit('add')">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.popup-slider {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding: 1rem 0; /* Vertical padding only on scroll container */
}

.slider-container {
  display: flex;
  gap: 1rem;
  padding: 0 1rem; /* Horizontal padding inside scroll content */
  /* Ensure minimal width so it scrolls */
  min-width: max-content;
}

.slider-item {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.color-swatch {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid #ddd;
  transition: transform 0.2s, border-color 0.2s;
}

.color-swatch.selected {
  border-color: #213547;
  transform: scale(1.1);
  box-shadow: 0 0 0 2px #213547;
}

.folder-box,
.image-box {
  width: 80px;
  height: 80px;
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #213547;
  transition: all 0.2s;
}

.image-box img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 10px;
}

.image-box.selected,
.folder-box.selected {
  border: 3px solid #66bb6a; /* Green highlight */
  background-color: #e8f5e9;
}

.default-box {
  color: #ef5350; /* Red for remove/default */
}

.item-label {
  display: block; /* Ensure it behaves like a block for width/align */
  font-size: 0.8rem;
  color: #555;
  text-align: center;
  width: 90px;
  line-height: 1.2;
}

.add-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #ffffff;
  border: 2px dashed #aaa;
  color: #aaa;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0; /* Important for exact centering */
}

.centered-slider {
  margin-top: auto;
  margin-bottom: auto;
}

.folder-icon {
  width: 60%;
  height: 60%;
  object-fit: contain;
  margin-bottom: 0.2rem;
}
</style>
