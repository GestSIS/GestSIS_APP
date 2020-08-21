<template>
  <canvas id="pdf-viewer" width="100%" height="100%"></canvas>
</template>

<script>
//TODO Change pdf.js from cdn to yarn
export default {
  props: ['pdfData'],
  async mounted() {
    // const loadingTask = pdfjsLib.getDocument({data: this.pdfData});
    const loadingTask = pdfjsLib.getDocument({
      url: this.pdfData,
    });
    const pdf = await loadingTask.promise;

    // Load information from the first page.
    const page = await pdf.getPage(1);

    const scale = 1;
    const viewport = page.getViewport(scale);

    // Apply page dimensions to the <canvas> element.
    const canvas = document.getElementById('pdf-viewer');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render the page into the <canvas> element.
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    await page.render(renderContext);
  },
};
</script>

<style></style>
