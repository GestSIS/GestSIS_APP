<template>
  <table class="table">
    <slot></slot>
    <draggable
      v-for="item in liste"
      :key="item.id"
      v-model="liste.sapeurs"
      tag="tbody"
      group="sapeurs"
    >
      <tr>
        <td>
          <font-awesome-icon :icon="['fas', 'angle-down']" />
          <font-awesome-icon :icon="['fas', 'angle-right']" />
        </td>
        <td colspan="2">
          <input
            type="checkbox"
            :value="selected.includes(item.id)"
            @click="select(item.id)"
          />
        </td>
        <td>{{ item.designation }}</td>
      </tr>
      <tr v-if="item.groupes.length > 0">
        <td></td>
        <td colspan="2">
          <nested-draggable-table
            :liste="item.groupes"
            :select="select"
            :selected="selected"
            :filter="filter"
          >
          </nested-draggable-table>
        </td>
      </tr>
      <tr
        v-for="subItem in item.sapeurs.map(getSapeur)"
        :key="subItem.id"
        :class="{ 'table-primary': selected.includes(subItem.id) }"
      >
        <td></td>
        <td>
          <input
            type="checkbox"
            :value="selected.includes(subItem.id)"
            @click="select(item.id)"
          />
        </td>
        <td>{{ subItem.nom }} {{ subItem.prenom }}</td>
      </tr>
    </draggable>
  </table>
</template>

<script>
import Draggable from 'vuedraggable'
import { mapGetters } from 'vuex'

export default {
  name: 'NestedDraggableTable',
  components: {
    Draggable
  },
  props: {
    liste: Array,
    select: Function,
    selected: Array,
    filter: Function
  },
  computed: {
    ...mapGetters(['getSapeur'])
  }
}
</script>

<style scoped></style>
