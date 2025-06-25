<script async setup>
import {onMounted, ref, useTemplateRef} from "vue";

import BpmnZoomControls from "@/components/BpmnZoomControls.vue";
import Rubric from "@/components/Rubric.vue";
import Header from "@/components/Header.vue";
import {ProgressBar, useToast} from "primevue";

import {createModeler} from "@/bpmn/modeler.js";
import Onboarding from "@/components/Onboarding.vue";

let modeler = null;

const shouldOnboard = ref(false);

const reference_xml = ref(null);
const submission_xml = ref(null);

const rubric = ref(null);

const loading = ref(true);
const bpmn = useTemplateRef("bpmn-container");

const isModelerReady = ref(false);
const toast = useToast();

onMounted(async () => {
  // 1. Check backend for existing rubric
  // Yes -> Load rubric
  // No -> Start onboarding
  // 2. Once rubric is loaded create modeler

  await fetch("/rubric", {method: "GET"})
      .then(async res => {
        if (!res.ok) {
          if (res.status === 404) {
            loading.value = false;
            shouldOnboard.value = true;
          } else {
            toast.add({severity: 'error', summary: 'Could not grade submission', detail: await res.text()});
          }
        }
        rubric.value = await res.json();
        reference_xml.value = rubric.value.assignment.reference_xml;
      })

  if (shouldOnboard.value) return;

  modeler = await createModeler(bpmn.value, reference_xml.value);
  window.addEventListener("resize", () => modeler.get('canvas').resized());

  loading.value = false;
  isModelerReady.value = true;
})


const isReferenceLoaded = ref(false);

function updateRubric(newRubric) {
  loading.value = true;

  rubric.value.criteria = newRubric.criteria;

  loading.value = false;
}

async function toggleReference() {
  loading.value = true;

  if (isReferenceLoaded.value) {
    await modeler.importXML(submission_xml.value).catch((err) => {
      toast.add({ severity: 'error', summary: 'Loading failed', detail: err });
    });
  } else {
    await modeler.importXML(reference_xml.value).catch((err) => {
      toast.add({ severity: 'error', summary: 'Loading failed', detail: err });
    });
  }

  isReferenceLoaded.value = !isReferenceLoaded.value;

  modeler.get('zoomScroll').reset();
  modeler.get('canvas').zoom("fit-viewport");

  loading.value = false;
}


async function gradeSubmission(model_xml) {
  loading.value = true;

  submission_xml.value = model_xml;

  await fetch("/algorithms/analyze", {method: "POST", body: model_xml, headers: {"Content-Type": "application/xml"}})
      .then(async res => {
        if (!res.ok) {
          if (res.status === 404) {
            loading.value = false;
            shouldOnboard.value = true;
          } else {
            toast.add({severity: 'error', summary: 'Could not grade submission', detail: await res.text()});
          }
        } else {
          rubric.value = await res.json();
        }
      })

  loading.value = false;
}

function exportCsv(filename) {
  let data = []
  let headers = Object.keys(rubric.value.criteria[0]).join(",") + ",score\n"
  rubric.value.criteria.forEach((item) => {
    item.score = item.state ? item.points : 0;
    data.push(Object.values(item).map((item) => {
      return '"' + item + '"'
    }).join(","))
  })

  data = headers + data.join("\n")

  const blob = new Blob([data], {type: 'text/csv'})
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename.replace(".bpmn", ".csv")
  link.click();
  URL.revokeObjectURL(link.href)
  link.remove()
}

</script>

<template>
  <template v-if="loading">
    <div class="absolute bg-white top-0 z-10 h-full w-full flex flex-col justify-center items-center">
      <span class="font-mono p-2 text-2xl">Loading app...</span>
      <ProgressBar mode="indeterminate" style="height: 0.5rem; width: 16rem;"></ProgressBar>
    </div>
  </template>
  <template v-if="shouldOnboard">
    <div class="h-full w-full flex justify-center items-center">
      <Onboarding/>
    </div>
  </template>
  <template v-else>
    <div class="flex flex-row h-full justify-between">
      <div class="flex flex-col w-full h-full relative">
        <Header v-if="isModelerReady" :modeler="modeler" @export="exportCsv" @regrade="gradeSubmission"/>
        <div class="flex-1 h-full w-full relative" ref="bpmn-container"/>
        <BpmnZoomControls v-if="isModelerReady" :modeler="modeler"/>
      </div>
      <Rubric v-if="isModelerReady" :modeler="modeler" :criteria="rubric.criteria" @toggleReference="toggleReference" @updateRubric="updateRubric"
              :description="rubric.assignment.description"/>
    </div>
  </template>
  <Toast position="top-center" class="text-black"/>
</template>