<template>
  <h1>Liste des utilisateurs</h1>
  <v-card flat>
    <template v-slot:text>
      <v-text-field v-model="search" label="Rechercher un utilisateur" prepend-inner-icon="mdi-magnify"
        variant="outlined" hide-details single-line></v-text-field>
    </template>
    <v-data-table :items="users" :headers="headers" :search="search" items-per-page-text="Utilisateurs par pages : ">
      <!-- Slot pour afficher une icône à la place du booléen -->
      <template v-slot:[`item.isSub`]="{ item }">
        <v-icon v-if="item.isSub" color="green">mdi-check</v-icon>
        <v-icon v-else color="red">mdi-close</v-icon>
      </template>

      <template v-slot:[`item.companiesDisplay`]="{ item }">
        <v-btn v-if="item.companies && item.companies.length > 0" color="primary" icon="mdi-office-building"
          class="rounded-lg" variant="text" @click="openCompaniesModal(item)">
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
            <v-list-item v-for="(company, index) in selectedUserCompanies" :key="index"
              @click="viewCompanyDetails(company)" class="company-list-item">
              <v-list-item-content>
                <v-list-item-title>{{ company.name }}</v-list-item-title>
                <v-list-item-subtitle>{{
        company.description
      }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </template>
        <template v-else>
          <div>
            <p><strong>Nom :</strong> {{ selectedCompany.name }}</p>
            <p><strong>Siret :</strong> {{ selectedCompany.siret }}</p>
            <v-col v-for="poi in selectedCompany.pois" :key="poi.id">
              <v-card class="poi-card">
                <v-card-title>
                  <span class="mr-3">{{ poi.name }}</span>
                  <v-chip class="poi-category">{{ poi.category.label }}</v-chip>
                </v-card-title>
                <v-card-text>
                  <p><strong>Adresse:</strong> {{ poi.address }}</p>
                  <p><strong>Description:</strong> {{ poi.description }}</p>
                </v-card-text>
              </v-card>
            </v-col>
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
import apiService from "@/services/apiService"; // Importation du service API pour gérer les requêtes HTTP

export default {
  name: "ListUsersComponent", // Nom du composant
  data() {
    return {
      search: "", // Texte de recherche pour filtrer les utilisateurs
      users: [], // Liste des utilisateurs récupérés depuis l'API
      rights: [], // Liste des droits disponibles pour les utilisateurs
      showCompaniesModal: false, // Contrôle l'affichage de la fenêtre modale pour les entreprises
      selectedUserCompanies: [], // Liste des entreprises associées à l'utilisateur sélectionné
      selectedCompany: null, // Détails de l'entreprise sélectionnée pour l'affichage dans la modale
      headers: [ // En-têtes des colonnes du tableau des utilisateurs
        { title: "Prenom", align: "start", key: "firstName" },
        { title: "Nom", align: "start", key: "name" },
        { title: "Date de naissance", align: "start", key: "birthdate" },
        { title: "Droit", align: "start", key: "right.label" },
        { title: "Abonné", align: "start", key: "isSub" },
        { title: "Entreprises", align: "start", key: "companiesDisplay" },
      ],
    };
  },
  async mounted() {
    // Méthode appelée lorsque le composant est monté, elle récupère la liste des utilisateurs
    try {
      const users = await apiService.get("/users");
      console.log("Données initiales récupérées:", users);
      this.users = users.map((user) => ({
        ...user,
        birthdate: this.formatDate(user.birthdate), // Formate la date de naissance des utilisateurs
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
      // Formate une date (YYYY-MM-DD) en une chaîne de caractères (DD/MM/YYYY)
      if (!date) return "";
      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
    },
    openCompaniesModal(user) {
      // Ouvre la modale des entreprises pour afficher les entreprises associées à un utilisateur
      this.selectedUserCompanies = user.companies || [];
      this.selectedCompany = null; // Réinitialise la sélection d'une entreprise spécifique
      this.showCompaniesModal = true;
    },
    viewCompanyDetails(company) {
      // Définit l'entreprise sélectionnée pour afficher ses détails dans la modale
      this.selectedCompany = company;
    },
  },
};

</script>

<style>
.company-list-item {
  cursor: pointer;
}
</style>
