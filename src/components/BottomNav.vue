<script setup>
defineProps({
  activePopup: String,
});

defineEmits(['toggle-popup', 'finish']);
</script>

<template>
  <div class="bottom-nav">
    <button
      class="nav-btn"
      :class="{ active: activePopup === 'color' }"
      @click="$emit('toggle-popup', 'color')"
    >
      <div class="icon-box">
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
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <span>สี</span>
    </button>
    <button
      class="nav-btn"
      :class="{ active: activePopup === 'face' }"
      @click="$emit('toggle-popup', 'face')"
    >
      <div class="icon-box">
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
          <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
          <line x1="9" y1="9" x2="9.01" y2="9"></line>
          <line x1="15" y1="9" x2="15.01" y2="9"></line>
        </svg>
      </div>
      <span>ใบหน้า</span>
    </button>
    <button
      class="nav-btn"
      :class="{ active: activePopup === 'clothes' }"
      @click="$emit('toggle-popup', 'clothes')"
    >
      <div class="icon-box">
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
          <path
            d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"
          ></path>
        </svg>
      </div>
      <span>เสื้อผ้า</span>
    </button>
    <button
      class="nav-btn"
      :class="{ active: activePopup === 'etc' }"
      @click="$emit('toggle-popup', 'etc')"
    >
      <div class="icon-box">
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
          <circle cx="12" cy="12" r="1"></circle>
          <circle cx="19" cy="12" r="1"></circle>
          <circle cx="5" cy="12" r="1"></circle>
        </svg>
      </div>
      <span>อื่นๆ</span>
    </button>
    <button class="nav-btn finish" @click="$emit('finish')">
      <div class="icon-box">
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
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <span>เสร็จแล้วจ้า</span>
    </button>
  </div>
</template>

<style scoped>
.bottom-nav {
  display: flex;
  justify-content: center;
  padding: 1rem;
  background-color: transparent; /* Floating effect */
  border-top: none;
  z-index: 10;
  gap: 1rem;
  pointer-events: none; /* Let clicks pass through gaps */
}

.nav-btn {
  pointer-events: auto;
  background: #ffffff;
  border: 1px solid #eee;
  color: #666;
  font-size: 0.8rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  width: 90px;
  height: 90px;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s, background-color 0.2s;
  cursor: pointer;
}

.nav-btn:active {
  transform: translateY(2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-btn.active {
  color: #fff;
  background-color: #213547; /* Dark active state */
  font-weight: bold;
}

.nav-btn.finish {
  color: #4caf50;
  border-color: #e8f5e9;
}
.nav-btn.finish:active {
  background-color: #e8f5e9;
}

.icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-box svg {
  width: 32px;
  height: 32px;
}
</style>
