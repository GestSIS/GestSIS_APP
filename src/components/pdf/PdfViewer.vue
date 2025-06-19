<script setup>
import { onMounted, ref, watch } from 'vue';

const { pdfData } = defineProps({
  pdfData: {
    type: Object,
  },
});

const url = ref(null);
const displayPdf = (data) => {
  const previousUrl = url.value;

  if (data === null) {
    document.getElementById('pdf-viewer').setAttribute('src', null);
  } else {
    url.value = URL.createObjectURL(
      new Blob([data], { type: 'application/pdf' }),
    );
    document.getElementById('pdf-viewer').setAttribute('src', url.value);
  }

  if (previousUrl !== null) {
    URL.revokeObjectURL(previousUrl);
  }
};
watch(
  () => pdfData,
  () => displayPdf(pdfData),
);
onMounted(() => displayPdf(pdfData));
</script>

<template>
  <iframe
    id="pdf-viewer"
    src=""
    type="application/pdf"
    width="100%"
    height="800px"
  >
    <html>
      <body>
        <object :data="pdfData" type="application/pdf">
          <div>No online PDF viewer installed</div>
        </object>
      </body>
    </html>
  </iframe>
</template>
