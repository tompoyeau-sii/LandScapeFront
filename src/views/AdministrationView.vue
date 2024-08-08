<template>
  <div class="admin-container">
    <ToolBarComponent></ToolBarComponent>
    <div class="admin-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import ToolBarComponent from "@/components/admin/ToolBarComponent.vue";
export default {
  name: "AdministrationView",
  components: {
    ToolBarComponent
  },
}
</script>

<style>
.admin-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.admin-content {
  flex: 1;
  left: 255px;
  padding: 16px;
  padding-left: 272px;
  overflow: auto;
}
</style>
