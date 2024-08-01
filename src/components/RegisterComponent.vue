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
        <transition name="slide-fade">
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
                  <v-checkbox
                    v-model="isAELChecked"
                    label="AEL"
                  ></v-checkbox>
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
              >En route !</v-btn>
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
                    v-model="company.address"
                    :rules="[rules.required]"
                    label="Siège social"
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
              </v-row>
              <v-btn
                class="mt-5 register-button"
                :disabled="!valid"
                color="blue"
                @click="submitCompany"
              >Soumettre</v-btn>
            </div>
          </v-form>
        </transition>
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
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../plugins/firebaseConfig";
import apiService from "@/services/apiService";

export default {
  data() {
    return {
      valid: false,
      step: 1, // Nouvelle propriété pour gérer la partie du formulaire visible
      user: {
        firstName: "",
        lastName: "",
        birthDate: "",
        email: "",
        password: "",
      },
      company: {
        name: "",
        address: "",
        siret: "",
      },
      isAELChecked: false,
      rules: {
        required: (value) => !!value || "Ce champ est requis.",
        email: (value) => {
          const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return pattern.test(value) || "E-mail invalide.";
        },
      },
    };
  },
  methods: {
    async handleSubmit() {
      if (this.$refs.form.validate()) {
        if (this.isAELChecked) {
          this.step = 2; // Passer à la deuxième partie du formulaire
        } else {
          await this.submit();
        }
      }
    },
    async submit() {
      if (this.$refs.form.validate()) {
        try {
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

          // Détermination de l'id du droit
          const rightId = this.isAELChecked ? 3 : 1;

          // Envoyer les données utilisateur à l'API Java Spring Boot
          const userData = {
            name: this.user.lastName,
            firstName: this.user.firstName,
            birthdate: this.user.birthDate,
            uId: user.uid,
            right: { id: rightId },
          };

          await apiService.post("/users", userData);

          if (this.isAELChecked) {
            // Attendre que la deuxième partie du formulaire soit validée
            this.step = 2;
          } else {
            // Redirection ou autre logique après inscription réussie
            console.log("Utilisateur inscrit et connecté:", this.user);
          }
        } catch (err) {
          console.error("Erreur d'inscription:", err);
        }
      }
    },
    async submitCompany() {
      if (this.$refs.form.validate()) {
        try {
          const companyData = {
            name: this.company.name,
            address: this.company.address,
            siret: this.company.siret,
            userUid: this.user.uid, // Associer l'entreprise à l'utilisateur
          };

          await apiService.post("/entreprises", companyData);

          // Redirection ou autre logique après l'inscription de l'entreprise
          console.log("Entreprise ajoutée:", companyData);
        } catch (err) {
          console.error("Erreur d'ajout de l'entreprise:", err);
        }
      }
    },
    retourPagePrecedente() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped>
/* Définir la transition pour le changement de partie du formulaire */
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: opacity 0.5s, transform 0.5s;
}
.slide-fade-enter, .slide-fade-leave-to /* .slide-fade-leave-active dans <2.1.8 */ {
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
