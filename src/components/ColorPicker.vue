<script setup>
import { ref } from 'vue';

const emit = defineEmits(['add', 'close']);

const colorType = ref('solid'); // 'solid' or 'gradient'
const color1 = ref('#ff0000');
const color2 = ref('#0000ff');

const addColor = () => {
  let finalColor = color1.value;
  if (colorType.value === 'gradient') {
    finalColor = `linear-gradient(to bottom, ${color1.value}, ${color2.value})`;
  }
  emit('add', finalColor);
  emit('close');
};
</script>

<template>
  <div class="color-picker-overlay">
    <div class="picker-box">
      <h3>Add New Color</h3>

      <div class="type-selector">
        <button
          :class="{ active: colorType === 'solid' }"
          @click="colorType = 'solid'"
        >
          Solid
        </button>
        <button
          :class="{ active: colorType === 'gradient' }"
          @click="colorType = 'gradient'"
        >
          Gradient
        </button>
      </div>

      <div class="inputs">
        <input type="color" v-model="color1" />
        <input v-if="colorType === 'gradient'" type="color" v-model="color2" />
      </div>

      <div
        class="preview"
        :style="{
          background:
            colorType === 'gradient'
              ? `linear-gradient(to bottom, ${color1}, ${color2})`
              : color1,
        }"
      ></div>

      <div class="actions">
        <button @click="$emit('close')">Cancel</button>
        <button class="primary" @click="addColor">Add</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.color-picker-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 20;
}

.picker-box {
  background-color: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  width: 80%;
  max-width: 300px;
  text-align: center;
  color: #000;
}

.type-selector {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 1rem;
}

.type-selector button {
  padding: 5px 10px;
  background: #e0e0e0;
  border: none;
  color: #333;
  border-radius: 4px;
}

.type-selector button.active {
  background: #646cff;
  color: white;
}

.inputs {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 1rem;
}

input[type='color'] {
  width: 50px;
  height: 50px;
  border: none;
  background: none;
  cursor: pointer;
}

.preview {
  width: 100%;
  height: 50px;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
}

.actions {
  display: flex;
  justify-content: space-between;
}

.actions button {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  background: #e0e0e0;
  color: #333;
}

.actions button.primary {
  background: #646cff;
  color: white;
}
</style>
