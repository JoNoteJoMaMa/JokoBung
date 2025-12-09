<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: '',
  },
});

const isLoading = ref(true);

const onLoad = () => {
  isLoading.value = false;
};

// Reset loading state if src changes
watch(
  () => props.src,
  () => {
    isLoading.value = true;
  }
);
</script>

<template>
  <div class="skeleton-image-wrapper">
    <div v-if="isLoading" class="skeleton-loader"></div>
    <img
      :src="src"
      :alt="alt"
      draggable="false"
      class="actual-image"
      :class="{ hidden: isLoading }"
      @load="onLoad"
    />
  </div>
</template>

<style scoped>
.skeleton-image-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: inherit; /* Inherit from parent (image-box) */
}

.skeleton-loader {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  background-image: linear-gradient(
    90deg,
    #f0f0f0 0px,
    #e0e0e0 50%,
    #f0f0f0 100%
  );
  background-size: 200px 100%;
  background-repeat: no-repeat;
  animation: shimmer 1.5s infinite linear;
  border-radius: inherit;
  z-index: 1;
}

@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: 200px 0;
  }
}

.actual-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  transition: opacity 0.3s ease;
}

.actual-image.hidden {
  opacity: 0;
  position: absolute; /* Keep it taking no visual space but still loading */
  width: 0;
  height: 0;
}
</style>
