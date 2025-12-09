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
      hair: null,
      face: null,
    }),
  },
  clothes: {
    type: Object,
    default: () => ({
      head: null,
      shirt: null,
      pant: null,
      shoes: null,
      hands: null,
    }),
  },
  etc: {
    type: Object,
    default: () => ({}),
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

const bodySkinStyle = computed(() => ({
  backgroundColor: props.color,
  maskImage: 'url(/templates/bodies/Body_skin.PNG)',
  webkitMaskImage: 'url(/templates/bodies/Body_skin.PNG)',
  maskSize: 'contain',
  webkitMaskSize: 'contain',
  maskRepeat: 'no-repeat',
  webkitMaskRepeat: 'no-repeat',
  maskPosition: 'center',
  webkitMaskPosition: 'center',
}));

const eyeInnerStyle = computed(() => ({
  backgroundColor: props.eyeColor,
  maskImage: 'url(/templates/faces/Inner_eye.PNG)',
  webkitMaskImage: 'url(/templates/faces/Inner_eye.PNG)',
  maskSize: 'contain',
  webkitMaskSize: 'contain',
  maskRepeat: 'no-repeat',
  webkitMaskRepeat: 'no-repeat',
  maskPosition: 'center',
  webkitMaskPosition: 'center',
}));

const earsSkinStyle = computed(() => {
  const earPath = props.face.ears || '/templates/ears/Ears_lineart.PNG';
  // Replace 'lineart' with 'skin' for the mask (case-insensitive replace if needed, but assuming strict naming for now)
  const maskPath = earPath.replace(/lineart/i, 'skin');

  return {
    backgroundColor: props.color,
    maskImage: `url(${maskPath})`,
    webkitMaskImage: `url(${maskPath})`,
    maskSize: 'contain',
    webkitMaskSize: 'contain',
    maskRepeat: 'no-repeat',
    webkitMaskRepeat: 'no-repeat',
    maskPosition: 'center',
    webkitMaskPosition: 'center',
  };
});
</script>

<template>
  <div class="character-display">
    <!-- Body Layer -->
    <!-- Back Accessories (e.g. Wings, Tail) -->
    <!-- We iterate etc and show all, but order matters. 
         If known keys, we place them. If unknown, we place them somewhere.
         Let's place specific known keys 'wings', 'tail' behind body. -->
    <img v-if="etc.wings" :src="etc.wings" class="layer wings" alt="Wings" />
    <img v-if="etc.tail" :src="etc.tail" class="layer tail" alt="Tail" />

    <!-- Skin Layers (Tinted) -->
    <div class="layer body-skin" :style="bodySkinStyle"></div>
    <img
      src="/templates/bodies/Body_lineart.PNG"
      class="layer body-lineart"
      alt="Body Lineart"
    />

    <!-- Ears Layers -->

    <div class="layer ears-skin" :style="earsSkinStyle"></div>
    <img
      :src="props.face.ears || '/templates/ears/Ears_lineart.PNG'"
      class="layer ears-lineart"
      alt="Ears Lineart"
    />

    <!-- Front Accessories from Etc (everything else or specific?) -->
    <template v-for="(src, key) in etc">
      <img
        v-if="src && key !== 'wings' && key !== 'tail'"
        :key="key"
        :src="src"
        class="layer etc-item"
        :class="key"
        :alt="key"
      />
    </template>

    <!-- Face Layer -->
    <!-- Face Layer (Features) -->
    <!-- Inner Eye Layer (Tinted) - Moved to front as requested -->
    <div class="layer eye-inner" :style="eyeInnerStyle"></div>
    <img
      v-if="face.face"
      :src="face.face"
      class="layer face-features"
      alt="Face Features"
    />
    <!-- Hair Layer (Behind Head/Hat or Over?) -> Usually Hair is top, but 'Head' (hat) might be higher. 
         Let's put Hair here. User asked for Hair and Face categories. -->
    <img v-if="face.hair" :src="face.hair" class="layer hair" alt="Hair" />

    <!-- Clothes Layers -->
    <img
      v-if="clothes.shoes"
      :src="clothes.shoes"
      class="layer shoes"
      alt="Shoes"
    />
    <img
      v-if="clothes.pant"
      :src="clothes.pant"
      class="layer pant"
      alt="Pant"
    />
    <img
      v-if="clothes.shirt"
      :src="clothes.shirt"
      class="layer shirt"
      alt="Shirt"
    />
    <img
      v-if="clothes.hands"
      :src="clothes.hands"
      class="layer hands"
      alt="Hands"
    />
    <img
      v-if="clothes.head"
      :src="clothes.head"
      class="layer head"
      alt="Head"
    />
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
  border: 1px dashed red; /* Temporary debug outline */
  box-sizing: border-box;
}

.body-skin,
.ears-skin {
  /* Dimensions handled by .layer, mask handles shape */
}
</style>
