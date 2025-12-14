<script setup></script>

<template>
  <div class="logo-screen">
    <div class="logo-container">
      <img src="/public/templates/logo/logo.PNG" class="logo" alt="JokoBung Logo" />
    </div>
  </div>
</template>

<style scoped>
.logo-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
  z-index: 100;
  animation: fadeOut 0.5s ease-in-out 4.5s forwards;
}

.logo-container {
  text-align: center;
  animation: scaleIn 1s ease-out;
}

.logo {
  max-width: 80%; /* Ensure it fits on screen */
  height: auto;
  padding: 1.5em; /* Keep potential spacing or remove if not needed */
  animation: pulse 2s infinite ease-in-out;
}

@keyframes scaleIn {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes fadeOut {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    pointer-events: none;
  }
}
</style>
