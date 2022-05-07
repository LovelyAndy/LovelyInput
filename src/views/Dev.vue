<template>
  <div class="_wrapper">
    <LovelyInput style="padding: 0 10rem" v-model="text" :debounce="3000" />
    {{ text }}
    <!-- <Tooltip textColor="#4771FA" backgroundColor="white" flow="up"> Hover Me </Tooltip>
    <Tooltip textColor="goldenrod" backgroundColor="indianred" flow="down"> Hover Me </Tooltip>
    <Tooltip textColor="crimson" backgroundColor="#333" flow="left"> Hover Me </Tooltip>
    <Tooltip textColor="white" backgroundColor="purple" flow="right"> Hover Me </Tooltip> -->
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import Tooltip from '../components/Tooltip.vue'
import LovelyInput from '../components/LovelyInput.vue'

export default defineComponent({
  name: 'Dev',
  setup() {
    const text = ref('')
    return { text }
  },
  components: { Tooltip, LovelyInput },
})
</script>

<style lang="sass" scoped>
._wrapper
  display: flex
  flex-direction: column
  justify-content: center
  align-items: center
  width: 100vw
  padding: 2rem
  margin-top: 3rem
  gap: 3em
</style>
