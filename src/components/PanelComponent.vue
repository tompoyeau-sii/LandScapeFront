<template>
  <div class="panel">
    <div class="account">
      <meteo :route="route"></meteo>
      <Connexion v-if="!user"></Connexion>
      <div v-else>
        <notification-list></notification-list>
        <Account></Account>
        <!-- Ajout du bouton pour la redirection -->
        <v-btn @click="goToGestEntreprise">Gérer l'entreprise</v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import Connexion from "@/components/ConnexionComponent.vue";
import NotificationList from "@/components/NotificationList.vue";
import Account from "@/components/AccountComponent.vue";
import { mapState } from "vuex";
import Meteo from "@/components/MeteoComponent.vue";
import { mapActions } from "vuex";

export default {
  props: {
    route: {
      type: Array,
      required: true,
    }
  },
  components: {
    NotificationList,
    Connexion,
    Account,
    Meteo
  },
  computed: {
    ...mapState(["user"]), // Ajoutez l'état de l'utilisateur depuis Vuex
  },
  methods: {
    goToGestEntreprise() {
      this.$router.push('/gestentreprise');
    }
  }
};
</script>


<style>
.panel {
  position: absolute;
  padding: 1%;
  z-index: 2;
  right: 0;
}
.account {
  display: flex;
  align-items: center; /* Aligne le bouton au centre avec les autres éléments */
}
.account button {
  margin-left: 10px;
  padding: 5px 10px;
  background: linear-gradient(115deg, #4faaf5 0%, #1f30c9 100%) !important;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.account button:hover {
  background-color: #0056b3;
}
</style>
