<template>
  <div
    style="
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 100vw;
      margin-top: 3rem;
      gap: 3em;
    "
  >
    <Tooltip textColor="#4771FA" backgroundColor="white" flow="up"> Hover Me </Tooltip>
    <Tooltip textColor="goldenrod" backgroundColor="indianred" flow="down"> Hover Me </Tooltip>
    <Tooltip textColor="crimson" backgroundColor="#333" flow="left"> Hover Me </Tooltip>
    <Tooltip textColor="white" backgroundColor="purple" flow="right"> Hover Me </Tooltip>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Tooltip from '../components/Tooltip.vue'

export default defineComponent({
  name: 'Dev',
  props: {},
  emits: [],
  setup() {
    return {}
  },
  components: { Tooltip },
})
</script>

<style lang="sass" scoped></style>
