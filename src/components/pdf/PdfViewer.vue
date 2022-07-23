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

<script>
export default {
  props: ['pdfData'],
  data() {
    return {
      url: null,
    };
  },
  watch: {
    pdfData(next) {
      this.displayPdf(next);
    },
  },
  mounted() {
    this.displayPdf(this.pdfData);
  },
  methods: {
    displayPdf(data) {
      const previousUrl = this.url;

      if (data === null) {
        document.getElementById('pdf-viewer').setAttribute('src', null);
      } else {
        this.url = URL.createObjectURL(
          new Blob([data], { type: 'application/pdf' })
        );
        document.getElementById('pdf-viewer').setAttribute('src', this.url);
      }

      if (previousUrl !== null) {
        URL.revokeObjectURL(previousUrl);
      }
    },
  },
};
</script>

<style></style>
