<template>
  <div class="company-container">
    <ToolBarComponent></ToolBarComponent>
    <div class="company-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import ToolBarComponent from "@/components/ael/CompanyToolBarComponent.vue";
export default {
  name: "CompanyView",
  components: {
    ToolBarComponent
  },
}
</script>

<style>
.company-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.company-content {
  flex: 1;
  left: 255px;
  padding: 16px;
  padding-left: 272px;
  overflow: auto;
}
</style>
