<template>
  <h1>Liste des utilisateurs</h1>
  <v-card flat>
    <template v-slot:text>
      <v-text-field
        v-model="search"
        label="Rechercher un utilisateur"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        hide-details
        single-line
      ></v-text-field>
    </template>
    <v-data-table
      :items="users"
      :headers="headers"
      :search="search"
      items-per-page-text="Utilisateurs par pages : "
    >
      <template v-slot:[`item.companiesDisplay`]="{ item }">
        <v-btn
          v-if="item.companies && item.companies.length > 0"
          color="primary"
          icon="mdi-office-building"
          class="rounded-lg"
          variant="text"
          @click="openCompaniesModal(item)"
        >
        </v-btn>
      </template>
    </v-data-table>
  </v-card>

  <!-- Modal pour afficher les détails des entreprises -->
  <v-dialog v-model="showCompaniesModal" max-width="600px">
    <v-card>
      <v-card-title>
        <span class="headline">
          {{ selectedCompany ? selectedCompany.name : "Entreprises" }}
        </span>
      </v-card-title>
      <v-card-text>
        <template v-if="!selectedCompany">
          <v-list>
            <v-list-item
              v-for="(company, index) in selectedUserCompanies"
              :key="index"
              @click="viewCompanyDetails(company)"
              class="company-list-item"
            >
              <v-list-item-content>
                <v-list-item-title>{{ company.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ company.description }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </template>
        <template v-else>
          <div>
            <p><strong>Nom :</strong> {{ selectedCompany.name }}</p>
            <p><strong>Siret :</strong> {{ selectedCompany.siret }}</p>
            <p><strong>Emplacements :</strong> {{ selectedCompany.pois }}</p>
            <!-- Ajoutez d'autres détails ici si nécessaire -->
          </div>
        </template>
      </v-card-text>
      <v-card-actions>
        <v-btn v-if="selectedCompany" color="blue darken-1" text @click="selectedCompany = null">
          Retour
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="showCompaniesModal = false">
          Fermer
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import apiService from "@/services/apiService";

export default {
  name: "ListUsersComponent",
  data() {
    return {
      search: "",
      users: [],
      rights: [], // Liste des droits disponibles sera remplie dynamiquement
      showCompaniesModal: false,
      selectedUserCompanies: [],
      selectedCompany: null,
      headers: [
        { title: "Prenom", align: "start", key: "firstName" },
        { title: "Nom", align: "start", key: "name" },
        { title: "Date de naissance", align: "start", key: "birthdate" },
        { title: "Droit", align: "start", key: "right.label" },
        { title: "Entreprises", align: "start", key: "companiesDisplay" },
      ],
    };
  },
  async mounted() {
    try {
      const users = await apiService.get("/users");
      console.log("Données initiales récupérées:", users);
      this.users = users.map(user => ({
        ...user,
        birthdate: this.formatDate(user.birthdate),
      }));
      
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des données initiales:",
        error
      );
    }
  },
  methods: {
    formatDate(date) {
      if (!date) return "";
      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
    },
    openCompaniesModal(user) {
      this.selectedUserCompanies = user.companies || [];
      this.selectedCompany = null; // Réinitialise la sélection d'une entreprise spécifique
      this.showCompaniesModal = true;
    },
    viewCompanyDetails(company) {
      this.selectedCompany = company; // Définit l'entreprise sélectionnée pour afficher ses détails
    },
  },
};
</script>

<style>
.company-list-item {
  cursor: pointer;
}
</style>
