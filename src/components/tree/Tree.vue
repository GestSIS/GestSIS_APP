<template>
  <div class="tree">
    <node v-for="item in tree.simple" :key="item.id" :node="item" :is-root="true"></node>
  </div>
</template>

<script>
import Node from '@/components/tree/Node.vue';

export default {
  name: 'tree',
  components: {
    Node,
  },
  data() {
    return {
      tree: {
        expanded: [
          'Satisfied customers (with avatar)',
          'Good food (with icon)',
        ],
        simple: [
          {
            id: 1,
            label: 'Groupes',
            avatar: 'https://cdn.quasar.dev/img/boy-avatar.png',
            children: [
              {
                label: 'Good food (with icon)',
                icon: 'restaurant_menu',
                children: [
                  { label: 'Quality ingredients' },
                  { label: 'Good recipe' },
                ],
              },
              {
                id: 2,
                label: 'Good service (disabled node with icon)',
                icon: 'room_service',
                disabled: true,
                children: [
                  { label: 'Prompt attention' },
                  { label: 'Professional waiter' },
                ],
              },
              {
                id: 3,
                label: 'Pleasant surroundings (with icon)',
                icon: 'photo',
                children: [
                  {
                    label: 'Happy atmosphere (with image)',
                    img: 'https://cdn.quasar.dev/img/logo_calendar_128px.png',
                  },
                  { label: 'Good table presentation' },
                  { label: 'Pleasing decor' },
                ],
              },
            ],
          },
          {
            id: 2,
            label: 'Fonctions',
            avatar: 'https://cdn.quasar.dev/img/boy-avatar.png',
          },
          {
            id: 2,
            label: 'Sans Fonctions',
            avatar: 'https://cdn.quasar.dev/img/boy-avatar.png',
          },
          {
            id: 2,
            label: 'Cours suivis',
            avatar: 'https://cdn.quasar.dev/img/boy-avatar.png',
          },
          {
            id: 2,
            label: 'Grade actuel',
            avatar: 'https://cdn.quasar.dev/img/boy-avatar.png',
          },
          {
            id: 2,
            label: 'Alphabétique',
            avatar: 'https://cdn.quasar.dev/img/boy-avatar.png',
          },
          {
            id: 2,
            label: 'Date',
            avatar: 'https://cdn.quasar.dev/img/boy-avatar.png',
          },
          {
            id: 2,
            label: 'Civilité',
            avatar: 'https://cdn.quasar.dev/img/boy-avatar.png',
          },
          {
            id: 2,
            label: 'Exercices',
            avatar: 'https://cdn.quasar.dev/img/boy-avatar.png',
          }
        ],
      },
    };
  },
};
</script>

<style lang="scss" scoped></style>
