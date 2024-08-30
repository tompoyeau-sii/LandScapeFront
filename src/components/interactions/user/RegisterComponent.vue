<template>
  <div class="body">
    <v-card class="mx-auto pa-12" elevation="8" max-width="1000" rounded="lg">
      <div class="head">
        <v-btn
          variant="text"
          @click="retourPagePrecedente"
          icon="mdi-arrow-left"
        ></v-btn>
        <h1 class="title">LandS'Cap</h1>
      </div>
      <div class="content">
        <v-form
          class="text-center"
          ref="form"
          v-model="valid"
          lazy-validation
          :key="step"
        >
          <!-- Partie 1: Informations utilisateur -->
          <div v-if="step === 1">
            <div class="mb-5">
              <h2>On se connait pas encore ?</h2>
              <h3>Remédions à ça !</h3>
            </div>
            <v-row>
              <v-col cols="12" lg="6">
                <v-text-field
                  v-model="user.firstName"
                  :rules="[rules.required]"
                  label="Prénom"
                  variant="solo-filled"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" lg="6">
                <v-text-field
                  v-model="user.lastName"
                  :rules="[rules.required]"
                  label="Nom"
                  variant="solo-filled"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="user.birthDate"
                  :rules="[rules.required]"
                  label="Date de naissance"
                  type="date"
                  variant="solo-filled"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-checkbox v-model="isAELChecked" label="AEL"></v-checkbox>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="user.email"
                  :rules="[rules.required, rules.email]"
                  label="E-mail"
                  variant="solo-filled"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="user.password"
                  :rules="[rules.required]"
                  label="Mot de passe"
                  type="password"
                  variant="solo-filled"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-btn
              class="mt-5 register-button"
              :disabled="!valid"
              color="blue"
              @click="handleSubmit"
              >En route !</v-btn
            >
          </div>

          <!-- Partie 2: Informations entreprise -->
          <div v-if="step === 2">
            <div class="mb-5">
              <h2>Informations sur l'entreprise</h2>
            </div>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="company.name"
                  :rules="[rules.required]"
                  label="Nom de l'entreprise"
                  variant="solo-filled"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="company.siret"
                  :rules="[rules.required]"
                  label="SIRET"
                  variant="solo-filled"
                  required
                ></v-text-field>
              </v-col>
              <!-- <v-col cols="12">
                  <v-text-field
                    v-model="company.photos"
                    :rules="[rules.required]"
                    label="URL des photos"
                    variant="solo-filled"
                    required
                  ></v-text-field>
                </v-col> -->
            </v-row>
            <v-btn
              class="mt-5 register-button"
              :disabled="!valid"
              color="blue"
              @click="submitCompany"
              >Soumettre</v-btn
            >
          </div>
        </v-form>

        <img
          class="img-form"
          src="@/assets/img/form.png"
          alt="Illustration formulaire"
        />
      </div>
    </v-card>
  </div>
</template>

<script>
import { createUserWithEmailAndPassword } from "firebase/auth"; // Importation de la fonction pour créer un utilisateur avec email et mot de passe depuis Firebase
import { auth } from "../../../plugins/firebaseConfig"; // Importation de la configuration Firebase
import apiService from "@/services/apiService"; // Importation d'un service API personnalisé pour les appels réseau

export default {
  data() {
    return {
      valid: false, // État de la validation du formulaire
      step: 1, // Étape actuelle du formulaire (1 pour les informations utilisateur, 2 pour les informations entreprise)
      user: { // Données liées à l'utilisateur
        firstName: "",
        lastName: "",
        birthDate: "",
        email: "",
        password: "",
        isSub: false // Indicateur pour savoir si l'utilisateur est abonné (AEL)
      },
      company: { // Données liées à l'entreprise
        name: "",
        siret: ""
      },
      isAELChecked: false, // Indicateur pour savoir si la case AEL est cochée
      rules: { // Règles de validation pour les champs du formulaire
        required: (value) => !!value || "Ce champ est requis.", // Validation pour les champs obligatoires
        email: (value) => {
          const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expression régulière pour valider les adresses email
          return pattern.test(value) || "E-mail invalide."; // Message d'erreur si l'email est invalide
        },
      },
    };
  },
  methods: {
    async handleSubmit() {
      if (this.$refs.form.validate()) { // Vérifie si le formulaire est valide
        if (this.isAELChecked) { // Si l'option AEL est cochée
          this.step = 2; // Passe à l'étape 2 du formulaire
        } else {
          await this.submit(); // Soumet les informations utilisateur
        }
      }
    },
    async submit() {
      if (this.$refs.form.validate()) { // Vérifie si le formulaire est valide
        try {
          // Formatage des noms pour la normalisation
          if (this.isAELChecked) {
            this.step = 2; // Passe à l'étape 2 si AEL est coché
          } else {
            this.user.lastName =
              this.user.lastName.charAt(0).toUpperCase() +
              this.user.lastName.slice(1).toLowerCase(); // Capitalise la première lettre du nom
            this.user.firstName =
              this.user.firstName.charAt(0).toUpperCase() +
              this.user.firstName.slice(1).toLowerCase(); // Capitalise la première lettre du prénom

            // Détermination de l'ID du droit
            const rightId = 1;

            // Création de l'utilisateur avec Firebase
            const userCredential = await createUserWithEmailAndPassword(
              auth,
              this.user.email,
              this.user.password
            );
            const user = userCredential.user; // Obtention des données utilisateur

            const userData = {
              name: this.user.lastName,
              firstName: this.user.firstName,
              birthdate: this.user.birthDate,
              isSub: this.user.isSub,
              uId: user.uid,
              right: { id: rightId },
            };
            this.userUid = user.uid; // Stockage de l'UID de l'utilisateur

            await apiService.post("/users", userData); // Envoi des données utilisateur à l'API
            this.$router.push("/"); // Redirection vers la page d'accueil après l'inscription
            console.log("Utilisateur inscrit et connecté:", this.user);

          }
        } catch (err) {
          console.error("Erreur d'inscription:", err); // Gestion des erreurs lors de l'inscription
        }
      }
    },
    async submitCompany() {
      if (this.$refs.form.validate()) { // Vérifie si le formulaire est valide
        try {
          // Accède aux détails de l'utilisateur
          const { firstName, lastName, birthDate, email, password, isSub } = this.user;

          // Création de l'utilisateur avec Firebase
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            this.user.email,
            this.user.password
          );
          const user = userCredential.user;

          // Formatage des noms
          this.user.lastName =
            this.user.lastName.charAt(0).toUpperCase() +
            this.user.lastName.slice(1).toLowerCase();
          this.user.firstName =
            this.user.firstName.charAt(0).toUpperCase() +
            this.user.firstName.slice(1).toLowerCase();

          // Détermination de l'ID du droit
          const rightId = 3;

          const companyData = {
            user: {
              firstName,
              name: lastName,
              birthdate: birthDate,
              isSub: isSub,
              email,
              password,
              uId: user.uid,
              right: { id: rightId },
            },
            company: {
              name: this.company.name,
              siret: this.company.siret
            },
          };
          
          await apiService.post("/companies/createWithUser", companyData); // Envoi des données utilisateur et entreprise à l'API
          console.log("Entreprise créée avec l'utilisateur:", companyData);
          this.$router.push("/"); // Redirection vers la page d'accueil après la création de l'entreprise
        } catch (err) {
          console.error("Erreur d'ajout de l'entreprise:", err); // Gestion des erreurs lors de l'ajout de l'entreprise
        }
      }
    },
    retourPagePrecedente() {
      this.$router.go(-1); // Retourne à la page précédente
    },
  },
};
</script>



<style scoped>
/* Définir la transition pour le changement de partie du formulaire */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.5s, transform 0.5s;
}
.slide-fade-enter,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

body {
  overflow: hidden;
}

.body {
  background: linear-gradient(115deg, #4faaf5 0%, #1f30c9 100%) !important;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

.v-card {
  width: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.head .title {
  flex: 1;
  text-align: center;
}

.content {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}

.v-form {
  max-width: 50%;
}

.img-form {
  width: 50%;
}

.register-button {
  color: white;
  background: linear-gradient(115deg, #4faaf5 0%, #1f30c9 100%) !important;
}

.mb-5 {
  margin-bottom: 32px;
}
</style>
