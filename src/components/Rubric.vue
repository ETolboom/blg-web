<script setup>

import {PanelRightClose, PanelRightOpen, Pencil, PencilOff} from "lucide-vue-next";
import {Button, Select, SelectButton, Dialog, InputText, useToast} from "primevue";
import RubricCriterion from "@/components/RubricCriterion.vue";
import {nextTick, onMounted, ref, watch} from "vue";
import {MdEditor, MdPreview} from "md-editor-v3";
import _ from "lodash";

const props = defineProps(["modeler", "criteria", "description"]);
const emits = defineEmits(["toggleReference", "updateRubric"]);

const sidebarVisible = ref(true);

const totalScore = ref(0);
const correctPercentage = ref("0.0");
const correctScore = ref(0);

const currentMode = ref("Rubric");
const modeOptions = ref(["Rubric", "Assignment"])
const assignmentDescription = ref(props.description);

const previewMode = ref(true);
const toast = useToast();
const currentHighlightIndex = ref(-1);
const currentHighlightElements = ref([]);
const availableAlgorithms = ref(null);
const addDialogVisible = ref(false);
const selectedAlgorithm = ref(null);

const formData = ref([]);

const openAddDialog = () => {
  selectedAlgorithm.value = null; // Reset selection
  formData.value = [];
  addDialogVisible.value = true;
};

function addKeyValueItem(configIndex) {
  formData.value[configIndex].push({key: '', value: ['']});
}

function removeKeyValueItem(configIndex, itemIndex) {
  // Prevent removing the last item
  if (formData.value[configIndex].length > 1) {
    formData.value[configIndex].splice(itemIndex, 1);
  }
}

function addStringItem(configIndex) {
  formData.value[configIndex].push('');
}

function addValueItem(configIndex, itemIndex) {
  formData.value[configIndex][itemIndex].value.push('');
}

function removeValueItem(configIndex, itemIndex, valueIndex) {
  // Prevent removing the last item
  if (formData.value[configIndex][itemIndex].value.length > 1) {
    formData.value[configIndex][itemIndex].value.splice(valueIndex, 1);
  }
}

async function saveRubric() {
  console.log('Saving Rubric:', {
    algorithm: selectedAlgorithm.value,
    data: formData.value
  });

  await fetch(`/rubric/criteria/${selectedAlgorithm.value.id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData.value[0]),
  }).then(async (res) => {
    if (!res.ok) {
      throw await res.json();
    } else {
      return await res.json();
    }
  }).then((data) => {
    emits("updateRubric", data)
    toast.add({severity: 'success', summary: 'Rubric', detail: "Rubric criterion added successfully.", life: "5000"});
  }).catch((e) => {
    toast.add({severity: 'error', summary: 'Rubric', detail: e["detail"], life: "10000"});
  });

  addDialogVisible.value = false;
}

function calculateScore() {
  let total = 0;
  let correct = 0;
  props.criteria.forEach((item) => {
    total += item['default_points'];
    correct += item.fulfilled ? item['default_points'] : 0;
  });

  totalScore.value = total
  correctScore.value = correct
  correctPercentage.value = ((correct / total) * 100).toFixed(2);
}

function toggleState(index) {
  let criterionState = props.criteria[index].fulfilled
  props.criteria[index].fulfilled = !criterionState
  calculateScore();
}

async function clearHighlight(index) {
  for (let i = 0; i < currentHighlightElements.value.length; i++) {
    document.querySelectorAll(`[data-element-id="${currentHighlightElements.value[i]}"] > .djs-outline`)
        .forEach((el) => el.removeAttribute('style'));
  }
  currentHighlightElements.value = []
  if (currentHighlightIndex.value === index) {
    currentHighlightIndex.value = -1;
  }
}

async function toggleHighlight(index, problematicElements) {
  await nextTick();

  if (currentHighlightIndex.value !== -1) await clearHighlight(index);

  for (let i = 0; i < problematicElements.length; i++) {
    document.querySelectorAll(`[data-element-id="${problematicElements[i]}"] > .djs-outline`)
        .forEach((el) => el.style.cssText = "fill: none; stroke: red !important; visibility: visible !important;");
  }

  currentHighlightIndex.value = index;
  currentHighlightElements.value = problematicElements;

  await nextTick();
}


async function updateDescription() {
  await fetch("/rubric/description", {
    method: "POST", body: assignmentDescription.value,
    headers: {"Content-Type": "text/markdown; charset=UTF-8"}
  })
      .then(async res => {
        if (!res.ok) {
          toast.add({severity: 'error', summary: 'Could not save assignment description', detail: await res.text()});
        } else {
          // Optional: Show a success message
          toast.add({severity: 'success', summary: 'New assignment description saved!', life: 2000});
        }
      });
}

async function fetch_available_algorithms() {
  availableAlgorithms.value = await fetch("/algorithms", {
    method: "GET",
  })
      .then(async res => {
        if (!res.ok) {
          toast.add({severity: 'error', summary: 'Could not save assignment description', detail: await res.text()});
        } else {
          return await res.json();
        }
      });
}

const debouncedSave = _.debounce(() => {
  updateDescription();
}, 1500);

watch(
    () => props.criteria,
    () => calculateScore(),
    {deep: true}
);

watch(
    assignmentDescription,
    (newValue) => {
      if (newValue !== props.description) {
        debouncedSave();
      }
    },
);

watch(selectedAlgorithm, (newAlgorithm) => {
  if (!newAlgorithm || !newAlgorithm.inputs) {
    formData.value = [];
    return;
  }

  formData.value = newAlgorithm.inputs.map(inputConfig => {
    if (inputConfig['input_type'] === 'key-value') {
      return [{ key: '', value: [''] }];
    }
    else if (inputConfig['input_type'] === 'string') {
      return [{ key: "", value: ['']}];
    }

    return null;
  });
});

watch(currentMode, async (newMode) => {
  if (newMode === "Assignment") {
    await nextTick();
    await clearHighlight(currentHighlightIndex.value);
  }
  emits("toggleReference");
})

onMounted(() => {
  calculateScore()
  fetch_available_algorithms()
})

</script>

<template>
  <Dialog v-model:visible="addDialogVisible" modal header="Add rubric criteria" :style="{ width: '36rem' }">
    <div class="flex items-center gap-4 mb-4">
      <label for="username" class="font-semibold w-24">Algorithm</label>
      <Select :options="availableAlgorithms" v-model="selectedAlgorithm" option-label="name"
              class="flex-auto" placeholder="Select an algorithm"/>
    </div>
    <div v-if="selectedAlgorithm">
      <div v-if="selectedAlgorithm.inputs.length === 0">
        <span class="font-medium text-lg">This algorithm has no available inputs</span>
      </div>
      <div v-else v-for="(inputConfig, configIndex) in selectedAlgorithm.inputs" key="form-container" class="mb-4">
          <div v-if="inputConfig['input_type'] === 'key-value'">
            <label class="font-semibold block mb-2">{{ inputConfig['input_label'] }}</label>
            <div v-for="(item, itemIndex) in formData[configIndex]" :key="itemIndex"
                 class="mb-4 p-3 border border-gray-200 rounded-lg relative">
              <div class="flex flex-col gap-3 mb-2">
                <InputText v-model="item.key" :placeholder="inputConfig['key_label']" class="flex-auto"/>
                <div v-for="(value, valueIndex) in item.value" :key="valueIndex" class="flex gap-3">
                  <InputText v-model="item.value[valueIndex]" :placeholder="inputConfig['value_label']" class="flex-auto"/>
                  <Button icon="pi pi-trash" severity="danger" text rounded
                          @click="removeValueItem(configIndex, itemIndex, valueIndex)"
                          :disabled="item.value.length <= 1"></Button>
                </div>
                </div>
              <div v-if="inputConfig.multiple" class="flex justify-content-end">
                <Button label="Add Value" icon="pi pi-plus" severity="secondary" text
                        @click="addValueItem(configIndex, itemIndex)"></Button>
              </div>
              </div>
          </div>
          <div v-else-if="inputConfig['input_type'] === 'string'">
              <label :for="'input-' + configIndex" class="font-semibold block mb-2">{{ inputConfig['key_label'] }}</label>
              <div class="flex mb-4 gap-3 rounded-lg relative">
                <InputText class="flex-auto" :id="'input-' + configIndex" v-model="formData[configIndex].value[0]" :placeholder="inputConfig['value_label']"></InputText>
              </div>
              <div v-if="inputConfig.multiple" class="flex justify-content-end">
                <Button label="Add Another" icon="pi pi-plus" severity="secondary" text
                        @click="addStringItem(configIndex)"></Button>
              </div>
          </div>
      </div>
    </div>
    <div class="flex justify-end gap-2">
      <Button type="button" label="Cancel" severity="secondary" @click="addDialogVisible = false"></Button>
      <Button type="button" label="Save" @click="saveRubric"></Button>
    </div>
  </Dialog>
  <div
      :class="sidebarVisible ? ['block'] : ['transition-transform duration-300 ease-in-out transform w-16 overflow-x-hidden']">
    <div class="flex flex-col bg-gray-100 w-[32rem] text-white h-full">
      <div class="flex items-center justify-center bg-blue-500 rounded-b-lg h-14 px-2">
        <Button @click="sidebarVisible = !sidebarVisible" class="p-2 bg-gray-50 rounded-md">
          <PanelRightClose v-if="sidebarVisible" color="black" :size="18"/>
          <PanelRightOpen v-else color="black" :size="18"/>
        </Button>
        <span class="flex-1"></span>
        <SelectButton v-model="currentMode" default-value="Rubric" :options="modeOptions"/>
      </div>
      <template v-if="currentMode === 'Rubric'">
        <div class="rounded-t-lg mt-2 flex flex-col justify-center items-center overflow-x-scroll py-4 px-2 gap-y-1.5">
          <template v-for="(item, index) in criteria">
            <RubricCriterion
                :class='currentHighlightIndex === index ? ["border-2 border-blue-500" ] : ["border-gray-200"]'
                @click="toggleHighlight(index, item['problematic_elements'])"
                @toggle="toggleState(index)"
                :title="item.name"
                :description="item.description"
                :state="item.fulfilled"
                :points="item['default_points']"
            />
          </template>
          <Button @click="openAddDialog" label="Add criteria" icon="pi pi-plus"/>
        </div>
      </template>
      <template v-else>
        <div class="h-full relative">
          <Button class="top-0.5 right-2 z-10 p-2" style="position: absolute !important;"
                  @click="previewMode = !previewMode">
            <Pencil v-if="previewMode" :size="13"/>
            <PencilOff v-else :size="13"/>
          </Button>
          <MdPreview v-if="previewMode" v-model="assignmentDescription" style="height: 100%"
                     class="p-2 overflow-y-scroll"/>
          <MdEditor v-else v-model="assignmentDescription" style="height: 100%" :preview="false"
                    :toolbars='[ "bold", "underline", "italic", "-", "title", "strikeThrough", "sub", "sup", "quote", "unorderedList", "orderedList", "task"]'
                    theme="light" language="en-US"/>
        </div>
      </template>
      <div v-if="currentMode === 'Rubric'"
           class="relative bottom-0 h-12 bg-blue-500 rounded-t-lg mt-auto text-black flex px-8 text-lg font-semibold items-center w-full">
        <span>POINTS:</span>
        <span class="flex-1"></span>
        <span>{{ correctScore }} / {{ totalScore }} ({{ correctPercentage }}%)</span>
      </div>
    </div>
  </div>
</template>