<template>
  <v-card class="toolbar">
    <v-layout>
      <v-navigation-drawer
        v-model="drawer"
        permanent
      >
        <v-list-item @click="goBack" prepend-icon="mdi-arrow-left" title="Retour à LandS'Cap"></v-list-item>

        <v-divider></v-divider>

        <v-list density="compact" nav>
          <v-list-item @click="navigateTo('')" prepend-icon="mdi-account-group" title="Utilisateurs"></v-list-item>
          <v-list-item @click="navigateTo('hobby')" prepend-icon="mdi-drama-masks" title="Hobbies"></v-list-item>
        </v-list>
      </v-navigation-drawer>
    </v-layout>
  </v-card>
</template>

<script>
export default {
  data () {
    return {
      drawer: true,
    }
  },
  methods: {
    navigateTo(view) {
      this.$router.push(`/administration/${view}`);
    },
    goBack() {
      this.$router.push('/');
    }
  }
}
</script>

<style>
.toolbar {
  z-index: 10;
}
</style>
