<template>
  <v-dialog v-model="dialog" max-width="500">
    <template v-slot:activator="{ props: activatorProps }">
      <v-btn icon="fa-user" v-bind="activatorProps" class="account-button">
        <i :class="{ fas: true, 'fa-user': true }"></i>
      </v-btn>
    </template>

    <v-card class="mx-auto pa-12 pb-3" elevation="8" width="480" rounded="lg">
      <h2 class="pb-4 text-center">On se connait ?</h2>
      <form @submit.prevent="login">
        <v-text-field
          v-model="email"
          placeholder="Adresse mail"
          prepend-inner-icon="mdi-email-outline"
          variant="solo-filled"
        ></v-text-field>

        <v-text-field
          :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
          :type="visible ? 'text' : 'password'"
          v-model="password"
          placeholder="Mot de passe"
          prepend-inner-icon="mdi-lock-outline"
          variant="solo-filled"
          @click:append-inner="visible = !visible"
        ></v-text-field>

        <v-btn
          class="mb-2"
          color="blue"
          size="large"
          variant="tonal"
          type="submit"
          block
        >
          Me connecter
        </v-btn>
      </form>
      <v-btn
        class="mb-2"
        color="blue"
        size="large"
        variant="tonal"
        prepend-icon="mdi-google"
        @click="loginWithGoogle"
        type="submit"
        block
      >
        Connexion avec Google
      </v-btn>
      <v-card-text class="text-center">
        <RouterLink class="text-blue text-decoration-none" to="/inscription">
          Créez votre compte ici
          <v-icon icon="mdi-chevron-right"></v-icon>
        </RouterLink>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  data: () => ({
    visible: false,
    dialog: false,
    email: "",
    password: "",
    error: "",
  }),
  methods: {
    ...mapActions(['login', 'loginWithGoogle']),
    async login() {
      try {
        await this.login({ email: this.email, password: this.password });
        this.dialog = false;
      } catch (err) {
        console.error(err);
        this.error = err.message;
      }
    },
    async loginWithGoogle() {
      try {
        await this.loginWithGoogle();
        this.dialog = false;
      } catch (err) {
        this.error = err.message;
      }
    },
  },
};
</script>

<style>
.account-button {
  right: 0px;
  position: absolute;
  margin: 1%;
  z-index: 2;
}
</style>
