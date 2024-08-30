<template>
  <div>
    <div class="title-bar">
      <h1>Liste des hobbies</h1>
      <v-btn prepend-icon="mdi-plus" class="text-none" color="primary" @click="showModal = true">Ajouter un hobby</v-btn>
    </div>
    <v-card flat>
      <template v-slot:text>
        <v-text-field
          v-model="search"
          label="Rechercher un hobby"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          single-line
        ></v-text-field>
      </template>
      <v-data-table
        :items="hobbies"
        :headers="headers"
        :search="search"
        items-per-page-text="Hobbies par pages : "
      >
      </v-data-table>
    </v-card>

    <v-dialog v-model="showModal" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Créer un hobby</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-text-field
              v-model="newHobby.label"
              label="Libellé"
              required
            ></v-text-field>
            <v-autocomplete
              v-model="newHobby.categoryId"
              :items="categories"
              item-title="label"
              item-value="id"
              label="Catégorie"
              required
            ></v-autocomplete>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="showModal = false">Annuler</v-btn>
          <v-btn color="blue darken-1" text @click="createHobby">Créer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import apiService from "@/services/apiService"; // Importation du service API pour gérer les requêtes HTTP

export default {
  name: "HobbyComponent", // Nom du composant
  data() {
    return {
      search: "", // Texte de recherche pour filtrer les hobbies
      hobbies: [], // Liste des hobbies récupérés depuis l'API
      categories: [], // Liste des catégories récupérées depuis l'API
      headers: [ // En-têtes des colonnes du tableau de hobbies
        { title: "Libellé", align: "start", key: "label" },
        { title: "Catégories", align: "start", key: "categoryLabel" },
      ],
      showModal: false, // Contrôle l'affichage de la fenêtre modale pour ajouter un hobby
      newHobby: {
        label: "", // Libellé du nouveau hobby
        categoryId: null, // ID de la catégorie associée au nouveau hobby
      }
    };
  },
  async mounted() {
    // Méthode appelée lorsque le composant est monté, récupère les hobbies et les catégories
    await this.fetchHobbies();
    await this.fetchCategories();
  },
  methods: {
    async fetchHobbies() {
      // Récupère la liste des hobbies depuis l'API et les stocke dans 'hobbies'
      try {
        const hobbies = await apiService.get("/hobbies");
        this.hobbies = hobbies;
      } catch (error) {
        console.error("Erreur lors de la récupération des hobbies:", error);
      }
    },
    async fetchCategories() {
      // Récupère la liste des catégories depuis l'API et les stocke dans 'categories'
      try {
        const categories = await apiService.get("/categories");
        this.categories = categories;
      } catch (error) {
        console.error("Erreur lors de la récupération des catégories:", error);
      }
    },
    async createHobby() {
      // Crée un nouveau hobby en envoyant les données à l'API
      if (this.$refs.form.validate()) { // Valide le formulaire avant l'envoi
        try {
          await apiService.post("/hobbies", this.newHobby);
          this.showModal = false; // Ferme la fenêtre modale après la création
          this.newHobby.label = ""; // Réinitialise le champ du libellé
          this.newHobby.categoryId = null; // Réinitialise le champ de la catégorie
          await this.fetchHobbies();  // Rafraîchit la liste des hobbies après l'ajout
        } catch (error) {
          console.error("Erreur lors de la création du hobby:", error);
        }
      }
    }
  }
};

</script>


<style>
.title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

