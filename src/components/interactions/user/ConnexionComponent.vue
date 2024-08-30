<template>
  <div>
    <v-btn @click="dialog = true" class="account-btn text-none">
      Se connecter
    </v-btn>

    <v-dialog v-model="dialog" max-width="500">
      <v-card class="mx-auto pa-12 pb-3 text-center" elevation="8" width="480" rounded="lg">
        <img class="w-75 landscape" src="@/assets/img/landscape.png">
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
    valid: false, // Indique si le formulaire est valide
    visible: false, // Contrôle la visibilité du mot de passe dans le champ de texte
    dialog: false, // Contrôle l'état du dialogue de connexion (ouvert/fermé)
    email: "", // Stocke l'adresse email saisie par l'utilisateur
    password: "", // Stocke le mot de passe saisi par l'utilisateur
    emailError: "", // Stocke les erreurs liées à l'email
    passwordError: "", // Stocke les erreurs liées au mot de passe
    globalError: "", // Stocke les erreurs globales de connexion
    rules: {
      // Règles de validation pour les champs du formulaire
      required: (value) => !!value || "Ce champ est requis.",
      email: (value) => {
        // Vérifie si l'email est valide selon une expression régulière
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(value) || "E-mail invalide.";
      },
    },
  }),
  computed: {
    // Récupère l'état d'erreur d'authentification depuis le store Vuex
    ...mapState(["authError"]),
  },
  watch: {
    // Surveille les changements de 'authError' et met à jour 'globalError'
    authError(newVal) {
      if (newVal) {
        this.globalError = newVal;
      }
    },
  },
  methods: {
    // Les actions du store Vuex sont mappées ici
    ...mapActions(["login"]),
    
    // Méthode pour gérer la soumission du formulaire de connexion
    async handleLogin() {
      if (this.valid) { // Vérifie si le formulaire est valide
        this.clearErrors(); // Efface les erreurs précédentes

        try {
          // Appelle l'action 'login' pour tenter de connecter l'utilisateur
          await this.login({ email: this.email, password: this.password });
          if (!this.authError) { // Si aucune erreur d'authentification
            this.dialog = false; // Ferme le dialogue de connexion
          }
        } catch (error) {
          // Gère les erreurs de connexion en affichant un message générique
          this.globalError = "Une erreur s'est produite. Veuillez réessayer.";
        }
      }
    },
    
    // Méthode pour effacer les messages d'erreur
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

.landscape {
  margin: auto;
}
</style>
