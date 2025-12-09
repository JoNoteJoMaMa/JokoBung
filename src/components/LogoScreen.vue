<script setup></script>

<template>
  <div class="logo-screen">
    <div class="logo-container">
      <img src="/vite.svg" class="logo" alt="Logo" />
      <h1>จกโกะบุ๋ง</h1>
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
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

h1 {
  font-size: 2em;
  margin-top: 0.5em;
  color: #000;
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
