<script setup>
import { ref, nextTick } from 'vue';
import CharacterDisplay from './CharacterDisplay.vue';
import html2canvas from 'html2canvas';

const props = defineProps({
  character: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['back']);

const characterName = ref('โจโกะบุ๋ง');
const isEditingName = ref(false);
const nameInputRef = ref(null);

const toggleEditName = async () => {
  isEditingName.value = !isEditingName.value;
  if (isEditingName.value) {
    await nextTick();
    nameInputRef.value?.focus();
  }
};

const saveName = () => {
  isEditingName.value = false;
};

const characterRef = ref(null);
const isDownloading = ref(false);
const showDownloadOptions = ref(false);

const handleDownload = async (format) => {
  if (!characterRef.value) return;
  isDownloading.value = true;
  showDownloadOptions.value = false; // Close popup

  try {
    const element = characterRef.value.$el || characterRef.value;
    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: 2,
    });

    const link = document.createElement('a');
    const ext = format === 'jpeg' ? 'jpg' : 'png';
    // Use characterName for filename, sanitized (allow Thai + English)
    const validName = characterName.value.trim() || 'โจโกะบุ๋ง';
    const safeName = validName.replace(/[^a-zA-Z0-9\u0E00-\u0E7F\-_]/g, '_');
    link.download = `${safeName}.${ext}`;
    link.href = canvas.toDataURL(`image/${format}`, 0.9);
    link.click();
  } catch (error) {
    console.error('Download failed:', error);
    alert('Failed to download image.');
  } finally {
    isDownloading.value = false;
  }
};
</script>

<template>
  <div class="finish-screen" @click="showDownloadOptions = false">
    <h1 class="title">เสร็จแล้วจ้า!</h1>

    <!-- Character Name Edit -->
    <div class="name-container">
      <div v-if="!isEditingName" class="name-display" @click="toggleEditName">
        <span class="char-name">{{ characterName }}</span>
        <button class="edit-icon-btn">
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
              d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"
            ></path>
          </svg>
        </button>
      </div>
      <div v-else class="name-input-wrapper">
        <input
          ref="nameInputRef"
          v-model="characterName"
          class="name-input"
          @blur="saveName"
          @keyup.enter="saveName"
          maxlength="20"
        />
        <button class="save-icon-btn" @click="saveName">
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
        </button>
      </div>
    </div>

    <div class="display-container" ref="characterRef">
      <CharacterDisplay
        :color="character.color"
        :eye-color="character.eyeColor"
        :face="character.face"
        :clothes="character.clothes"
        :etc="character.etc"
        :layers="character.layers"
      />
    </div>

    <!-- Actions Area -->
    <div class="actions">
      <!-- Main Download Button (Toggles Popup) -->
      <div class="download-wrapper" @click.stop>
        <button
          class="action-btn download"
          @click="showDownloadOptions = !showDownloadOptions"
          :disabled="isDownloading"
        >
          <svg
            v-if="!isDownloading"
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
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span v-else>กำลังโหลด...</span>โหลดโจโกะบุ๋ง
        </button>

        <!-- Download Options Popup -->
        <div v-if="showDownloadOptions" class="download-popup">
          <button class="option-btn" @click="handleDownload('jpeg')">
            แบบ JPG
          </button>
          <button class="option-btn" @click="handleDownload('png')">
            แบบ PNG
          </button>
        </div>
      </div>

      <button class="action-btn back" @click="$emit('back')">
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
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        กลับไปแต่งตัว
      </button>
    </div>
  </div>
</template>

<style scoped>
.finish-screen {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #ffffff; /* Consistent white bg */
  padding: 2rem;
  box-sizing: border-box;
}

.title {
  font-size: 2rem;
  color: #000; /* Black text */
  margin-bottom: 2rem;
  font-family: 'Itim', cursive, sans-serif;
  font-weight: 900;
  text-transform: uppercase;
}

.display-container {
  width: 300px; /* Output size */
  height: 400px;
  background-color: #ffffff;
  border-radius: 20px;
  border: 4px solid #000; /* Bold border */
  box-shadow: 8px 8px 0px #000; /* Hard shadow */
  margin-bottom: 2rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.actions {
  display: flex;
  gap: 1rem;
  flex-direction: column;
  width: 100%;
  max-width: 300px;
  position: relative; /* For popup positioning context if needed */
}

.download-wrapper {
  position: relative;
  width: 100%;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 2px solid #000;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 4px 4px 0px #000;
  transition: transform 0.1s, box-shadow 0.1s;
  font-family: inherit;
  width: 100%; /* Full width */
}

.action-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0px #000;
}

.action-btn.download {
  background-color: #4ade80; /* Green */
  color: #000;
}

.action-btn.back {
  background-color: #ffffff;
  color: #000;
}

.download-popup {
  position: absolute;
  bottom: 110%; /* Above the button */
  left: 0;
  width: 100%;
  background-color: #ffffff;
  border: 2px solid #000;
  border-radius: 12px;
  box-shadow: 4px 4px 0px #000;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 10;
  animation: popUp 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.option-btn {
  background: white;
  border: 2px solid #000;
  padding: 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  font-family: inherit;
  transition: background-color 0.1s;
}

.option-btn:hover {
  background-color: #f0f0f0;
}

.option-btn:active {
  background-color: #e0e0e0;
}

.name-container {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 3rem; /* Fixed height to prevent layout shift */
}

.name-display {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.char-name {
  font-size: 1.8rem;
  font-weight: 800;
  color: #000;
  border-bottom: 2px solid transparent;
  transition: border-color 0.2s;
}

.name-display:hover .char-name {
  border-bottom-color: #000;
}

.edit-icon-btn,
.save-icon-btn {
  position: absolute;
  right: -40px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #888;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 4px;
}

.edit-icon-btn:hover,
.save-icon-btn:hover {
  background-color: #f0f0f0;
  color: #000;
}

.name-input-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.name-input {
  font-size: 1.8rem;
  font-weight: 800;
  font-family: inherit;
  border: none;
  border-bottom: 2px solid #000;
  outline: none;
  text-align: center;
  color: #000;
  background: transparent;
  width: 200px; /* Fixed width helps keep layout stable */
}
</style>
