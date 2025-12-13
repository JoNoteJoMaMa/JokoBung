<script setup>
import { ref, reactive, computed } from 'vue';
import CharacterDisplay from './CharacterDisplay.vue';
import BottomNav from './BottomNav.vue';
import PopupSlider from './PopupSlider.vue';
import ColorPicker from './ColorPicker.vue';
import FinishScreen from './FinishScreen.vue';
import MusicControl from './MusicControl.vue';
import LayerManager from './LayerManager.vue';
import generatedAssets from '../generated-assets.json';

const character = reactive({
  color: '#ffffff', // Default white skin
  eyeColor: '#000000', // Default eye color
  face: {
    hair: null,
    ears: '/templates/ears/Ears_lineart.PNG',
    face: '/templates/faces/Eye.PNG', // User requested Eye.PNG as default
  },
  clothes: {
    head: null,
    shirt: null,
    pant: null,
    shoes: null,
    hands: null,
  },
  layers: [{ id: 'char', type: 'character', label: 'Character' }],
  etc: {}, // Deprecated but kept for compatibility logic if needed, though we should move away
});

const activePopup = ref(null); // 'color', 'face', 'clothes', 'etc', 'layers'
const showColorPicker = ref(false);

// Navigation State
const currentItems = ref([]);
const currentMode = ref('image'); // 'color', 'folder', 'image', 'category'
const navigationStack = ref([]); // To track history for "Back" functionality if needed, or just to know where we are.
const currentCategory = ref(null); // To track which clothes category we are editing (head, shirt, etc)

// Color Data
const defaultColors = [
  { id: 1, value: '#ffffff', type: 'color' }, // White
  { id: 2, value: '#ffe0bd', type: 'color' }, // Skin tone 1
  { id: 3, value: '#8d5524', type: 'color' }, // Skin tone 2
  { id: 4, value: '#c68642', type: 'color' }, // Skin tone 3
  { id: 5, value: '#e0ac69', type: 'color' }, // Skin tone 4
  { id: 6, value: '#f1c27d', type: 'color' }, // Skin tone 5
  { id: 7, value: '#ffdbac', type: 'color' }, // Skin tone 6
  { id: 101, value: '#000000', type: 'color' }, // Black
  { id: 102, value: '#8B4513', type: 'color' }, // Brown
  { id: 103, value: '#0000FF', type: 'color' }, // Blue
  { id: 104, value: '#008000', type: 'color' }, // Green
  { id: 105, value: '#800080', type: 'color' }, // Purple
  { id: 106, value: '#FF0000', type: 'color' }, // Red
  { id: 107, value: '#FFFF00', type: 'color' }, // Yellow
];

const loadSavedColors = (key, defaults) => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error(`Failed to load colors from local storage for key ${key}`, e);
  }
  return defaults;
};

const colorList = ref(loadSavedColors('savedColors', defaultColors));

// Color Categories (Skin, Eyes)
// Color Categories (Skin, Eyes)
const colorCategoryData = [
  {
    id: 'skin',
    label: 'Skin',
    icon: {
      viewBox: '0 0 24 24',
      path: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', // User icon
    },
    type: 'folder', // Acts as folder
    children: null, // Dynamic: uses colorList in logic
  },
  {
    id: 'eyes',
    label: 'Eyes',
    icon: {
      viewBox: '0 0 24 24',
      path: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', // Eye icon
    },
    type: 'folder',
    children: null,
  },
];

// Mock Data for Faces
const faceData = [
  {
    id: 'hair',
    label: 'Hair',
    type: 'category',
    icon: {
      viewBox: '0 0 24 24',
      // Many curve lines (Hair)
      paths: [
        'M6 9c0-1.7 1.3-3 3-3s3 1.3 3 3',
        'M12 9c0-1.7 1.3-3 3-3s3 1.3 3 3',
        'M9 12c0-1.7 1.3-3 3-3s3 1.3 3 3',
        'M6 15c0-1.7 1.3-3 3-3s3 1.3 3 3',
        'M15 15c0-1.7 1.3-3 3-3s3 1.3 3 3',
      ],
    },
    // Dynamically inject children from generated assets
    children:
      generatedAssets.faces.find((f) => f.id === 'hair')?.children || [],
  },
  {
    id: 'ears',
    label: 'Ears',
    type: 'category',
    icon: {
      viewBox: '0 0 24 24',
      // Ear
      path: 'M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0',
    },
    children:
      generatedAssets.faces.find((f) => f.id === 'ears')?.children || [],
  },
  {
    id: 'face',
    label: 'Face',
    type: 'category',
    icon: {
      viewBox: '0 0 24 24',
      // Exact Menu Face Icon
      paths: [
        'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z', // Circle
        'M8 14s1.5 2 4 2 4-2 4-2', // Smile
        'M9 9h0.01', // Eye L (Line in menu but Dot/Line logic similar) - Menu used line x1=9 x2=9.01
        'M15 9h0.01', // Eye R
      ],
    },
    children:
      generatedAssets.faces.find((f) => f.id === 'face')?.children || [],
  },
];

// Mock Data for Clothes
const clothesData = [
  {
    id: 'head',
    label: 'Head',
    type: 'category',
    icon: {
      viewBox: '0 0 24 24',
      // Cap
      path: 'M2 13h20M2 13v5c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2v-5M12 13V7a5 5 0 0 0-5-5a5 5 0 0 0-5 5v6M12 13a5 5 0 0 0 5-5a5 5 0 0 0-5-5',
    },
    children:
      generatedAssets.clothes.find((c) => c.id === 'head')?.children || [],
  },
  {
    id: 'shirt',
    label: 'Shirt',
    type: 'category',
    icon: {
      viewBox: '0 0 24 24',
      path: 'M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z',
    },
    children:
      generatedAssets.clothes.find((c) => c.id === 'shirt')?.children || [],
  },
  {
    id: 'pant',
    label: 'Pant',
    type: 'category',
    icon: {
      viewBox: '0 0 24 24',
      // Pants
      path: 'M17 4h-2V2h-6v2H7a2 2 0 0 0-2 2v16h6v-8h2v8h6V6a2 2 0 0 0-2-2z',
    },
    children:
      generatedAssets.clothes.find((c) => c.id === 'pant')?.children || [],
  },
  {
    id: 'shoes',
    label: 'Shoes',
    type: 'category',
    icon: {
      viewBox: '0 0 24 24',
      // Shoe
      path: 'M4 12v8h16v-8l-4-4H8l-4 4z',
    },
    children:
      generatedAssets.clothes.find((c) => c.id === 'shoes')?.children || [],
  },
  {
    id: 'hands',
    label: 'Hands',
    type: 'category',
    icon: {
      viewBox: '0 0 24 24',
      // Hand Icon
      path: 'M18 11V6a2 2 0 0 0-2-2v6a2 2 0 0 0-2 0V4a2 2 0 0 0-2-2v11a2 2 0 0 0-2 0v-6a2 2 0 0 0-2 0v11l4 4 6-6z',
    },
    children:
      generatedAssets.clothes.find((c) => c.id === 'hands')?.children || [],
  },
];

const etcData = generatedAssets.etc || [];

const togglePopup = (popupName) => {
  if (activePopup.value === popupName) {
    activePopup.value = null;
    currentItems.value = [];
    navigationStack.value = [];
  } else {
    activePopup.value = popupName;
    navigationStack.value = [];
    currentCategory.value = null;
    currentFolderLabel.value = null;

    if (popupName === 'color') {
      currentItems.value = colorCategoryData;
      currentMode.value = 'category';
    } else if (popupName === 'face') {
      currentItems.value = faceData;
      currentMode.value = 'category';
    } else if (popupName === 'clothes') {
      currentItems.value = clothesData;
      currentMode.value = 'category';
    } else if (popupName === 'etc') {
      currentItems.value = etcData;
      currentMode.value = 'category';
    } else {
      currentItems.value = [];
    }
  }
};

const toggleLayerManager = () => {
  if (activePopup.value === 'layers') {
    activePopup.value = null;
  } else {
    activePopup.value = 'layers';
    currentItems.value = []; // Layer manager handles its own data
  }
};

const splatVolume = ref(0.5);
const flashVolume = ref(0.5);

const playSplatSound = () => {
  if (splatVolume.value <= 0) return;
  const audio = new Audio('/sound/splat.mp3');
  audio.volume = splatVolume.value;
  audio.play().catch((e) => console.error('Error playing splat:', e));
};

const handleUpdateSplat = (vol) => {
  splatVolume.value = vol;
};

const handleUpdateFlash = (vol) => {
  flashVolume.value = vol;
};

const handleSliderSelect = (item) => {
  if (item.type === 'color') {
    if (currentCategory.value === 'skin') {
      character.color = item.value;
    } else if (currentCategory.value === 'eyes') {
      character.eyeColor = item.value;
    }
    playSplatSound();
  } else if (
    item.type === 'category' ||
    item.id === 'skin' ||
    item.id === 'eyes'
  ) {
    // Enter Category (Top-level)
    if (item.id === 'skin') {
      pushNavigation(colorList.value, 'color', null); // Label handled by category
    } else if (item.id === 'eyes') {
      pushNavigation(colorList.value, 'color', null);
    } else if (item.children) {
      pushNavigation(
        item.children,
        item.type === 'category' ? 'folder' : 'image',
        null
      );
    }
    currentCategory.value = item.id;
  } else if (item.type === 'folder') {
    // Enter Sub-Folder (Depth 2)
    // Do NOT change currentCategory for others logic (unless we wanted to, but Clothes uses top-level category)

    if (item.children) {
      pushNavigation(item.children, 'image', item.label);
    }

    if (activePopup.value === 'etc') {
      currentCategory.value = item.id;
    }
  } else if (item.type === 'remove') {
    // Remove item
    if (activePopup.value === 'face') {
      if (currentCategory.value) {
        // Special case: Default face means resetting to Eye template, not null
        if (currentCategory.value === 'face') {
          character.face[currentCategory.value] = '/templates/faces/Eye.PNG';
        } else {
          character.face[currentCategory.value] = null;
        }
      }
      playSplatSound();
    } else if (activePopup.value === 'clothes') {
      if (currentCategory.value) {
        character.clothes[currentCategory.value] = null;
      }
      playSplatSound();
      playSplatSound();
    } else if (activePopup.value === 'etc') {
      if (currentCategory.value) {
        // Remove ALL items of this category from layers
        character.layers = character.layers.filter(
          (l) => l.category !== currentCategory.value
        );
      }
      playSplatSound();
    }
  } else if (item.type === 'image') {
    // Apply image
    if (activePopup.value === 'face') {
      if (currentCategory.value) {
        // Toggle logic
        if (character.face[currentCategory.value] === item.value) {
          character.face[currentCategory.value] = null; // Remove if same
        } else {
          character.face[currentCategory.value] = item.value;
        }
      }
      playSplatSound();
    } else if (activePopup.value === 'clothes') {
      if (currentCategory.value) {
        // Toggle logic
        if (character.clothes[currentCategory.value] === item.value) {
          character.clothes[currentCategory.value] = null; // Remove if same
        } else {
          character.clothes[currentCategory.value] = item.value;
        }
      }
      playSplatSound();
    } else if (activePopup.value === 'etc') {
      // Add new layer
      // Toggle Etc Layer
      if (currentCategory.value) {
        const existingIndex = character.layers.findIndex(
          (l) => l.value === item.value && l.category === currentCategory.value
        );

        if (existingIndex !== -1) {
          // Remove if exists
          character.layers.splice(existingIndex, 1);
        } else {
          // Add if not exists
          character.layers.push({
            id: Date.now(),
            type: 'image',
            label: item.label,
            value: item.value,
            category: currentCategory.value,
          });
        }
        playSplatSound();
      }
    }
  }
};

const handleReorderLayers = (newOrder) => {
  character.layers = newOrder;
};

const handleRemoveLayer = (index) => {
  character.layers.splice(index, 1);
  playSplatSound();
};

const handleAddEtcLayer = () => {
  // Shortcut to open Etc menu from Layer Manager
  activePopup.value = 'etc';
  currentItems.value = etcData;
  currentMode.value = 'category';
};

const currentFolderLabel = ref(null);

const pushNavigation = (items, mode, folderLabel = null) => {
  // Save current state to stack before navigating
  navigationStack.value.push({
    items: currentItems.value,
    mode: currentMode.value,
    category: currentCategory.value,
    folderLabel: currentFolderLabel.value,
  });

  if (mode === 'image') {
    // Prepend "Default" (Remove) option
    const removeOption = {
      id: 'remove_default',
      label: 'Default',
      value: null,
      type: 'remove',
    };
    currentItems.value = [removeOption, ...items];
  } else {
    currentItems.value = items;
  }
  currentMode.value = mode;
  if (folderLabel) {
    currentFolderLabel.value = folderLabel;
  }
};

const handleBack = () => {
  if (navigationStack.value.length > 0) {
    const previousState = navigationStack.value.pop();
    currentItems.value = previousState.items;
    currentMode.value = previousState.mode;
    currentCategory.value = previousState.category;
    currentFolderLabel.value = previousState.folderLabel;
  } else {
    // If empty stack, close the popup
    activePopup.value = null;
    currentFolderLabel.value = null; // Reset
    currentCategory.value = null; // Reset
  }
};

const handleAddColor = () => {
  showColorPicker.value = true;
};

const onColorAdded = (newColor) => {
  colorList.value.push({
    id: Date.now(),
    value: newColor,
    type: 'color',
  });
  localStorage.setItem('savedColors', JSON.stringify(colorList.value));

  if (currentCategory.value === 'skin') {
    character.color = newColor;
  } else if (currentCategory.value === 'eyes') {
    character.eyeColor = newColor;
  }
  playSplatSound();
};

const isFinished = ref(false);
const showFlash = ref(false);

const handleFinish = () => {
  // Flash sound volume check
  if (flashVolume.value > 0) {
    const audio = new Audio('/sound/camera_shutter.mp3');
    audio.volume = flashVolume.value;
    audio.play().catch((e) => console.error('Error playing sound:', e));
  }

  // Trigger flash (instant white)
  showFlash.value = true;
  // Short delay to let the flash reach full white before switching screen
  setTimeout(() => {
    isFinished.value = true;
  }, 100);

  // Trigger fade out
  setTimeout(() => {
    showFlash.value = false;
  }, 200);
};

const handleBackToEdit = () => {
  isFinished.value = false;
};

const currentSelectedValue = computed(() => {
  if (currentMode.value === 'color') {
    if (currentCategory.value === 'skin') {
      return character.color;
    } else if (currentCategory.value === 'eyes') {
      return character.eyeColor;
    }
  }

  if (currentMode.value === 'image') {
    // Determine which character part maps to the current category to highlight selection
    if (activePopup.value === 'face') {
      return currentCategory.value
        ? character.face[currentCategory.value]
        : null;
    } else if (activePopup.value === 'clothes') {
      return currentCategory.value
        ? character.clothes[currentCategory.value]
        : null;
    } else if (activePopup.value === 'etc') {
      // Return array of values for the current category to highlight all matching layers
      if (currentCategory.value) {
        return character.layers
          .filter((l) => l.category === currentCategory.value)
          .map((l) => l.value);
      }
    }
  }

  return null;
});
const activePopupLabel = computed(() => {
  if (!activePopup.value) return '';
  return activePopup.value.charAt(0).toUpperCase() + activePopup.value.slice(1);
});

const categoryLabel = computed(() => {
  if (!currentCategory.value) return '';
  const data =
    activePopup.value === 'clothes'
      ? clothesData
      : activePopup.value === 'face'
      ? faceData
      : activePopup.value === 'color'
      ? colorCategoryData
      : activePopup.value === 'etc'
      ? etcData
      : [];
  return data.find((c) => c.id === currentCategory.value)?.label || '';
});
</script>

<template>
  <div class="main-screen">
    <MusicControl
      @update-splat-volume="handleUpdateSplat"
      @update-flash-volume="handleUpdateFlash"
    />

    <button class="layer-btn" @click="toggleLayerManager">
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
        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
        <polyline points="2 17 12 22 22 17"></polyline>
        <polyline points="2 12 12 17 22 12"></polyline>
      </svg>
    </button>

    <div v-if="activePopup === 'layers'" class="layer-dropdown">
      <div class="popup-header">
        <span class="breadcrumb">Layers</span>
      </div>
      <LayerManager
        :layers="character.layers"
        @reorder="handleReorderLayers"
        @remove="handleRemoveLayer"
        @add="handleAddEtcLayer"
      />
    </div>

    <!-- Edit Mode -->
    <template v-if="!isFinished">
      <div class="character-area" @click="activePopup = null">
        <CharacterDisplay
          :color="character.color"
          :eye-color="character.eyeColor"
          :face="character.face"
          :clothes="character.clothes"
          :layers="character.layers"
        />
      </div>

      <!-- Popup Area -->
      <!-- If picking etc, show PopupSlider inside popup-content like normal -->
      <!-- If managing layers, show LayerManager inside popup-content -->
      <div
        class="popup-area"
        :class="{ active: activePopup && activePopup !== 'layers' }"
      >
        <div
          v-if="activePopup && activePopup !== 'layers'"
          class="popup-content"
        >
          <!-- Header (Shared) -->
          <div class="popup-header">
            <button class="back-btn" @click="handleBack">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
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
              Back
            </button>

            <!-- Refined Breadcrumb -->
            <span class="breadcrumb">
              {{ activePopupLabel }}
              <span v-if="currentCategory"> / {{ categoryLabel }}</span>
              <span v-if="currentFolderLabel"> / {{ currentFolderLabel }}</span>
            </span>
          </div>

          <!-- Standard Picker Mode -->
          <PopupSlider
            :items="currentItems"
            :mode="currentMode"
            :show-add-button="
              activePopup === 'color' && currentMode === 'color'
            "
            :selected-value="currentSelectedValue"
            @select="handleSliderSelect"
            @add="handleAddColor"
          />
        </div>
      </div>

      <BottomNav
        :active-popup="activePopup"
        @toggle-popup="togglePopup"
        @finish="handleFinish"
      />

      <ColorPicker
        v-if="showColorPicker"
        @add="onColorAdded"
        @close="showColorPicker = false"
      />
    </template>

    <!-- Finish Mode -->
    <FinishScreen v-else :character="character" @back="handleBackToEdit" />

    <!-- Flash Overlay -->
    <div class="flash-overlay" :class="{ active: showFlash }"></div>
  </div>
</template>

<style scoped>
.flash-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: white;
  opacity: 0;
  pointer-events: none;
  z-index: 9999;
  transition: opacity 1s ease-out;
}

.flash-overlay.active {
  opacity: 1;
  transition: none; /* Instant on */
}

.main-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
  position: relative;
  background: #ffffff;
}

.character-area {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup-area {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 0;
  background-color: #f5f5f5;
  transition: height 0.3s ease;
  overflow: hidden;
  z-index: 2100; /* Overlay bottom nav (z-index 2000) */
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.popup-area.active {
  height: 180px; /* Increased height for better interaction */
  border-top: 1px solid #ddd;
}

.popup-content {
  height: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* Pin content to top to avoid shifting */
  gap: 0.5rem; /* Space between header and slider */
}

.popup-header {
  padding: 1rem 1rem 0 1rem;
  margin-bottom: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.2rem;
  color: #555;
  font-family: inherit;
  font-size: 0.8rem;
  padding: 0;
}
.back-btn:hover {
  text-decoration: underline;
}

.layer-btn {
  position: absolute;
  top: 1rem;
  right: 80px; /* Increased gap */
  z-index: 1000;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  color: #213547;
  transition: transform 0.2s, background-color 0.2s;
}

.layer-btn:hover {
  background-color: #fff;
  transform: scale(1.05);
}

.layer-dropdown {
  position: absolute;
  top: 60px;
  right: 80px;
  width: 250px;
  max-height: 400px;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(5px);
  border: 1px solid #eee;
  z-index: 2200;
  display: flex;
  flex-direction: column;
  padding-bottom: 0.5rem;
}
</style>
