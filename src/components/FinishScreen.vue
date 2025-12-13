<script setup>
import { ref } from 'vue';
import CharacterDisplay from './CharacterDisplay.vue';
import html2canvas from 'html2canvas';

const props = defineProps({
  character: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['back']);

const characterRef = ref(null);
const isDownloading = ref(false);

const handleDownload = async () => {
  if (!characterRef.value) return;
  isDownloading.value = true;

  try {
    // Capture the specific character display element
    // Querying inside the component ref
    const element = characterRef.value.$el || characterRef.value;

    const canvas = await html2canvas(element, {
      backgroundColor: null, // Transparent background if possible, or white
      scale: 2, // Higher resolution
    });

    const link = document.createElement('a');
    link.download = `my-character-${Date.now()}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.9);
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
  <div class="finish-screen">
    <h1 class="title">เสร็จแล้วจ้า!</h1>

    <div class="display-container" ref="characterRef">
      <CharacterDisplay
        :color="character.color"
        :eye-color="character.eyeColor"
        :face="character.face"
        :clothes="character.clothes"
        :etc="character.etc"
      />
    </div>

    <div class="actions">
      <button
        class="action-btn download"
        @click="handleDownload"
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
        <span v-else>Loading...</span>
        Download JPG
      </button>

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
        Back to Edit
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
  background-color: #f0f8ff; /* Light blueish bg */
  padding: 2rem;
  box-sizing: border-box;
}

.title {
  font-size: 2rem;
  color: #213547;
  margin-bottom: 2rem;
  font-family: 'Itim', cursive, sans-serif;
}

.display-container {
  width: 300px; /* Output size */
  height: 400px;
  background-color: #ffffff;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
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
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
  font-family: inherit;
}

.action-btn:active {
  transform: scale(0.98);
}

.action-btn.download {
  background-color: #4caf50;
  color: white;
  box-shadow: 0 4px 10px rgba(76, 175, 80, 0.3);
}

.action-btn.back {
  background-color: #ffffff;
  color: #555;
  border: 1px solid #ddd;
}
</style>
