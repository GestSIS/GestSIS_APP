<template >
  <!-- <transition :css="false" @enter="onEnter" @afterEnter="onAfterEnter" @leave="onLeave"> -->
  <slot></slot>
  <!-- </transition> -->
</template>

<script setup>
// import gsap from "gsap";

// //FIXME: vue 3
// const onAfterEnter = (element) => {
//   console.log("onAfterEnter")
//   // element.style.height = 'auto';
//   gsap.set(element, {
//     height: 'auto',
//   })
// }
// const onEnter = (element, done) => {
//   console.log("onEnter")
//   // const width = getComputedStyle(element).width;

//   // element.style.width = width;
//   // element.style.position = 'absolute';
//   // element.style.visibility = 'hidden';
//   // element.style.height = 'auto';

//   // const height = getComputedStyle(element).height;

//   // gsap.set(element, {
//   //   width : null,
//   //   position : null,
//   //   visibility : null,
//   //   height : 0,
//   // });

//   // Force repaint to make sure the
//   // animation is triggered correctly.
//   // getComputedStyle(element).height;

//   // window.requestAnimationFrame(() => {
//   //   element.style.height = height;
//   // });
//   // done()
//   gsap.to(element, {
//     height: "auto",
//     duration: 0.5,
//     onComplete: done
//   })
// }
// const onLeave = (element, done) => {
//   console.log("onLeave")
//   const height = getComputedStyle(element).height;

//   element.style.height = height;
//   // Force repaint to make sure the
//   // animation is triggered correctly.
//   getComputedStyle(element).height;

//   requestAnimationFrame(() => {
//     element.style.height = 0;
//   });
//   done()
// }
</script>
