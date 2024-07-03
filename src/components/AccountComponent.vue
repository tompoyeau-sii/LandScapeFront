<template>
  <div>
    <h2>Bienvenue, {{ user.displayName || user.email }}</h2>
    <v-btn @click="logout">Se déconnecter</v-btn>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

export default {
  computed: {
    ...mapState(['user']),
  },
  methods: {
    ...mapActions(['logout']),
  },
};
</script>

<style>
/* Ajoutez votre style ici */
</style>
