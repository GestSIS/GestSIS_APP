<template>
  <div class="wrapper">
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.content {
  flex-grow: 1;
  /*ensures that the container will take up the full height of the parent container*/
  overflow-y: auto;
  /*adds scroll to this container*/
}

.wrapper {
  display: flex;
  width: 100%;
  align-items: stretch;
  height: 100%;
  overflow: hidden;
}
</style>
