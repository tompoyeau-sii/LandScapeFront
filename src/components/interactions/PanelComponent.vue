<template>
  <div class="panel">
    <div class="account">
      <meteo :route="route"></meteo>
      <Connexion v-if="!user"></Connexion>
      <div v-else>
        <notification-list></notification-list>
        <Account></Account>
      </div>
    </div>
  </div>
</template>

<script>
import Connexion from "@/components/interactions/user/ConnexionComponent.vue"; // Importation du composant Connexion pour l'affichage de la connexion
import NotificationList from "@/components/interactions/NotificationList.vue"; // Importation du composant NotificationList pour afficher les notifications
import Account from "@/components/interactions/user/AccountComponent.vue"; // Importation du composant Account pour l'affichage des informations de l'utilisateur
import { mapState } from "vuex"; // Importation de la fonction mapState pour accéder à l'état Vuex
import Meteo from "@/components/interactions/MeteoComponent.vue"; // Importation du composant Meteo pour afficher les informations météo

export default {
  props: {
    route: {
      type: Array,
      required: true, // La prop 'route' est requise et doit être un tableau
    }
  },
  components: {
    NotificationList, // Déclaration du composant NotificationList pour être utilisé dans le template
    Connexion, // Déclaration du composant Connexion pour être utilisé dans le template
    Account, // Déclaration du composant Account pour être utilisé dans le template
    Meteo // Déclaration du composant Meteo pour être utilisé dans le template
  },
  computed: {
    ...mapState(["user"]), // Accès à l'état 'user' du store Vuex pour la réactivité du composant
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
</style>
