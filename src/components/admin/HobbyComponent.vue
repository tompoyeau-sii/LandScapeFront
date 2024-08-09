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
import apiService from "@/services/apiService";

export default {
  name: "HobbyComponent",
  data() {
    return {
      search: "",
      hobbies: [],
      categories: [],
      headers: [
        { title: "Libellé", align: "start", key: "label" },
        { title: "Catégories", align: "start", key: "categoryLabel" },
      ],
      showModal: false,
      newHobby: {
        label: "",
        categoryId: null,
      }
    };
  },
  async mounted() {
    await this.fetchHobbies();
    await this.fetchCategories();
  },
  methods: {
    async fetchHobbies() {
      try {
        const hobbies = await apiService.get("/hobbies");
        this.hobbies = hobbies;
      } catch (error) {
        console.error("Erreur lors de la récupération des hobbies:", error);
      }
    },
    async fetchCategories() {
      try {
        const categories = await apiService.get("/categories");
        this.categories = categories;
      } catch (error) {
        console.error("Erreur lors de la récupération des catégories:", error);
      }
    },
    async createHobby() {
      if (this.$refs.form.validate()) {
        try {
          await apiService.post("/hobbies", this.newHobby);
          this.showModal = false;
          this.newHobby.label = "";
          this.newHobby.categoryId = null;
          await this.fetchHobbies();  // Fetch the updated list of hobbies
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

