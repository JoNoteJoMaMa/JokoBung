<script setup>
import { ref, onMounted } from 'vue';
import LogoScreen from './components/LogoScreen.vue';
import MainScreen from './components/MainScreen.vue';

const showLogo = ref(true);

onMounted(() => {
  setTimeout(() => {
    showLogo.value = false;
  }, 3000);
});
</script>

<template>
  <LogoScreen v-if="showLogo" />
  <MainScreen v-else />
</template>

<style scoped></style>
