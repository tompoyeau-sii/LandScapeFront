<template>
  <div class="title-bar">
    <h1>Mes entreprises</h1>
    <v-btn
      prepend-icon="mdi-plus"
      class="ma-5 text-none"
      color="primary"
      @click="showCompanyModal = true"
    >
      Ajouter une entreprise
    </v-btn>
  </div>

  <v-data-table
    v-if="currentUser.companies.length"
    :items="currentUser.companies"
    :headers="headers"
    items-per-page-text="Entreprises par pages : "
  >
    <!-- Utilisation des slots pour rendre les lignes cliquables -->
    <template v-slot:item="{ item }">
      <tr @click="goToCompanyDetails(item.id)" class="entreprise">
        <td>{{ item.name }}</td>
        <td>{{ item.siret }}</td>
      </tr>
    </template>
  </v-data-table>

  <div v-else>
    <p>Vous n'avez encore aucune entreprise.</p>
  </div>

  <!-- Modal pour ajouter une entreprise -->
  <v-dialog v-model="showCompanyModal" max-width="500px">
    <v-card>
      <v-card-title>
        <span class="headline">Ajouter une entreprise</span>
      </v-card-title>
      <v-card-text>
        <v-text-field
          v-model="newCompany.name"
          label="Nom"
          required
        ></v-text-field>
        <v-text-field
          v-model="newCompany.siret"
          label="SIRET"
          required
        ></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-btn text @click="closeAddCompanyModal">Annuler</v-btn>
        <v-btn color="primary" @click="addCompany">Ajouter entreprise</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters } from "vuex";
import apiService from "@/services/apiService";

export default {
  data() {
    return {
      showCompanyModal: false,
      newCompany: {
        name: "",
        siret: "",
      },
      headers: [
        { title: "Libellé", align: "start", key: "name" },
        { title: "Siret", align: "start", key: "headOffice" },
      ],
    };
  },
  methods: {
    goToCompanyDetails(companyId) {
      this.$router.push({ name: "CompanyDetails", params: { id: companyId } });
    },
    closeAddCompanyModal() {
      this.showCompanyModal = false;
      this.newCompany = { name: "", headOffice: "", siret: "" };
    },
    async addCompany() {
      try {
        const { name, siret } = this.newCompany;
        if (name && siret && this.currentUser.id) {
          const company = {
            name,
            siret,
            user: {
              id: this.currentUser.id,
            },
          };
          await apiService.post(`/companies`, company);
          this.closeAddCompanyModal();
          await this.updateCurrentUser();
        } else {
          console.error("Les données de l'entreprise sont invalides.");
        }
      } catch (error) {
        console.error("Erreur lors de l'ajout de l'entreprise:", error);
      }
    },
    async updateCurrentUser() {
      try {
        const updatedUser = await apiService.get(
          `/users/${this.currentUser.uId}`
        );
        this.$store.commit("setUser", updatedUser);
      } catch (error) {
        console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
      }
    },
  },
  computed: {
    ...mapGetters({
      currentUser: "getUser",
    }),
  },
};
</script>
<style scoped>
.entreprise {
  cursor: pointer;
}

.entreprise:hover {
  background-color: #f0f0f0;
}
</style>