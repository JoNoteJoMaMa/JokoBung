<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';

const props = defineProps({
  initialVolume: {
    type: Number,
    default: 0.3,
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const musicVolume = ref(props.initialVolume);
const splatVolume = ref(0.5);
const flashVolume = ref(0.5);
const isPlaying = ref(false);
const isMusicMuted = ref(false);
const isSplatMuted = ref(false);
const isFlashMuted = ref(false);
const audio = ref(null);

const emit = defineEmits([
  'update-splat-volume',
  'update-flash-volume',
  'toggle',
]);

// Watchers to emit volume updates
watch([splatVolume, isSplatMuted], () => {
  emit('update-splat-volume', isSplatMuted.value ? 0 : splatVolume.value);
});

watch([flashVolume, isFlashMuted], () => {
  emit('update-flash-volume', isFlashMuted.value ? 0 : flashVolume.value);
});

// Update music volume when changed or muted
watch([musicVolume, isMusicMuted], () => {
  if (audio.value) {
    audio.value.volume = isMusicMuted.value ? 0 : musicVolume.value;
  }
});

onMounted(() => {
  audio.value = new Audio('sound/background_theme.mp3');
  audio.value.loop = true;
  audio.value.volume = isMusicMuted.value ? 0 : musicVolume.value;

  // Attempt to play automatically
  const playPromise = audio.value.play();

  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        isPlaying.value = true;
      })
      .catch((error) => {
        console.warn('Auto-play prevented:', error);
        isPlaying.value = false;
        // User interaction will be required to start
      });
  }
});

onUnmounted(() => {
  if (audio.value) {
    audio.value.pause();
    audio.value = null;
  }
});

// Old watcher removed, replaced by block above

const togglePlay = () => {
  if (!audio.value) return;

  if (isPlaying.value) {
    audio.value.pause();
    isPlaying.value = false;
  } else {
    audio.value.play();
    isPlaying.value = true;
  }
};

const toggleMusicMute = () => {
  isMusicMuted.value = !isMusicMuted.value;
};

const toggleSplatMute = () => {
  isSplatMuted.value = !isSplatMuted.value;
};

const toggleFlashMute = () => {
  isFlashMuted.value = !isFlashMuted.value;
};

const togglePopup = () => {
  emit('toggle');
};

// Helper toggles removed in favor of mute toggles
</script>

<template>
  <div class="music-control">
    <button class="music-btn" :class="{ active: isOpen }" @click="togglePopup">
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
        <path d="M9 18V5l12-2v13"></path>
        <circle cx="6" cy="18" r="3"></circle>
        <circle cx="18" cy="16" r="3"></circle>
      </svg>
    </button>

    <div v-if="isOpen" class="volume-popup">
      <div class="popup-controls">
        <!-- Line 1: Music Volume -->
        <div class="control-row">
          <button class="icon-btn" @click="toggleMusicMute" title="Mute Music">
            <!-- Reuse speaker icon from before or new one -->
            <svg
              v-if="!isMusicMuted && musicVolume > 0"
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
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path
                d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"
              ></path>
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
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <line x1="23" y1="9" x2="17" y2="15"></line>
              <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            v-model.number="musicVolume"
            class="volume-slider"
            :disabled="isMusicMuted"
          />
        </div>

        <!-- Line 2: Splat Volume -->
        <div class="control-row">
          <button
            class="icon-btn btn-red"
            @click="toggleSplatMute"
            title="Mute Splat"
          >
            <!-- Tomato Iconish -->
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              :class="{ muted: isSplatMuted }"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                fill="currentColor"
                fill-opacity="0.2"
              />
              <path d="M12 2C12 2 14 6 12 6C10 6 12 2 12 2Z" />
              <line
                v-if="isSplatMuted"
                x1="4"
                y1="4"
                x2="20"
                y2="20"
                stroke="red"
                stroke-width="2"
              />
            </svg>
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            v-model.number="splatVolume"
            class="volume-slider"
            :disabled="isSplatMuted"
          />
        </div>

        <!-- Line 3: Flash Volume -->
        <div class="control-row">
          <button
            class="icon-btn btn-yellow"
            @click="toggleFlashMute"
            title="Mute Flash"
          >
            <!-- Flash Icon -->
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              :class="{ muted: isFlashMuted }"
            >
              <polygon
                points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
              ></polygon>
              <line
                v-if="isFlashMuted"
                x1="4"
                y1="4"
                x2="20"
                y2="20"
                stroke="red"
                stroke-width="2"
              />
            </svg>
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            v-model.number="flashVolume"
            class="volume-slider"
            :disabled="isFlashMuted"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.music-control {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.music-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #ffffff;
  border: 2px solid #000;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 4px 4px 0px #000;
  color: #000;
  transition: transform 0.1s, box-shadow 0.1s;
}

.music-btn:hover {
  background-color: #ffffff;
}

.music-btn:active,
.music-btn.active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0px #000;
  background-color: #f0f0f0;
}

.volume-popup {
  margin-top: 0.5rem;
  background-color: #ffffff;
  padding: 0.8rem;
  border-radius: 12px;
  border: 2px solid #000;
  box-shadow: 6px 6px 0px #000;
  min-width: 200px;
}

.popup-controls {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.control-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  width: 100%;
}

.label {
  font-size: 0.85rem;
  color: #555;
  font-weight: 500;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #213547;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.icon-btn:hover {
  background-color: #f0f0f0;
}

.icon-btn svg.muted {
  color: #999;
}

.volume-slider {
  width: 120px;
  cursor: pointer;
}

/* Button Colors */
.btn-red {
  color: #ff6b6b;
}
.btn-red:hover {
  color: #ff5252;
  background-color: #ffe5e5; /* Subtle background tint on hover */
}

.btn-yellow {
  color: #feca57;
}
.btn-yellow:hover {
  color: #ff9f43;
  background-color: #fff8e1; /* Subtle background tint on hover */
}
</style>
