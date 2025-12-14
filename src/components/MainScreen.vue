<script setup>
import { ref, reactive, computed } from 'vue';
import CharacterDisplay from './CharacterDisplay.vue';
import BottomNav from './BottomNav.vue';
import PopupSlider from './PopupSlider.vue';
import ColorPicker from './ColorPicker.vue';
import FinishScreen from './FinishScreen.vue';
const baseUrl = import.meta.env.BASE_URL;
import MusicControl from './MusicControl.vue';
import LayerManager from './LayerManager.vue';
import generatedAssets from '../generated-assets.json';

const processDualLayerAssets = (items) => {
  if (!items) return [];

  // Recursive processing function
  const processList = (list) => {
    const processed = [];
    const grouped = {};

    list.forEach((item) => {
      // Handle Recursion for Folders
      if (item.type === 'folder') {
        processed.push({
          ...item,
          children: processList(item.children),
        });
        return;
      }

      if (item.type !== 'image') {
        processed.push(item);
        return;
      }

      // Image Processing Logic
      const lowerId = item.id.toLowerCase();
      let baseId = item.id;
      let type = 'single';

      if (lowerId.endsWith('_front')) {
        baseId = item.id.slice(0, -6);
        type = 'front';
      } else if (lowerId.endsWith('_back')) {
        baseId = item.id.slice(0, -5);
        type = 'back';
      } else if (lowerId.endsWith('_stroke')) {
        baseId = item.id.slice(0, -7);
        type = 'stroke';
      } else if (lowerId.endsWith('_bg')) {
        baseId = item.id.slice(0, -3);
        type = 'bg';
      }

      if (type === 'single') {
        processed.push(item);
        return;
      }

      if (!grouped[baseId]) {
        grouped[baseId] = {
          id: baseId,
          label: baseId
            .replace(/[-_]/g, ' ')
            .replace(/ template face$/i, '')
            .replace(/_template_face$/i, ''),
          type: 'image',
          front: null,
          back: null,
          stroke: null,
          bg: null,
          value: null,
        };
        processed.push(grouped[baseId]);
      }

      const group = grouped[baseId];
      if (type === 'front') {
        group.front = item.value;
        group.value = item.value;
        group.label = item.label
          .replace(/ Front$/i, '')
          .replace(/_front$/i, '');
      } else if (type === 'back') {
        group.back = item.value;
      } else if (type === 'stroke') {
        group.stroke = item.value;
        group.label = item.label
          .replace(/ Stroke$/i, '')
          .replace(/_stroke$/i, '');
        group.value = item.value;
      } else if (type === 'bg') {
        group.bg = item.value;
        if (!group.label || group.label === item.label) {
          group.label = item.label
            .replace(/_template_face_bg$/i, '')
            .replace(/_template_face$/i, '')
            .replace(/_bg$/i, '')
            .replace(/ Bg$/i, '');
        }
      }
    });

    // Post-process groups
    processed.forEach((item) => {
      if (
        item.type === 'image' &&
        (item.front || item.back || item.stroke || item.bg)
      ) {
        if (!item.value) {
          item.value = item.back || item.bg || item.front || item.stroke;
        }
        if (item.stroke && item.bg && !item.label.includes('(เปลี่ยนสีได้)')) {
          item.label += ' (เปลี่ยนสีได้)';
        }
      }
    });

    return processed;
  };

  return processList(items);
};

const getInitialCharacterState = () => ({
  color: '#ffffff',
  eyeColor: '#000000',
  face: {
    hair: null,
    ears: `${baseUrl}templates/ears/Ears_lineart.PNG`, // Default ears
    face: `${baseUrl}templates/faces/Eye.PNG`, // Default face (Eyes)
  },
  clothes: {
    // Legacy fixed slots (unused for rendering now, but kept for safe structure)
    head: null,
    shirt: null,
    pant: null,
    shoes: null,
    hands: null,
  },
  layers: [
    { id: 'base_char', type: 'character', label: 'ตัวละคร', locked: true },
  ],
  etc: {},
});

const character = reactive(getInitialCharacterState());

const showResetConfirm = ref(false);

const handleResetClick = () => {
  // Close other popups?
  closeAllPopups();
  showResetConfirm.value = true;
};

const confirmReset = () => {
  const initialState = getInitialCharacterState();
  Object.assign(character, initialState);
  showResetConfirm.value = false;
  playSplatSound();
};

const cancelReset = () => {
  showResetConfirm.value = false;
};

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
const activeLayerId = ref(null);

// Color Categories (Skin, Eyes)
const colorCategoryData = computed(() => {
  const categories = [
    {
      id: 'skin',
      label: 'สีผิว',
      icon: {
        viewBox: '0 0 24 24',
        path: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', // User icon
      },
      type: 'folder', // Acts as folder
      children: null, // Dynamic: uses colorList in logic
    },
    {
      id: 'eyes',
      label: 'สีตา',
      icon: {
        viewBox: '0 0 24 24',
        path: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', // Eye icon
      },
      type: 'folder',
      children: null,
    },
  ];

  // Check for tintable face parts (Ears, Face)
  if (
    character.face.ears &&
    typeof character.face.ears === 'object' &&
    character.face.ears.bg
  ) {
    categories.push({
      id: 'ears_color',
      label: character.face.ears.label,

      type: 'folder',
      children: null,
    });
  }

  if (
    character.face.face &&
    typeof character.face.face === 'object' &&
    character.face.face.bg &&
    !character.face.face.bg.toLowerCase().includes('_template_face_bg')
  ) {
    categories.push({
      id: 'face_color',
      label: character.face.face.label,

      type: 'folder',
      children: null,
    });
  }

  // Check for tintable hair in layers (Limitless Hair)
  const hairLayer = character.layers.find((l) => l.category === 'hair' && l.bg);
  if (hairLayer) {
    categories.push({
      id: 'hair_color',
      label: hairLayer.label.replace(/ \((หน้า|หลัง)\)$/, ''), // Clean label

      type: 'folder',
      children: null,
    });
  }

  // Check clothes
  // We need to iterate known clothes categories or keys
  // Check clothes (Limitless Layers)
  const clothesKeys = ['head', 'shirt', 'pant', 'shoes', 'hands'];
  clothesKeys.forEach((key) => {
    const layer = character.layers.find((l) => l.category === key && l.bg);
    if (layer) {
      categories.push({
        id: `clothes_${key}_color`,
        label: layer.label, // Use label from layer

        type: 'folder',
        children: null,
      });
    }
  });

  // Check for any other tintable layers (Etc - Persistent)
  character.layers.forEach((layer) => {
    if (
      layer.bg &&
      ![
        'hair',
        'ears',
        'face',
        'head',
        'shirt',
        'pant',
        'shoes',
        'hands',
      ].includes(layer.category)
    ) {
      categories.push({
        id: `item_${layer.id}_color`,
        label: layer.label,
        type: 'folder',
        children: null,
      });
    }
  });

  return categories;
});

// Mock Data for Faces
const faceData = [
  {
    id: 'hair',
    label: 'ผม',
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
    children: processDualLayerAssets(
      generatedAssets.faces.find((f) => f.id === 'hair')?.children || []
    ),
  },
  {
    id: 'ears',
    label: 'หู',
    type: 'category',
    icon: {
      viewBox: '0 0 24 24',
      // Ear
      path: 'M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0',
    },
    children: [
      {
        id: 'none_ears',
        label: 'ลบหู',
        type: 'remove',
        icon: {
          viewBox: '0 0 24 24',
          path: 'M18 6L6 18M6 6l12 12',
        },
      },
      {
        id: 'normal_ears',
        label: 'หูปกติ',
        type: 'image',
        value: `${baseUrl}templates/ears/Ears_lineart.PNG`, // Restore default template
        style: 'folder', // Render as folder button
        icon: {
          viewBox: '0 0 24 24',
          path: 'M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0',
        },
      },
      ...processDualLayerAssets(
        generatedAssets.faces.find((f) => f.id === 'ears')?.children || []
      ),
    ],
  },
  {
    id: 'face',
    label: 'ใบหน้า',
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
    children: processDualLayerAssets(
      generatedAssets.faces.find((f) => f.id === 'face')?.children || []
    ),
  },
];

// Mock Data for Clothes
const clothesData = [
  {
    id: 'head',
    label: 'หัว',
    type: 'category',
    icon: {
      viewBox: '0 0 24 24',
      // Cap
      path: 'M2 13h20M2 13v5c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2v-5M12 13V7a5 5 0 0 0-5-5a5 5 0 0 0-5 5v6M12 13a5 5 0 0 0 5-5a5 5 0 0 0-5-5',
    },
    children: processDualLayerAssets(
      generatedAssets.clothes.find((c) => c.id === 'head')?.children || []
    ),
  },
  {
    id: 'shirt',
    label: 'เสื้อ',
    type: 'category',
    icon: {
      viewBox: '0 0 24 24',
      path: 'M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z',
    },
    children: processDualLayerAssets(
      generatedAssets.clothes.find((c) => c.id === 'shirt')?.children || []
    ),
  },
  {
    id: 'pant',
    label: 'กางเกง',
    type: 'category',
    icon: {
      viewBox: '0 0 24 24',
      path: 'M20 18v-7l-2-11H6L4 11v7h6v-6h4v6z', // Pant icon simplified
    },
    children: processDualLayerAssets(
      generatedAssets.clothes.find((c) => c.id === 'pant')?.children || []
    ),
  },
  {
    id: 'shoes',
    label: 'รองเท้า',
    type: 'category',
    icon: {
      viewBox: '0 0 24 24',
      path: 'M4 16v6h16v-6c0-2.21-1.79-4-4-4h-8c-2.21 0-4 1.79-4 4z', // Shoe simplified
    },
    children: processDualLayerAssets(
      generatedAssets.clothes.find((c) => c.id === 'shoes')?.children || []
    ),
  },
  {
    id: 'hands',
    label: 'มือ',
    type: 'category',
    icon: {
      viewBox: '0 0 24 24',
      path: 'M18 11V6a2 2 0 0 0-2-2v6a2 2 0 0 0-2 0V4a2 2 0 0 0-2-2v11a2 2 0 0 0-2 0v-6a2 2 0 0 0-2 0v11l4 4 6-6z', // Hand icon
    },
    children: processDualLayerAssets(
      generatedAssets.clothes.find((c) => c.id === 'hands')?.children || []
    ),
  },
];

const etcData = processDualLayerAssets(generatedAssets.etc || []);

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
      currentItems.value = colorCategoryData.value;
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
    }
  }
  // Also close music if opening a bottom menu
  isMusicOpen.value = false;
};

const isMusicOpen = ref(false);

const handleToggleMusic = () => {
  if (isMusicOpen.value) {
    isMusicOpen.value = false;
  } else {
    isMusicOpen.value = true;
    // Close other top/bottom menus
    activePopup.value = null;
  }
};

const toggleLayerManager = () => {
  if (activePopup.value === 'layers') {
    activePopup.value = null;
  } else {
    activePopup.value = 'layers';
    currentItems.value = []; // Layer manager handles its own data
    // Close music
    isMusicOpen.value = false;
  }
};

const closeAllPopups = () => {
  activePopup.value = null;
  isMusicOpen.value = false;
};

const splatVolume = ref(0.5);
const flashVolume = ref(0.5);

const playSplatSound = () => {
  if (splatVolume.value <= 0) return;
  const audio = new Audio(`${baseUrl}sound/splat.mp3`);
  audio.volume = splatVolume.value;
  audio.play().catch((e) => console.error('Error playing splat:', e));
};

const handleUpdateSplat = (vol) => {
  splatVolume.value = vol;
};

const handleUpdateFlash = (vol) => {
  flashVolume.value = vol;
};

const syncCharacterLayers = () => {
  const parts = [];

  parts.forEach((p) => {
    const existsIndex = character.layers.findIndex(
      (l) => l.type === 'part' && l.part === p.part
    );

    if (p.hasValue) {
      // Should exist
      if (existsIndex === -1) {
        const newLayer = {
          id: p.part,
          type: 'part',
          part: p.part,
          label: p.label,
        };
        if (p.insertAt === 'start') {
          character.layers.unshift(newLayer);
        } else {
          character.layers.push(newLayer);
        }
      }
    } else {
      // Should NOT exist
      if (existsIndex !== -1) {
        character.layers.splice(existsIndex, 1);
      }
    }
  });
};

const handleSliderSelect = (item) => {
  if (currentMode.value === 'color') {
    if (currentCategory.value === 'skin') {
      character.color = item.value;
    } else if (currentCategory.value === 'eyes') {
      character.eyeColor = item.value;
    } else if (currentCategory.value === 'ears_color') {
      if (character.face.ears && typeof character.face.ears === 'object') {
        character.face.ears.color = item.value;
      }
    } else if (currentCategory.value === 'face_color') {
      if (character.face.face && typeof character.face.face === 'object') {
        character.face.face.color = item.value;
      }
    } else if (currentCategory.value === 'hair_color') {
      character.layers.forEach((l) => {
        if (l.category === 'hair') {
          l.color = item.value;
        }
      });
    } else if (currentCategory.value.startsWith('clothes_')) {
      const part = currentCategory.value
        .replace('clothes_', '')
        .replace('_color', '');

      character.layers.forEach((l) => {
        if (l.category === part) {
          l.color = item.value;
        }
      });
    } else if (
      currentCategory.value.startsWith('item_') &&
      currentCategory.value.endsWith('_color')
    ) {
      const idStr = currentCategory.value
        .replace('item_', '')
        .replace('_color', '');
      const layer = character.layers.find((l) => String(l.id) === idStr);
      if (layer) {
        layer.color = item.value;
      }
    }
    playSplatSound();
    return;
  }

  if (
    item.type === 'category' ||
    item.id === 'skin' ||
    item.id === 'eyes' ||
    (typeof item.id === 'string' &&
      item.id.startsWith('item_') &&
      item.id.endsWith('_color')) ||
    item.id === 'ears_color' ||
    item.id === 'face_color' ||
    item.id === 'hair_color' ||
    (typeof item.id === 'string' && item.id.startsWith('clothes_'))
  ) {
    console.log('Handling Category/Top-level');
    // Enter Category (Top-level)
    if (item.id === 'skin') {
      pushNavigation(colorList.value, 'color', null); // Label handled by category
    } else if (item.id === 'eyes') {
      pushNavigation(colorList.value, 'color', null);
    } else if (
      typeof item.id === 'string' &&
      item.id.startsWith('item_') &&
      item.id.endsWith('_color')
    ) {
      pushNavigation(colorList.value, 'color', null);
    } else if (item.id === 'ears_color') {
      pushNavigation(colorList.value, 'color', null);
    } else if (item.id === 'face_color') {
      pushNavigation(colorList.value, 'color', null);
    } else if (item.id === 'hair_color') {
      pushNavigation(colorList.value, 'color', null);
    } else if (typeof item.id === 'string' && item.id.startsWith('clothes_')) {
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
      pushNavigation(
        item.children,
        'image',
        activePopup.value === 'etc' ? null : item.label
      );
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
          character.face[
            currentCategory.value
          ] = `${baseUrl}templates/faces/Eye.PNG`;
        } else if (currentCategory.value === 'ears') {
          if (item.id === 'none_ears') {
            character.face[currentCategory.value] = null;
          } else {
            character.face[
              currentCategory.value
            ] = `${baseUrl}templates/ears/Ears_lineart.PNG`;
          }
        } else if (currentCategory.value === 'hair') {
          // Reset Hair: Remove only items visible in the current folder
          const visibleHairValues = currentItems.value.reduce((acc, i) => {
            if (i.front) acc.push(i.front);
            if (i.back) acc.push(i.back);
            if (i.value) acc.push(i.value);
            return acc;
          }, []);

          character.layers = character.layers.filter(
            (l) => l.category !== 'hair' || !visibleHairValues.includes(l.value)
          );
        } else {
          character.face[currentCategory.value] = null;
        }
      }
      playSplatSound();
      syncCharacterLayers(); // Sync after remove
    } else if (activePopup.value === 'clothes') {
      if (currentCategory.value) {
        // Reset Clothes: Remove only items visible in the current folder
        const visibleClothesValues = currentItems.value
          .filter((i) => i.value)
          .map((i) => i.value);

        character.layers = character.layers.filter(
          (l) =>
            l.category !== currentCategory.value ||
            !visibleClothesValues.includes(l.value)
        );
      }
      playSplatSound();
      syncCharacterLayers(); // Sync after remove
    } else if (activePopup.value === 'etc') {
      if (currentCategory.value) {
        // Reset Etc: Remove only items visible in the current folder (consistent behavior)
        const visibleEtcValues = currentItems.value
          .filter((i) => i.value)
          .map((i) => i.value);

        character.layers = character.layers.filter(
          (l) =>
            l.category !== currentCategory.value ||
            !visibleEtcValues.includes(l.value)
        );

        // Reset active layer if removed
        if (activeLayerId.value) {
          const exists = character.layers.find(
            (l) => l.id === activeLayerId.value
          );
          if (!exists) activeLayerId.value = null;
        }
      }
      playSplatSound();
      syncCharacterLayers(); // Sync after remove
    }
  } else if (item.type === 'image') {
    // Apply image
    if (activePopup.value === 'face') {
      if (currentCategory.value === 'hair') {
        // Limitless Hair Logic with Toggle
        // Check if this hair is already applied (by checking values of front/back)
        const existingIndices = [];
        character.layers.forEach((l, index) => {
          if (l.category === 'hair') {
            if (
              (item.front && l.value === item.front) ||
              (item.back && l.value === item.back) ||
              (item.value && l.value === item.value)
            ) {
              existingIndices.push(index);
            }
          }
        });

        if (existingIndices.length > 0) {
          // Remove all layers associated with this hair item
          // Sort descending to splice correctly
          existingIndices.sort((a, b) => b - a);
          existingIndices.forEach((idx) => {
            character.layers.splice(idx, 1);
          });
        } else {
          // Add Hair Layers
          const timestamp = Date.now();

          // 1. Back Hair (Behind Body -> Start of list)
          if (item.back) {
            const backLayer = {
              id: timestamp + '_back',
              type: 'image',
              label: item.label + ' (หลัง)',
              value: item.back,
              category: 'hair',
              bg: item.bg,
              stroke: item.stroke,
              color: '#ffffff',
            };
            character.layers.unshift(backLayer); // Add to bottom
          }

          // 2. Front Hair (In front of Body -> End of list)
          if (item.front) {
            const frontLayer = {
              id: timestamp + '_front',
              type: 'image',
              label: item.label + ' (หน้า)',
              value: item.front,
              category: 'hair',
              bg: item.bg,
              stroke: item.stroke,
              color: '#ffffff',
            };
            character.layers.push(frontLayer);
            activeLayerId.value = frontLayer.id;
          }

          // 3. Single/Value Hair
          if (item.value) {
            const valLayer = {
              id: timestamp,
              type: 'image',
              label: item.label,
              value: item.value,
              category: 'hair',
              bg: item.bg,
              stroke: item.stroke,
              color: '#ffffff',
            };
            character.layers.push(valLayer);
            activeLayerId.value = valLayer.id;
          }
        }
      } else if (currentCategory.value) {
        // Generalized Toggle logic for any face part (hair, ears, face) that might match grouping
        // Check if item is composite
        if (item.front || item.back || item.stroke || item.bg) {
          const current = character.face[currentCategory.value];
          // Simple equality check for object contents (checking unique IDs mainly)
          // or check if front/back/stroke/bg match
          const isSame =
            current &&
            typeof current === 'object' &&
            current.front === item.front &&
            current.back === item.back &&
            current.stroke === item.stroke &&
            current.bg === item.bg;

          if (isSame) {
            character.face[currentCategory.value] = null;
          } else {
            character.face[currentCategory.value] = {
              front: item.front,
              back: item.back,
              stroke: item.stroke,
              bg: item.bg,
              color: '#ffffff', // Default color
              id: item.id, // Store ID for tracking
              label: item.label, // Store Label for display
            };
          }
        } else {
          // Legacy/Single logic
          if (character.face[currentCategory.value] === item.value) {
            character.face[currentCategory.value] = null; // Remove if same
          } else {
            character.face[currentCategory.value] = item.value;
          }
        }
      }
    } else if (activePopup.value === 'clothes') {
      // Limitless Clothes Logic with Toggle
      // Check if this item is already in layers
      const existingIndex = character.layers.findIndex(
        (l) => l.type === 'image' && l.value === item.value
      );

      if (existingIndex !== -1) {
        // Remove existing
        character.layers.splice(existingIndex, 1);
      } else {
        // Add new layer
        const newId = Date.now();
        const newLayer = {
          id: newId,
          type: 'image', // Treat as generic image to allow limitless stacking
          label: item.label,
          value: item.value || null,
          stroke: item.stroke || null,
          bg: item.bg || null,
          category: currentCategory.value, // Add category for reset functionality
          color: '#ffffff',
        };
        character.layers.push(newLayer);
        if (newLayer.bg || newLayer.value) {
          activeLayerId.value = newId;
        }
      }

      // No sync needed for limitless layers, they are added directly.
      // But we call sync for other things if needed.
      syncCharacterLayers();
    } else if (activePopup.value === 'etc') {
      // Etc Logic with Toggle
      const existingIndex = character.layers.findIndex(
        (l) =>
          l.type === 'image' &&
          l.value === item.value &&
          l.category === currentCategory.value
      );

      if (existingIndex !== -1) {
        // Remove existing
        character.layers.splice(existingIndex, 1);
      } else {
        // Add new ETC layer
        const newId = item.id || Date.now();
        const newLayer = {
          id: newId,
          type: 'image',
          label: item.label,
          value: item.value,
          stroke: item.stroke,
          bg: item.bg,
          category: currentCategory.value, // Essential for highlight/reset
          color: '#ffffff',
        };
        character.layers.push(newLayer);
        if (newLayer.bg || newLayer.value) {
          activeLayerId.value = newId;
        }
      }
      playSplatSound();
      return; // Return early for ETC as it pushes its own layer
    }
    syncCharacterLayers();
    playSplatSound();
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
      label: 'รีเซ็ต',
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
  // Close any open popups (Layers, Music, etc)
  closeAllPopups();

  // Flash sound volume check
  if (flashVolume.value > 0) {
    const audio = new Audio(`${baseUrl}sound/camera_shutter.mp3`);
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
    } else if (currentCategory.value === 'ears_color') {
      return character.face.ears?.color || null;
    } else if (currentCategory.value === 'face_color') {
      return character.face.face?.color || null;
    } else if (
      currentCategory.value &&
      currentCategory.value.startsWith('clothes_')
    ) {
      const part = currentCategory.value
        .replace('clothes_', '')
        .replace('_color', '');
      return character.clothes[part]?.color || null;
    } else if (currentCategory.value === 'item_color') {
      const layer = character.layers.find((l) => l.id === activeLayerId.value);
      return layer ? layer.color : null;
    }
  }

  if (
    currentMode.value === 'image' ||
    currentMode.value === 'folder' ||
    currentMode.value === 'category'
  ) {
    if (activePopup.value === 'face') {
      if (currentCategory.value === 'hair') {
        // Limitless Hair: Return array of values from hair layers
        return character.layers
          .filter((l) => l.category === 'hair')
          .map((l) => l.value);
      }

      if (currentCategory.value) {
        // PopupSlider compares by value or reference.
        // If items have value as string, we need to match string.
        const val = character.face[currentCategory.value];
        if (val && typeof val === 'object') {
          // If stored as object, we usually match by 'value' property if it exists
          const result = val.value || val.front || val.stroke || val;
          return result;
        }
        return val;
      }
      return null;
    } else if (activePopup.value === 'clothes') {
      // Limitless Clothes: Return array of all active layer values
      return character.layers
        .filter((l) => l.type === 'image') // Limit to image layers (clothes/etc)
        .map((l) => l.value);
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
const menuTranslations = {
  color: 'สี',
  face: 'ใบหน้า',
  clothes: 'เครื่องประดับ',
  etc: 'อื่นๆ',
  layers: 'เลเยอร์',
};

const activePopupLabel = computed(() => {
  if (!activePopup.value) return '';
  return menuTranslations[activePopup.value] || activePopup.value;
});

const categoryLabel = computed(() => {
  if (!currentCategory.value) return '';
  const data =
    activePopup.value === 'clothes'
      ? clothesData
      : activePopup.value === 'face'
      ? faceData
      : activePopup.value === 'color'
      ? colorCategoryData.value
      : activePopup.value === 'etc'
      ? etcData
      : [];
  return data.find((c) => c.id === currentCategory.value)?.label || '';
});
</script>

<template>
  <div class="main-screen">
    <MusicControl
      :is-open="isMusicOpen"
      @toggle="handleToggleMusic"
      @update-splat-volume="handleUpdateSplat"
      @update-flash-volume="handleUpdateFlash"
    />

    <button v-if="!isFinished" class="reset-btn" @click="handleResetClick">
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
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
      </svg>
    </button>

    <div v-if="showResetConfirm && !isFinished" class="reset-modal-overlay">
      <div class="reset-modal">
        <p>คุณต้องการรีเซ็ตตัวละครใช่ไหม?</p>
        <div class="modal-buttons">
          <button @click="confirmReset" class="confirm-btn">ช่าย</button>
          <button @click="cancelReset" class="cancel-btn">ม่าย</button>
        </div>
      </div>
    </div>

    <button
      v-if="!isFinished"
      class="layer-btn"
      :class="{ active: activePopup === 'layers' }"
      @click="toggleLayerManager"
    >
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

    <div v-if="activePopup === 'layers' && !isFinished" class="layer-dropdown">
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
      <div class="character-area" @click="closeAllPopups">
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
  background-color: transparent; /* Remove solid bg, let elements pop? Or keep white container? */
  /* Actually, for the slider, maybe a solid container is better. */
  background-color: #fff;
  transition: height 0.3s ease; /* Slide up */
  overflow: hidden;
  z-index: 2100;
  border-top: 2px solid #000;
  /* box-shadow: 0 -4px 0px #000;  Maybe no shadow for full width, just border */
}

.popup-area.active {
  height: 190px; /* Reduced height */
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
  font-size: 1rem;
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
  right: 80px; /* Gap from right edge */
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

.layer-btn.active {
  background-color: #e0e0e0;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.music-btn {
  position: absolute;
  top: 1rem;
  background: white;
  border: 2px solid #000;
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 4px 4px 0px #000;
  cursor: pointer;
  z-index: 2500; /* High z-index to stay above overlays/popups */
  transition: transform 0.1s active;
  right: 1rem;
}

.reset-btn,
.layer-btn {
  position: absolute;
  top: 1rem;
  background-color: #ffffff;
  border: 2px solid #000;
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 4px 4px 0px #000;
  cursor: pointer;
  z-index: 2500; /* High z-index to stay above overlays/popups */
  transition: transform 0.1s active;
}

.layer-btn {
  right: 5rem; /* Space them out */
}

/* Override layer-btn specific positioning from previous CSS if handled there */

.music-btn:active,
.layer-btn:active,
.music-btn.active,
.layer-btn.active {
  transform: translate(2px, 2px); /* Physically move it to look pressed */
  box-shadow: 2px 2px 0px #000;
  background: #f0f0f0; /* Slight gray for active */
}

/* Dropdown Popup Style */
.layer-dropdown,
.volume-popup {
  position: absolute;
  top: 4.5rem;
  right: 1rem;
  z-index: 2200;
  background-color: white;
  padding: 0.8rem;
  border-radius: 12px;
  /* Neo-brutalism style */
  border: 2px solid #000;
  box-shadow: 6px 6px 0px #000;
}

.layer-dropdown {
  width: 280px; /* Increased to 280px */
  max-height: 50vh;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Constrain content */
}

.layer-dropdown .popup-header {
  padding: 0 0 0.5rem 0;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
  font-weight: 600;
  color: #333;
}

.reset-btn {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: white;
  border: 2px solid #000;
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 4px 4px 0px #000;
  cursor: pointer;
  z-index: 20;
  transition: transform 0.1s active;
}

.reset-btn svg {
  width: 2.5rem;
  height: 2.5rem;
}

.reset-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0px #000;
}

.reset-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* Maintain top layer above BottomNav (2000) */
}

.reset-modal {
  background: white;
  border: 4px solid #000;
  border-radius: 1.5rem;
  padding: 3rem;
  text-align: center;
  box-shadow: 8px 8px 0px #000;
  max-width: 90%;
  min-width: 320px;
}

.reset-modal p {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 2rem;
}

.modal-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.confirm-btn,
.cancel-btn {
  padding: 0.8rem 2.5rem;
  font-size: 1.2rem;
  border: 2px solid #000;
  border-radius: 0.5rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 2px 2px 0px #000;
}

.confirm-btn {
  background: #4ade80;
  color: black;
}
.cancel-btn {
  background: #f87171;
  color: white;
}

.confirm-btn:active,
.cancel-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 0px 0px 0px #000;
}
</style>
```
