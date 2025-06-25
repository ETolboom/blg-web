<script setup>
import { Check, XIcon} from "lucide-vue-next";

const emit = defineEmits(['toggle']);

const props = defineProps({
  "title": String,
  "description": String,
  "state": Boolean,
  "points": Number,
});

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
        <div @click.stop="$emit('toggle')" class="bg-green-600 cursor-pointer flex justify-center items-center h-16 w-16 rounded-t-sm">
            <Check :size="36"/>
        </div>
        <p class="bg-gray-50 text-gray-700 border border-gray-200 w-full h-8 flex justify-center items-center font-semibold rounded-b-sm">{{points}}</p>
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