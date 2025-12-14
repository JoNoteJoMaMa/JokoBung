<script setup>
import { ref, onMounted } from 'vue';
import LogoScreen from './components/LogoScreen.vue';
import MainScreen from './components/MainScreen.vue';

const showLogo = ref(true);
const showTransition = ref(false);

onMounted(() => {
  // Start transition color fade-in after 2.5s
  setTimeout(() => {
    showTransition.value = true;
  }, 2500);

  // Remove logo screen once covered (3s)
  setTimeout(() => {
    showLogo.value = false;
  }, 3000);

  // Fade out transition color to reveal main (3.5s)
  setTimeout(() => {
    showTransition.value = false;
  }, 3500);
});
</script>

<template>
  <LogoScreen v-if="showLogo" />

  <!-- Transition Overlay -->
  <div class="transition-screen" :class="{ active: showTransition }"></div>

  <MainScreen v-if="!showLogo" />
</template>

<style scoped>
.transition-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #FFA41D; /* Pastel Pink Transition */
  z-index: 9999; /* Above everything (Popups are 2100) */
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.5s ease-in-out;
}

.transition-screen.active {
  opacity: 1;
  pointer-events: auto; /* Block interactions during transition */
}
</style>
