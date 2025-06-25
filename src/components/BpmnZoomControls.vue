<script setup>
import {Crosshair, ZoomIn, ZoomOut} from "lucide-vue-next";

const props = defineProps(["modeler"])

function zoomIn() {
  props.modeler.get('zoomScroll').stepZoom(1);
}

function zoomOut() {
  props.modeler.get('zoomScroll').stepZoom(-1);
}

function resetZoom() {
  props.modeler.get('zoomScroll').reset();
}

</script>

<template>
  <div class="absolute z-10 flex flex-col justify-center items-center py-2 bottom-12 right-3 w-[48px]" style="border-radius: 2px; border: solid 1px hsl(225, 10%, 75%); background-color: hsl(225, 10%, 97%)">
    <Crosshair @click="resetZoom" class="my-1 cursor-pointer" color="black" :size="32"/>
    <span class="w-8/12 bg-gray-400" style="height: 1px; margin: 5px;"/>
    <ZoomIn @click="zoomIn" class="my-1 cursor-pointer" color="black" :size="32"/>
    <span class="w-8/12 bg-gray-400" style="height: 1px; margin: 5px;"/>
    <ZoomOut @click="zoomOut" class="my-1 cursor-pointer" color="black" :size="32"/>
  </div>
</template>

<style scoped>

</style>