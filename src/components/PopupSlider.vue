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
    type: [String, Object, Array],
    default: null,
  },
});

const isSelected = (item) => {
  if (!props.selectedValue) return false;

  const normalize = (v) => String(v).toLowerCase();
  const itemVal = normalize(item.value);

  if (Array.isArray(props.selectedValue)) {
    return props.selectedValue.some((v) => normalize(v) === itemVal);
  }
  return itemVal === normalize(props.selectedValue);
};
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
          :class="{
            selected: isSelected(item),
          }"
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
            style="margin-bottom: 0px"
          >
            <path :d="item.icon.path"></path>
            <template v-if="item.icon.paths">
              <path v-for="(p, idx) in item.icon.paths" :key="idx" :d="p" />
            </template>
          </svg>
          <!-- Generic icon removed -->
          <span class="item-label">{{ item.label }}</span>
        </div>

        <!-- Image Mode -->
        <div
          v-if="
            (item.type === 'image' || item.type === 'remove') &&
            item.style !== 'folder'
          "
        >
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
            <span class="item-label">{{ item.label }}</span>
          </div>
          <!-- Normal Image -->
          <div
            v-else
            class="image-box"
            :class="{
              selected: isSelected(item),
            }"
          >
            <!-- Dual Layer Mode (Back then Front) -->
            <template v-if="item.front || item.back || item.stroke || item.bg">
              <SkeletonImage
                v-if="item.back || item.bg"
                :src="item.back || item.bg"
                :alt="item.label + ' Back'"
                class="multi-layer-img layer-back"
              />
              <SkeletonImage
                v-if="item.front || item.stroke"
                :src="item.front || item.stroke"
                :alt="item.label + ' Front'"
                class="multi-layer-img layer-front"
              />
            </template>
            <!-- Single Image Mode -->
            <SkeletonImage v-else :src="item.value" :alt="item.label" />
          </div>
          <span v-if="item.type !== 'remove'" class="item-label">{{
            item.label
          }}</span>
        </div>

        <!-- Category Mode (or forced Folder style) -->
        <div
          v-if="item.type === 'category' || item.style === 'folder'"
          class="folder-box"
        >
          <!-- Reuse folder style but maybe different icon -->
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
            style="margin-bottom: 0px"
          >
            <path :d="item.icon.path"></path>
            <template v-if="item.icon.paths">
              <path v-for="(p, idx) in item.icon.paths" :key="idx" :d="p" />
            </template>
          </svg>
          <!-- Generic icon style removed -->
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
  overflow-y: hidden; /* Disable vertical scroll */
  -webkit-overflow-scrolling: touch;
  padding: 0.2rem 0 1rem 0;
}

.slider-container {
  display: flex;
  gap: 0.5rem;
  padding: 0 1rem;
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

.item-label {
  display: block;
  font-size: 0.9rem;
  color: #000;
  text-align: center;
  /* full length means auto width and no truncate */
  width: auto;
  min-width: 90px; /* Keep minimum but allow growth */
  white-space: normal; /* Allow wrapping */
  font-weight: 600;
  margin-top: 0.5rem;
}

.color-swatch {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid #000;
  box-shadow: 2px 2px 0px #000;
  transition: transform 0.1s, box-shadow 0.1s;
}

.color-swatch.selected {
  border-color: #000;
  transform: scale(1.1);
  box-shadow: 4px 4px 0px #000; /* Distinct shadow for selected */
}

.folder-box,
.image-box,
.back-btn-box {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  background: white;
  border: 2px solid #000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.2rem;
  box-shadow: 4px 4px 0px #000;
  transition: transform 0.1s, box-shadow 0.1s;
  position: relative; /* Critical for absolute children (multi-layer images) */
}

.folder-box:active,
.image-box:active,
.back-btn-box:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0px #000;
}

.folder-box.selected,
.image-box.selected {
  background-color: #bef264; /* Lime green for selected */
  border-color: #000;
  box-shadow: 2px 2px 0px #000;
  transform: translate(2px, 2px);
}

.image-box img,
.multi-layer-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 10px;
}

.multi-layer-img {
  position: absolute;
  top: 0;
  left: 0;
}

/* Ensure front is on top */
.layer-front {
  z-index: 2;
}
.layer-back {
  z-index: 1;
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
  font-size: 0.9rem;
  color: #555;
  text-align: center;
  width: 90px;
  line-height: 1.2;
  font-weight: 600;
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
