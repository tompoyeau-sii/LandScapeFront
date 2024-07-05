<template>
  <div>
    <v-btn @click="dialog = true" class="account-btn text-none">
      Se connecter
    </v-btn>

    <v-dialog v-model="dialog" max-width="500">
      <v-card class="mx-auto pa-12 pb-3" elevation="8" width="480" rounded="lg">
        <h2 class="pb-4 text-center">On se connait ?</h2>
        <v-form ref="form" v-model="valid" @submit.prevent="handleLogin">
          <v-text-field
            v-model="email"
            placeholder="Adresse mail"
            prepend-inner-icon="mdi-email-outline"
            variant="solo-filled"
            :rules="[rules.required, rules.email]"
          ></v-text-field>

          <v-text-field
            :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
            :type="visible ? 'text' : 'password'"
            v-model="password"
            placeholder="Mot de passe"
            prepend-inner-icon="mdi-lock-outline"
            variant="solo-filled"
            @click:append-inner="visible = !visible"
            :rules="[rules.required]"
          ></v-text-field>

          <v-alert v-if="globalError" type="error" class="mt-4 mb-4">
            {{ globalError }}
          </v-alert>

          <v-btn class="connexion-button mb-2" size="large" type="submit" block>
            Me connecter
          </v-btn>
        </v-form>
        <v-card-text class="text-center">
          <RouterLink class="text-blue text-decoration-none" to="/inscription">
            Créez votre compte ici
            <v-icon icon="mdi-chevron-right"></v-icon>
          </RouterLink>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";

export default {
  data: () => ({
    valid: false,
    visible: false,
    dialog: false,
    email: "",
    password: "",
    emailError: "",
    passwordError: "",
    globalError: "",
    rules: {
      required: (value) => !!value || "Ce champ est requis.",
      email: (value) => {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(value) || "E-mail invalide.";
      },
    },
  }),
  computed: {
    ...mapState(["authError"]),
  },
  watch: {
    authError(newVal) {
      if (newVal) {
        this.globalError = newVal;
      }
    },
  },
  methods: {
    ...mapActions(["login"]),
    async handleLogin() {
      if (this.valid) {
        this.clearErrors();

        try {
          await this.login({ email: this.email, password: this.password });
          if (!this.authError) {
            this.dialog = false;
          }
        } catch (error) {
          this.globalError = "Une erreur s'est produite. Veuillez réessayer.";
        }
      }
    },
    clearErrors() {
      this.emailError = "";
      this.passwordError = "";
      this.globalError = "";
    },
  },
};
</script>

<style scoped>
.account-btn {
  background: linear-gradient(115deg, #4faaf5 0%, #1f30c9 100%) !important;
  color: white;
}

.connexion-button {
  color: white;
  background: linear-gradient(115deg, #4faaf5 0%, #1f30c9 100%) !important;
}
</style>
