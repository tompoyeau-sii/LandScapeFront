<template>
    <div class="panel">
        <Connexion v-if="!user"></Connexion>
        <div class="account" v-else>
            <notification-list></notification-list>
            <Account></Account>
        </div>
    </div>
</template>

<script>
import Connexion from "@/components/ConnexionComponent.vue";
import NotificationList from "@/components/NotificationList.vue";
import Account from "@/components/AccountComponent.vue";

import { mapState } from "vuex";
export default {
  components: {
    NotificationList,
    Connexion,
    Account,
  },
  computed: {
    ...mapState(["user"]), // Ajoutez l'état de l'utilisateur depuis Vuex
  },
};
</script>

<style>
.account button{
    margin-left: 10px;
}
</style>