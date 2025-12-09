<script setup>
import { ref, reactive, computed } from 'vue';
import CharacterDisplay from './CharacterDisplay.vue';
import BottomNav from './BottomNav.vue';
import PopupSlider from './PopupSlider.vue';
import ColorPicker from './ColorPicker.vue';

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
  etc: {},
});

const activePopup = ref(null); // 'color', 'face', 'clothes'
const showColorPicker = ref(false);

// Navigation State
const currentItems = ref([]);
const currentMode = ref('image'); // 'color', 'folder', 'image', 'category'
const navigationStack = ref([]); // To track history for "Back" functionality if needed, or just to know where we are.
const currentCategory = ref(null); // To track which clothes category we are editing (head, shirt, etc)

// Color Data
// Color Data
const defaultSkinColors = [
  { id: 1, value: '#ffffff', type: 'color' }, // White skin first
  { id: 2, value: '#ffe0bd', type: 'color' },
  { id: 3, value: '#8d5524', type: 'color' },
  { id: 4, value: '#c68642', type: 'color' },
  { id: 5, value: '#e0ac69', type: 'color' },
  { id: 6, value: '#f1c27d', type: 'color' },
  { id: 7, value: '#ffdbac', type: 'color' },
];

const defaultEyeColors = [
  { id: 101, value: '#000000', type: 'color' },
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

const skinColorList = ref(
  loadSavedColors('savedSkinColors', defaultSkinColors)
);
const eyeColorList = ref(loadSavedColors('savedEyeColors', defaultEyeColors));

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
    children: null, // Dynamic: uses skinColorList in logic
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
    children: [
      {
        id: 'h_def',
        label: 'Default',
        type: 'folder',
        children: [
          // Example images. Paths should follow user request: faces/heads/... or faces/hair/...
          // Using faces/hair/default/hair_1.svg based on plan
          {
            id: 'hair1',
            label: 'Hair 1',
            value: '/faces/hair/default/hair_1.svg',
            type: 'image',
          },
        ],
      },
    ],
  },
  {
    id: 'ears',
    label: 'Ears',
    type: 'category',
    children: [
      {
        id: 'e_def',
        label: 'Default',
        type: 'folder',
        children: [
          {
            id: 'ear1',
            label: 'Default Ears',
            value: '/templates/ears/Ears_lineart.PNG',
            type: 'image',
          },
        ],
      },
    ],
  },
  {
    id: 'face',
    label: 'Face',
    type: 'category',
    children: [
      {
        id: 'f_def',
        label: 'Default',
        type: 'folder',
        children: [
          {
            id: 'face1',
            label: 'Face 1',
            value: '/faces/face/default/face_1.svg',
            type: 'image',
          },
        ],
      },
      {
        id: 'f_cute',
        label: 'Cute',
        type: 'folder',
        children: [
          {
            id: 'face1',
            label: 'หน้าหลัก', // Thai label for Default
            value: '/templates/faces/Eye.PNG',
            type: 'image',
          },
        ],
      },
    ],
  },
];

// Mock Data for Clothes
const clothesData = [
  {
    id: 'head',
    label: 'Head',
    type: 'category',
    children: [
      {
        id: 'h_def',
        label: 'Default',
        type: 'folder',
        children: [
          {
            id: 'head1',
            label: 'Cap',
            value: '/clothes/head/default/head_1.svg',
            type: 'image',
          },
        ],
      },
    ],
  },
  {
    id: 'shirt',
    label: 'Shirt',
    type: 'category',
    children: [
      {
        id: 's_def',
        label: 'Default',
        type: 'folder',
        children: [
          {
            id: 'shirt1',
            label: 'T-Shirt',
            value: '/clothes/shirt/default/shirt_1.svg',
            type: 'image',
          },
        ],
      },
    ],
  },
  {
    id: 'pant',
    label: 'Pant',
    type: 'category',
    children: [
      {
        id: 'p_def',
        label: 'Default',
        type: 'folder',
        children: [
          {
            id: 'pant1',
            label: 'Jeans',
            value: '/clothes/pant/default/pant_1.svg',
            type: 'image',
          },
        ],
      },
    ],
  },
  {
    id: 'shoes',
    label: 'Shoes',
    type: 'category',
    children: [
      {
        id: 'sh_def',
        label: 'Default',
        type: 'folder',
        children: [
          {
            id: 'shoes1',
            label: 'Sneakers',
            value: '/clothes/shoes/default/shoes_1.svg',
            type: 'image',
          },
        ],
      },
    ],
  },
  {
    id: 'hands',
    label: 'Hands',
    type: 'category',
    children: [
      {
        id: 'ha_def',
        label: 'Default',
        type: 'folder',
        children: [
          {
            id: 'hand1',
            label: 'Gloves',
            value: '/clothes/hands/default/hand_1.svg',
            type: 'image',
          },
        ],
      },
    ],
  },
];

const etcData = [
  {
    id: 'wings',
    label: 'Wings', // This acts as a folder (slot) for wings
    type: 'folder',
    children: [
      {
        id: 'wing1',
        label: 'Angel Wings',
        value: '/etc/wings/angel_wings.svg',
        type: 'image',
      },
    ],
  },
  {
    id: 'tail',
    label: 'Tail',
    type: 'folder',
    children: [
      {
        id: 'tail1',
        label: 'Cat Tail',
        value: '/etc/tail/cat_tail.svg',
        type: 'image',
      },
    ],
  },
];

const togglePopup = (popupName) => {
  if (activePopup.value === popupName) {
    activePopup.value = null;
    currentItems.value = [];
    navigationStack.value = [];
  } else {
    activePopup.value = popupName;
    navigationStack.value = [];

    if (popupName === 'color') {
      currentItems.value = colorCategoryData;
      currentMode.value = 'category';
    } else if (popupName === 'face') {
      currentItems.value = faceData;
      currentMode.value = 'category'; // Now category like clothes
    } else if (popupName === 'clothes') {
      currentItems.value = clothesData;
      currentMode.value = 'category';
    } else if (popupName === 'etc') {
      currentItems.value = etcData;
      currentMode.value = 'category'; // Even though structure is folder-like, top level functions as categories/slots
    } else {
      currentItems.value = [];
    }
  }
};

const handleSliderSelect = (item) => {
  if (item.type === 'color') {
    if (currentCategory.value === 'skin') {
      character.color = item.value;
    } else if (currentCategory.value === 'eyes') {
      character.eyeColor = item.value;
    }
  } else if (
    item.type === 'category' ||
    item.id === 'skin' ||
    item.id === 'eyes'
  ) {
    // Enter Category (Top-level)
    currentCategory.value = item.id;
    if (item.id === 'skin') {
      pushNavigation(skinColorList.value, 'color', null); // Label handled by category
    } else if (item.id === 'eyes') {
      pushNavigation(eyeColorList.value, 'color', null);
    } else if (item.children) {
      pushNavigation(
        item.children,
        item.type === 'category' ? 'folder' : 'image',
        null
      );
    }
  } else if (item.type === 'folder') {
    // Enter Sub-Folder (Depth 2) - Do NOT change currentCategory
    if (item.children) {
      pushNavigation(item.children, 'image', item.label);
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
    } else if (activePopup.value === 'clothes') {
      if (currentCategory.value) {
        character.clothes[currentCategory.value] = null;
      }
    } else if (activePopup.value === 'etc') {
      if (currentCategory.value) {
        // For etc, slots are dynamic in character.etc object
        // But reactive object needs delete or set to null
        character.etc[currentCategory.value] = null;
      }
    }
  } else if (item.type === 'image') {
    // Apply image
    if (activePopup.value === 'face') {
      if (currentCategory.value) {
        character.face[currentCategory.value] = item.value;
      }
    } else if (activePopup.value === 'clothes') {
      if (currentCategory.value) {
        character.clothes[currentCategory.value] = item.value;
      }
    } else if (activePopup.value === 'etc') {
      if (currentCategory.value) {
        character.etc[currentCategory.value] = item.value;
      }
    }
  }
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
  if (currentCategory.value === 'skin') {
    skinColorList.value.push({
      id: Date.now(),
      value: newColor,
      type: 'color',
    });
    localStorage.setItem(
      'savedSkinColors',
      JSON.stringify(skinColorList.value)
    );
    character.color = newColor;
  } else if (currentCategory.value === 'eyes') {
    eyeColorList.value.push({
      id: Date.now(),
      value: newColor,
      type: 'color',
    });
    localStorage.setItem('savedEyeColors', JSON.stringify(eyeColorList.value));
    character.eyeColor = newColor;
  }
};

const handleFinish = () => {
  alert('Character Finished!');
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
      return currentCategory.value
        ? character.etc[currentCategory.value]
        : null;
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
      : etcData;
  return data.find((c) => c.id === currentCategory.value)?.label || '';
});
</script>

<template>
  <div class="main-screen">
    <div class="character-area" @click="activePopup = null">
      <CharacterDisplay
        :color="character.color"
        :eye-color="character.eyeColor"
        :face="character.face"
        :clothes="character.clothes"
        :etc="character.etc"
      />
    </div>

    <!-- Popup Area -->
    <div class="popup-area" :class="{ active: activePopup }">
      <div v-if="activePopup" class="popup-content">
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
        <PopupSlider
          :items="currentItems"
          :mode="currentMode"
          :show-add-button="activePopup === 'color' && currentMode === 'color'"
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
  </div>
</template>

<style scoped>
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
  z-index: 20; /* Overlay bottom nav (z-index 10) */
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
</style>
