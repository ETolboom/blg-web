<script setup>
import { Check, XIcon, Split } from "lucide-vue-next";
import {ref} from "vue";

const emit = defineEmits(['toggle', 'reset', 'updatePoints']);

const props = defineProps({
  "title": String,
  "description": String,
  "state": Boolean,
  "points": Number,
  "custom_score_set": Boolean,
});

const editing = ref(false);
const draft = ref(props.points);

function startEdit() {
  editing.value = true;
  draft.value = props.points;
  setTimeout(() => document.getElementById('points-input')?.select(), 0);
}

function finishEdit() {
  editing.value = false;
  emit('updatePoints', draft.value);
}


</script>

<template>
  <div class="flex flex-row bg-white border h-28 w-full px-2 rounded-md shadow-sm">
    <div class="flex flex-col justify-center items-center py-2">
      <template v-if="state === null">
        <div class="bg-yellow-600 cursor-pointer flex justify-center items-center h-16 w-16 rounded-t-sm">
          <span class="text-3xl">?</span>
        </div>
        <p class="bg-gray-50 text-gray-700 border border-gray-200 w-full h-8 flex justify-center items-center font-semibold rounded-b-sm">0</p>
      </template>
      <template v-else-if="state">
        <div v-if="custom_score_set" @click.stop="$emit('reset')" class="bg-orange-400 cursor-pointer flex justify-center items-center h-16 w-16 rounded-t-sm">
          <Split :size="36"/>
        </div>
        <div v-else @click.stop="$emit('toggle')" class="bg-green-600 cursor-pointer flex justify-center items-center h-16 w-16 rounded-t-sm">
            <Check :size="36"/>
        </div>
        <input
            v-if="editing"
            id="points-input"
            v-model.number="draft"
            @blur="finishEdit"
            @keyup.enter="finishEdit"
            class="bg-gray-50 text-gray-700 border border-gray-200 w-16 h-8 flex justify-center items-center font-semibold rounded-b-sm text-center outline-none"
            type="number"
            step="0.1"
        />
        <p
            v-else
            @dblclick="startEdit"
            class="bg-gray-50 text-gray-700 border border-gray-200 w-full h-8 flex justify-center items-center font-semibold rounded-b-sm cursor-pointer select-none"
        >
          {{ props.points }}
        </p>
      </template>
      <template v-else-if="!state">
        <div @click.stop="$emit('toggle')" class="bg-red-600 cursor-pointer flex justify-center items-center h-16 w-16 rounded-t-sm">
          <XIcon :size="36"/>
        </div>
        <p class="bg-gray-50 text-gray-700 border border-gray-200 w-full h-8 flex justify-center items-center font-semibold rounded-b-sm">0.0</p>
      </template>
    </div>
    <div class="my-2 bg-gray-50 border border-gray-200 rounded-sm flex-1 ml-2 p-2">
      <span class="font-semibold uppercase text-md text-gray-800">{{title}}</span>
      <p class="text-gray-600 text-sm">{{description}}</p>
    </div>
  </div>
</template>

<style scoped>

</style>