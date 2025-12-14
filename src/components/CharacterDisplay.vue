<script setup>
import { computed } from 'vue';

const props = defineProps({
  color: {
    type: String,
    default: '#ffe0bd',
  },
  eyeColor: {
    type: String,
    default: '#000000',
  },
  face: {
    type: Object,
    default: () => ({
      hair: null, // can be string or { front, back }
      face: null,
      ears: null, // Add ears to default if missing logic for it
    }),
  },
  clothes: {
    type: Object,
    default: () => ({
      head: null,
      shirt: null,
      pant: null,
      shoes: null,
      shoes: null,
      hands: null,
    }),
  },
  layers: {
    type: Array,
    default: () => [{ type: 'character' }],
  },
});

// Compute body style to apply color tint
// Using a simple SVG with fill would be best, but if using an image, we might need a mask or filter.
// Since we have body.svg, we can try to load it and change fill, or use a mask.
// For simplicity with the SVG placeholder, we can just use a div with the SVG as background and mask, or inline it.
// But to support the prompt's "color" feature which might be complex (gradients),
// let's assume the body.svg is a mask or we use CSS filter.
// Actually, the prompt says "body color".
// If I use an SVG, I can bind the fill color if I inline it.
// But loading dynamic SVGs inline is tricky without a library.
// Let's use a mask-image approach on a colored div for the body shape.
// Or just tint the image using `filter: drop-shadow` or `sepia` etc, but that's hard for specific colors.
// Best approach for "body color" with an asset:
// 1. body.png is grayscale/white.
// 2. We overlay a div with `background-color: props.color` and `mask-image: url(/body.svg)`.
// This allows gradients too!

const baseUrl = import.meta.env.BASE_URL;

const bodySkinStyle = computed(() => ({
  backgroundColor: props.color,
  maskImage: `url("${baseUrl}templates/bodies/Body_skin.PNG")`,
  webkitMaskImage: `url("${baseUrl}templates/bodies/Body_skin.PNG")`,
  maskSize: 'contain',
  webkitMaskSize: 'contain',
  maskRepeat: 'no-repeat',
  webkitMaskRepeat: 'no-repeat',
  maskPosition: 'center',
  webkitMaskPosition: 'center',
}));

const eyeInnerStyle = computed(() => ({
  backgroundColor: props.eyeColor,
  maskImage: `url("${baseUrl}templates/faces/Inner_eye.PNG")`,
  webkitMaskImage: `url("${baseUrl}templates/faces/Inner_eye.PNG")`,
  maskSize: 'contain',
  webkitMaskSize: 'contain',
  maskRepeat: 'no-repeat',
  webkitMaskRepeat: 'no-repeat',
  maskPosition: 'center',
  webkitMaskPosition: 'center',
}));

const earsSkinStyle = computed(() => {
  const e = props.face.ears;
  if (!e) return { display: 'none' }; // Hide if null

  let maskPath = `${baseUrl}templates/ears/Ears_skin.PNG`; // Default fallback
  let bgColor = props.color;

  if (e) {
    bgColor = props.earsColor || props.color;
    if (typeof e === 'string') {
      // Legacy string path
      if (e.includes('lineart')) {
        maskPath = e.replace(/lineart/i, 'skin');
      } else {
        maskPath = e.replace(/lineart/i, 'skin');
      }
    } else if (typeof e === 'object' && e.bg) {
      maskPath = e.bg;
      if (e.color) {
        bgColor = e.color;
      }
    }
  }

  return {
    backgroundColor: bgColor,
    maskImage: `url('${maskPath}')`,
    webkitMaskImage: `url('${maskPath}')`,
    maskSize: 'contain',
    webkitMaskSize: 'contain',
    maskRepeat: 'no-repeat',
    webkitMaskRepeat: 'no-repeat',
    maskPosition: 'center',
    webkitMaskPosition: 'center',
  };
});

const hairFrontUrl = computed(() => {
  const h = props.face.hair;
  if (!h) return null;
  if (typeof h === 'string') return h;
  return h.front;
});

const hairBackUrl = computed(() => {
  const h = props.face.hair;
  if (!h) return null;
  if (typeof h === 'string') return null; // Strings are assumed front-only (legacy/single)
  return h.back;
});

const earsUrl = computed(() => {
  const e = props.face.ears;
  if (!e) return null; // Hide if null
  if (typeof e === 'string') return e;
  return e.stroke || e.front || e.value;
});

const faceUrl = computed(() => {
  const f = props.face.face;
  if (!f) return null; // Or default?
  if (typeof f === 'string') return f;
  return f.stroke || f.front || f.value;
});

// Check if we should show the default inner eye
const showInnerEye = computed(() => {
  const f = props.face.face;
  // Default: Show if no face selected (null) or if it IS the template face (default value)
  if (!f || f === 'templates/faces/Eye.PNG') return true;

  // Check for _template_face_bg Exception
  let filename = '';
  if (typeof f === 'string') {
    filename = f;
  } else if (typeof f === 'object' && f.bg) {
    filename = f.bg;
  } else if (typeof f === 'object' && f.value) {
    filename = f.value;
  }

  if (filename && filename.toLowerCase().includes('_template_face_bg')) {
    return true;
  }

  // Otherwise hide
  return false;
});
</script>

<template>
  <div class="character-display">
    <template v-for="(layer, index) in layers" :key="layer.id || index">
      <!-- Composite Character Layer (Body, Ears, Face, Eyes) -->
      <div
        v-if="layer.type === 'character'"
        class="layer-group character-composite"
        :style="{ zIndex: index }"
      >
        <!-- Body -->
        <div class="layer body-skin" :style="bodySkinStyle"></div>
        <img
          :src="`${baseUrl}templates/bodies/Body_lineart.PNG`"
          class="layer body-lineart"
          alt="Body Lineart"
        />

        <!-- Ears -->
        <div class="layer ears-skin" :style="earsSkinStyle"></div>
        <img
          v-if="earsUrl"
          :src="earsUrl"
          class="layer ears-lineart"
          alt="Ears Lineart"
        />

        <!-- Eyes (Inner) -->
        <div
          v-if="showInnerEye"
          class="layer eye-inner"
          :style="eyeInnerStyle"
        ></div>

        <!-- Face Features -->
        <template
          v-if="
            face.face &&
            typeof face.face === 'object' &&
            (face.face.bg || face.face.stroke)
          "
        >
          <img
            v-if="
              face.face.bg &&
              face.face.bg.toLowerCase().includes('_template_face_bg')
            "
            :src="face.face.bg"
            class="layer face-features-bg"
            alt="Face Features BG"
          />
          <div
            v-else-if="face.face.bg"
            class="layer face-features-bg"
            :style="{
              backgroundColor: face.face.color || '#ffffff',
              maskImage: `url('${face.face.bg}')`,
              webkitMaskImage: `url('${face.face.bg}')`,
              maskSize: 'contain',
              webkitMaskSize: 'contain',
              maskRepeat: 'no-repeat',
              webkitMaskRepeat: 'no-repeat',
              maskPosition: 'center',
              webkitMaskPosition: 'center',
            }"
          ></div>

          <img
            v-if="face.face.stroke"
            :src="face.face.stroke"
            class="layer face-features"
            alt="Face Features Stroke"
          />
        </template>
        <img
          v-else-if="faceUrl"
          :src="faceUrl"
          class="layer face-features"
          alt="Face Features"
        />
      </div>

      <!-- Standard Parts -->
      <template v-if="layer.type === 'part'">
        <!-- Hair Back -->
        <img
          v-if="layer.part === 'hair_back' && hairBackUrl"
          :src="hairBackUrl"
          class="layer hair-back"
          alt="Hair Back"
          :style="{ zIndex: index }"
        />

        <!-- Pant -->
        <template v-if="layer.part === 'pant'">
          <template
            v-if="
              clothes.pant &&
              typeof clothes.pant === 'object' &&
              (clothes.pant.bg || clothes.pant.stroke)
            "
          >
            <div
              v-if="clothes.pant.bg"
              class="layer pant-bg"
              :style="{
                backgroundColor: clothes.pant.color || '#ffffff',
                maskImage: `url(${clothes.pant.bg})`,
                webkitMaskImage: `url(${clothes.pant.bg})`,
                maskSize: 'contain',
                webkitMaskSize: 'contain',
                maskRepeat: 'no-repeat',
                webkitMaskRepeat: 'no-repeat',
                maskPosition: 'center',
                webkitMaskPosition: 'center',
                zIndex: index,
              }"
            ></div>
            <img
              v-if="clothes.pant.stroke"
              :src="clothes.pant.stroke"
              class="layer pant"
              alt="Pant Stroke"
              :style="{ zIndex: index }"
            />
          </template>
          <img
            v-else-if="clothes.pant"
            :src="clothes.pant"
            class="layer pant"
            alt="Pant"
            :style="{ zIndex: index }"
          />
        </template>

        <!-- Shoes -->
        <template v-if="layer.part === 'shoes'">
          <template
            v-if="
              clothes.shoes &&
              typeof clothes.shoes === 'object' &&
              (clothes.shoes.bg || clothes.shoes.stroke)
            "
          >
            <div
              v-if="clothes.shoes.bg"
              class="layer shoes-bg"
              :style="{
                backgroundColor: clothes.shoes.color || '#ffffff',
                maskImage: `url(${clothes.shoes.bg})`,
                webkitMaskImage: `url(${clothes.shoes.bg})`,
                maskSize: 'contain',
                webkitMaskSize: 'contain',
                maskRepeat: 'no-repeat',
                webkitMaskRepeat: 'no-repeat',
                maskPosition: 'center',
                webkitMaskPosition: 'center',
                zIndex: index,
              }"
            ></div>
            <img
              v-if="clothes.shoes.stroke"
              :src="clothes.shoes.stroke"
              class="layer shoes"
              alt="Shoes Stroke"
              :style="{ zIndex: index }"
            />
          </template>
          <img
            v-else-if="clothes.shoes"
            :src="clothes.shoes"
            class="layer shoes"
            alt="Shoes"
            :style="{ zIndex: index }"
          />
        </template>

        <!-- Shirt -->
        <template v-if="layer.part === 'shirt'">
          <template
            v-if="
              clothes.shirt &&
              typeof clothes.shirt === 'object' &&
              (clothes.shirt.bg || clothes.shirt.stroke)
            "
          >
            <div
              v-if="clothes.shirt.bg"
              class="layer shirt-bg"
              :style="{
                backgroundColor: clothes.shirt.color || '#ffffff',
                maskImage: `url(${clothes.shirt.bg})`,
                webkitMaskImage: `url(${clothes.shirt.bg})`,
                maskSize: 'contain',
                webkitMaskSize: 'contain',
                maskRepeat: 'no-repeat',
                webkitMaskRepeat: 'no-repeat',
                maskPosition: 'center',
                webkitMaskPosition: 'center',
                zIndex: index,
              }"
            ></div>
            <img
              v-if="clothes.shirt.stroke"
              :src="clothes.shirt.stroke"
              class="layer shirt"
              alt="Shirt Stroke"
              :style="{ zIndex: index }"
            />
          </template>
          <img
            v-else-if="clothes.shirt"
            :src="clothes.shirt"
            class="layer shirt"
            alt="Shirt"
            :style="{ zIndex: index }"
          />
        </template>

        <!-- Head -->
        <template v-if="layer.part === 'head'">
          <template
            v-if="
              clothes.head &&
              typeof clothes.head === 'object' &&
              (clothes.head.bg || clothes.head.stroke)
            "
          >
            <div
              v-if="clothes.head.bg"
              class="layer head-bg"
              :style="{
                backgroundColor: clothes.head.color || '#ffffff',
                maskImage: `url(${clothes.head.bg})`,
                webkitMaskImage: `url(${clothes.head.bg})`,
                maskSize: 'contain',
                webkitMaskSize: 'contain',
                maskRepeat: 'no-repeat',
                webkitMaskRepeat: 'no-repeat',
                maskPosition: 'center',
                webkitMaskPosition: 'center',
                zIndex: index,
              }"
            ></div>
            <img
              v-if="clothes.head.stroke"
              :src="clothes.head.stroke"
              class="layer head"
              alt="Head Stroke"
              :style="{ zIndex: index }"
            />
          </template>
          <img
            v-else-if="clothes.head"
            :src="clothes.head"
            class="layer head"
            alt="Head"
            :style="{ zIndex: index }"
          />
        </template>

        <!-- Hair Front -->
        <template v-if="layer.part === 'hair_front'">
          <template
            v-if="
              face.hair &&
              typeof face.hair === 'object' &&
              (face.hair.bg || face.hair.stroke)
            "
          >
            <div
              v-if="face.hair.bg"
              class="layer hair-front-bg"
              :style="{
                backgroundColor: face.hair.color || '#ffffff',
                maskImage: `url('${face.hair.bg}')`,
                webkitMaskImage: `url('${face.hair.bg}')`,
                maskSize: 'contain',
                webkitMaskSize: 'contain',
                maskRepeat: 'no-repeat',
                webkitMaskRepeat: 'no-repeat',
                maskPosition: 'center',
                webkitMaskPosition: 'center',
                zIndex: index,
              }"
            ></div>
            <img
              v-if="face.hair.stroke"
              :src="face.hair.stroke"
              class="layer hair-front"
              alt="Hair Front Stroke"
              :style="{ zIndex: index }"
            />
          </template>
          <img
            v-else-if="hairFrontUrl"
            :src="hairFrontUrl"
            class="layer hair-front"
            alt="Hair Front"
            :style="{ zIndex: index }"
          />
        </template>

        <!-- Hands -->
        <template v-if="layer.part === 'hands'">
          <template
            v-if="
              clothes.hands &&
              typeof clothes.hands === 'object' &&
              (clothes.hands.bg || clothes.hands.stroke)
            "
          >
            <div
              v-if="clothes.hands.bg"
              class="layer hands-bg"
              :style="{
                backgroundColor: clothes.hands.color || '#ffffff',
                maskImage: `url('${clothes.hands.bg}')`,
                webkitMaskImage: `url('${clothes.hands.bg}')`,
                maskSize: 'contain',
                webkitMaskSize: 'contain',
                maskRepeat: 'no-repeat',
                webkitMaskRepeat: 'no-repeat',
                maskPosition: 'center',
                webkitMaskPosition: 'center',
                zIndex: index,
              }"
            ></div>
            <img
              v-if="clothes.hands.stroke"
              :src="clothes.hands.stroke"
              class="layer hands"
              alt="Hands Stroke"
              :style="{ zIndex: index }"
            />
          </template>
          <img
            v-else-if="clothes.hands"
            :src="clothes.hands"
            class="layer hands"
            alt="Hands"
            :style="{ zIndex: index }"
          />
        </template>
      </template>

      <!-- Image Layer (Etc) -->
      <template v-else-if="layer.type === 'image'">
        <!-- Dual Layer (Stroke/BG) -->
        <template v-if="layer.stroke || layer.bg">
          <!-- BG (Tinted) -->
          <div
            v-if="layer.bg"
            class="layer"
            :style="{
              backgroundColor: layer.color || '#ffffff',
              maskImage: `url(${layer.bg})`,
              webkitMaskImage: `url(${layer.bg})`,
              maskSize: 'contain',
              webkitMaskSize: 'contain',
              maskRepeat: 'no-repeat',
              webkitMaskRepeat: 'no-repeat',
              maskPosition: 'center',
              webkitMaskPosition: 'center',
              zIndex: index,
            }"
          ></div>
          <!-- Stroke -->
          <img
            v-if="layer.stroke"
            :src="layer.stroke"
            class="layer"
            :alt="layer.label + ' Stroke'"
            :style="{ zIndex: index }"
          />
        </template>
        <!-- Standard Single Image -->
        <img
          v-else
          :src="layer.value"
          class="layer etc-layer"
          :alt="layer.label"
          :style="{ zIndex: index }"
        />
      </template>
    </template>
  </div>
</template>

<style scoped>
.character-display {
  position: relative;
  width: 100%;
  height: 100%;
  margin: 0 auto;
}

.layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  box-sizing: border-box;
}

/* .body-skin and .ears-skin rules moved or removed if empty */
.layer-group {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
