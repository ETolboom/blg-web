<script setup>
import Stepper from 'primevue/stepper';
import StepList from 'primevue/steplist';
import Checkbox from 'primevue/checkbox';
import StepPanels from 'primevue/steppanels';
import Column from 'primevue/column';
import TreeTable from 'primevue/treetable';
import Button from "primevue/button";
import Step from 'primevue/step';
import StepPanel from 'primevue/steppanel';
import {MdEditor} from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import {ref} from "vue";

const text = ref("");
const fileInput = ref();
const fileName = ref();
const selectedAlgorithms = ref([]);
const autofillDisabled = ref(false);
const selectedKeys = ref();
const is_busy = ref(false);
const nodes = ref();

function handleFileChange() {
  fileName.value = fileInput.value.files[0].name;
}

const loadingText = ref("Analyzing.");

async function analyzeFile() {
  if (nodes.value && nodes.value.length > 0) {
    nodes.value = null;
    selectedAlgorithms.value = [];
    selectedKeys.value = null;
  }

  if (!fileName || fileName.value === "") alert("Please select a file!");

  is_busy.value = true;

  let dots = 1;
  let interval = setInterval(() => {
    dots = (dots % 3) + 1;
    loadingText.value = "Analyzing" + ".".repeat(dots);
  }, 500);

  nodes.value = await fetch("/algorithms/analyze/all", {
    method: "POST",
    body: fileInput.value.files[0],
  }).then((res) => res.json()).catch((e) => console.log(e)).finally(() => {
    is_busy.value = false;
    clearInterval(interval);
  });
}

function handleSelectionChange() {
  // We filter here to get rid of any root "folders"
  selectedAlgorithms.value = Object.keys(selectedKeys.value)
      .filter(key => key.includes("-"));
}

async function finalizeOnboarding() {
  is_busy.value = true;

  const algorithm_ids = selectedAlgorithms.value.map(key => {
    const node = findNodeById(nodes, key);
    return node ? node.data.id : null;
  }).filter(id => id !== null);

  let reference_xml = "";
  const file = fileInput.value.files[0];

  if (file) {
      reference_xml = await readFileAsText(file);
  }

  await fetch("/rubric", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      "assignment": {
        "reference_xml": reference_xml,
        "description": text.value,
      },
      "algorithms": algorithm_ids,
    }),
  }).then((res) => res.json()).then((data) => console.log(data)).catch((e) => console.log(e)).finally(() => {
    is_busy.value = false;
    location.reload();
  });
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = e => reject(e);
    reader.readAsText(file);
  });
}

function findNodeById(nodes, targetKey) {
  function search(nodeArray) {
    for (const node of nodeArray) {
      if (node.key === targetKey) {
        return node;
      }

      if (node.children && node.children.length > 0) {
        const result = search(node.children);
        if (result) return result;
      }
    }
    return null;
  }

  return search(nodes.value);
}

</script>

<template>
  <div class="card flex w-10/12 lg:w-1/2 h-full pt-8">
    <Stepper value="1" class="basis-[50rem]">
      <StepList>
        <Step value="1">Welcome</Step>
        <Step value="2">Assignment</Step>
        <Step value="3">Algorithms</Step>
      </StepList>
      <StepPanels class="h-full">
        <StepPanel v-slot="{ activateCallback }" value="1">
          <div class="flex flex-col h-48">
            <div
                class="border-2 border-gray-200 rounded bg-gray-100 p-4 flex-auto flex flex-col justify-start font-medium">
              <h1 class="text-xl pb-2 font-bold">Welcome to BLG!</h1>
              <div class="font-medium flex flex-col gap-y-1">
                <span>BPMN Learn & Grade (BLG) is designed to help you effectively grade student BPMN submissions!</span>
                <span>In order to get started a small onboarding process will first take place.</span>
                <span>Click "Next" in the bottom right corner of this dialog to get started.</span>
              </div>
            </div>
          </div>
          <div class="flex pt-6 justify-end">
            <Button label="Next" icon="pi pi-arrow-right" iconPos="right" @click="activateCallback('2')"/>
          </div>
        </StepPanel>
        <StepPanel class="h-full" v-slot="{ activateCallback }" value="2">
          <div class="flex flex-col">
            <div
                class="border-2 border-gray-200 rounded bg-gray-100 p-4 flex-auto flex flex-col justify-start font-medium">
              <h1 class="text-xl pb-2 font-bold">Assignment description</h1>
              <div class="font-medium flex flex-col gap-y-1">
                <span>When grading its useful to keep a reference to the assignment description available at all times.</span>
                <span>You can add one below using the editor. Don't worry you can always change it later.</span>
                <span>(P.S. It supports markdown!)</span>
              </div>
            </div>
            <div class="pt-4">
              <MdEditor v-model="text"
                        :toolbars='[ "bold", "underline", "italic", "-", "title", "strikeThrough", "sub", "sup", "quote", "unorderedList", "orderedList", "task"]'
                        theme="light" placeholder="Type here!" language="en-US"/>
            </div>
            <div class="flex pt-6 justify-between">
              <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('1')"/>
              <Button label="Next" icon="pi pi-arrow-right" iconPos="right" @click="activateCallback('3')"/>
            </div>
          </div>
        </StepPanel>
        <StepPanel v-slot="{ activateCallback }" value="3">
          <div class="flex flex-col">
            <div
                class="border-2 border-gray-200 rounded bg-gray-100 p-4 flex-auto flex flex-col justify-start font-medium">
              <h1 class="text-xl pb-2 font-bold">Algorithms</h1>
              <div class="font-medium flex flex-col gap-y-1">
                <span>One of the selling points of BLG is of course the algorithms that can be used to grade.</span>
                <span>If you have an existing BPMN file, you can drop it in the space below</span>
              </div>
            </div>
            <!-- Step 1. Uploading BPMN file-->
            <div class="mt-4 px-4 py-2 border-2 border-gray-200 rounded bg-gray-100 w-full justify-start">
              <h1 class="text-xl pb-4 font-bold">1. Select a BPMN file</h1>
              <div class="w-full flex flex-row justify-between">
                <div class="custom-file-upload">
                  <input
                      id="file-upload"
                      type="file"
                      class="hidden"
                      @change="handleFileChange"
                      ref="fileInput"
                  />
                  <Button icon="pi pi-upload" label="Select file" :disabled="autofillDisabled || is_busy"
                          @click="fileInput.click()"></Button>
                  <span class="pl-2 font-medium truncate">{{ fileName ?? "No file selected" }}</span>
                </div>
                <Button
                    icon="pi pi-check"
                    label="Analyze"
                    :disabled="!fileName || autofillDisabled || is_busy"
                    @click="analyzeFile"
                />
              </div>
              <div class=" bg-gray-200 rounded flex flex-row items-center p-2 mt-4">
                <Checkbox input-id="algorithm-auto-fill" binary :disabled="is_busy" v-model="autofillDisabled"/>
                <label for="algorithm-auto-fill" class="pl-2">I don't have a reference BPMN file.</label>
              </div>
            </div>
            <!-- Step 2. Selecting algorithms -->
            <div class="mt-4 px-4 py-2 border-2 border-gray-200 rounded bg-gray-100 w-full justify-start">
              <h1 class="text-xl pb-4 font-bold">2. Select algorithms</h1>
              <div class="font-medium flex flex-col gap-y-1">
                <span>Below you will find a list of algorithms that are applicable to your model.</span>
                <span>Please confirm the initial selection of algorithms that you may want to add.</span>
              </div>
            </div>
            <template v-if="nodes && !autofillDisabled">
              <TreeTable @change="handleSelectionChange" v-model:selectionKeys="selectedKeys" :value="nodes"
                         selectionMode="checkbox" class="border-2 border-gray-200 rounded bg-gray-100 mt-2">
                <Column field="name" header="Name" expander style="width: 34%"></Column>
                <Column field="description" header="Description" style="width: 66%"></Column>
              </TreeTable>
            </template>
            <template v-else-if="is_busy">
              <div class="border-2 border-gray-200 rounded bg-gray-100 mt-2 flex justify-center items-center">
                <span class="font-medium font-mono text-md p-4">{{
                    loadingText
                  }}</span>
              </div>
            </template>
            <template v-else>
              <div class="border-2 border-gray-200 rounded bg-gray-100 mt-2 flex justify-center items-center">
                <span class="font-medium font-mono text-md p-4">{{
                    autofillDisabled ? "Autofill disabled." : "Awaiting analysis..."
                  }}</span>
              </div>
            </template>
            <div class="mt-4 px-4 py-2 border-2 border-gray-200 rounded bg-gray-100 w-full justify-start">
              <h1 class="text-xl pb-4 font-bold">3. Confirmation</h1>
              <div class="font-medium flex flex-col gap-y-1">
                <span>Based on your selection BLG will be initialized.</span>
                <span>Any algorithms can be added or removed later at any point.</span>
                <span>To continue and start using BLG press the "Finalize" button.</span>
              </div>
            </div>
            <div class="flex pt-6 justify-between">
              <Button label="Back" severity="secondary" icon="pi pi-arrow-left" :disabled="is_busy"
                      @click="activateCallback('1')"/>
              <Button label="Finalize" icon="pi pi-arrow-right" iconPos="right"
                      :disabled="!(autofillDisabled || (selectedAlgorithms.length > 0)) || is_busy"
                      @click="finalizeOnboarding"/>
            </div>
          </div>
        </StepPanel>
      </StepPanels>
    </Stepper>
  </div>
</template>

<style scoped>

</style>