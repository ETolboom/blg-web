<script setup>
import {ArrowLeft, ArrowRight, EllipsisVertical, PlusIcon, FileDown } from "lucide-vue-next";
import {Button, Dialog, Select, useToast} from "primevue";
import {onMounted, ref, watch} from "vue";

let visible = ref(false);

const refSubmission = { filename: "Reference", "name": "Reference" };
const selectedSubmission = ref(refSubmission);
const submissions = ref([refSubmission])

const emit = defineEmits(["export", "regrade"])
const props = defineProps(["modeler"])
const toast = useToast();

onMounted(() => {
  fetch("/submissions", { method: "GET" }).then(res => res.json()).then((data) => {
    submissions.value.push(...data)
  }).catch((err) => {
    console.log(err);
    toast.add({ severity: 'error', summary: 'Loading failed', detail: 'Could not load list of submissions.' });
  });
})

async function loadSubmission(submission) {
  const response = await fetch(`/submissions/${submission}`);
  const diagramXML = await response.text();
  await props.modeler.importXML(diagramXML).catch((err) => {
    toast.add({ severity: 'error', summary: 'Loading failed', detail: err });
  });
  return diagramXML;
}

watch(selectedSubmission, async () => {
  const modelXml = await loadSubmission(selectedSubmission.value.filename);
  props.modeler.get('zoomScroll').reset();
  props.modeler.get('canvas').zoom("fit-viewport");
  emit('regrade', selectedSubmission.value.filename, modelXml);
})

function previousSubmission() {
  let index = findSubmissionIndex();
  if (index === -1) return;
  if (index === 0) return;
  selectedSubmission.value = submissions.value[index - 1]
}

function nextSubmission() {
  let index = findSubmissionIndex();
  if (index === -1) return;
  if (index === submissions.value.length) return;
  selectedSubmission.value = submissions.value[index + 1]
}

function findSubmissionIndex() {
  let currentSubmission = selectedSubmission.value.filename;
  return submissions.value.findIndex((item) => item.filename === currentSubmission);
}

</script>

<template>
  <header class="flex w-11/12 absolute left-5 top-0 left-50% flex-row items-center h-14 z-10 px-2 my-2" style="border-radius: 2px; border: solid 1px hsl(225, 10%, 75%); background-color: rgb(247, 247, 248);">
    <Button @click="previousSubmission" variant="outlined" severity="secondary">
      <ArrowLeft/>
    </Button>
    <Select v-model="selectedSubmission" :options="submissions" optionLabel="filename" placeholder="Select a submission" class="font-semibold m-2 w-64" filter/>
    <Button @click="nextSubmission" severity="secondary">
      <ArrowRight/>
    </Button>
    <Button severity="secondary" class="ml-2">
      <PlusIcon/>
    </Button>
    <span class="flex-1"></span>
    <Button severity="secondary" @click="visible = !visible">
      <EllipsisVertical/>
    </Button>
  </header>
  <Dialog v-model:visible="visible" modal header="Options" :style="{ width: '25rem' }">
    <div class="border-1 border-gray-700 p-4 rounded-lg">
      <span>Manage graded submissions</span>
      <Button icon="pi pi-file-excel" severity="secondary" class="w-full mt-4" as="a" target="_blank" rel="noopener" label="Export current submission" :href="`./submissions/export?filename=${selectedSubmission.filename}`"/>
      <Button icon="pi pi-folder" severity="secondary" class="w-full mt-4" as="a" target="_blank" rel="noopener" label="Export all submissions" href="./submissions/export/all"/>
    </div>
  </Dialog>
</template>