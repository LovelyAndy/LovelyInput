<script setup lang="ts">
import Tooltip from './components/Tooltip.vue'
</script>

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
