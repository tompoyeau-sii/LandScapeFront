<template>
  <div class="container">
    <v-btn
      variant="text"
      prepend-icon="mdi-arrow-left"
      class="return-button"
      @click="retourPagePrecedente"
    >
      Retour
    </v-btn>

    <v-container v-if="company">
      <v-row>
        <v-col class="title" cols="12">
          <h1>{{ company.name }}</h1>
          <p class="ml-3">{{ company.siret }}</p>
        </v-col>
        <v-col cols="12">
          <div class="header-container">
            <h3 class="header-title">Commerces</h3>
            <v-btn
              icon="mdi-plus"
              variant="text"
              class="add-poi-button"
              @click="showPOIModal = true"
              color="primary"
            ></v-btn>
          </div>
          <v-row>
            <v-col v-for="poi in company.pois" :key="poi.id" cols="12" md="6">
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
          </v-row>
        </v-col>
      </v-row>
    </v-container>

    <!-- Modal pour ajouter un POI -->
    <v-dialog v-model="showPOIModal" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Ajouter un commerce</span>
        </v-card-title>
        <v-card-text>
          <v-text-field
          variant="solo-filled"
            v-model="newPOI.name"
            label="Nom"
            required
          ></v-text-field>
          <v-text-field
          variant="solo-filled"
            v-model="newPOI.address"
            label="Adresse"
            @input="debouncedSearchAddressOptions"
            @focus="showAddressSuggestions = true"
            required
          ></v-text-field>
          <div
            v-if="showAddressSuggestions && addressOptions.length"
            class="address-suggestions mb-5"
          >
            <p
              v-for="option in addressOptions"
              :key="option.place_id"
              @click="selectAddress(option)"
              class="list-element"
            >
              {{ option.label }}
            </p>
          </div>
          <v-autocomplete
          variant="solo-filled"
            v-model="newPOI.categoryId"
            :items="categories"
            item-title="label"
            item-value="id"
            label="Catégorie"
            required
          ></v-autocomplete>
           <v-textarea
           variant="solo-filled"
            v-model="newPOI.description"
            label="Description"
            required
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-btn class="text-none" text @click="closePOIModal">Annuler</v-btn>
          <v-btn class="text-none" color="primary" @click="addPOI"
            >Créer le commerce</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import apiService from "@/services/apiService";
import mapApiService from "@/services/mapApiService";
import { debounce } from "lodash";

export default {
  data() {
    return {
      // Données de l'entreprise récupérées
      company: null,
      // Contrôle de la visibilité du modal d'ajout d'un POI
      showPOIModal: false,
      // Informations du nouveau POI à ajouter
      newPOI: {
        name: "",
        address: "",
        description: "",
        lat: null,
        lon: null,
        categoryId: null,
        companyId: null
      },
      // Contrôle de la visibilité des suggestions d'adresse
      showAddressSuggestions: false,
      // Liste des options d'adresses trouvées
      addressOptions: [],
      // Liste des catégories pour le POI
      categories: [],
    };
  },
  methods: {
    // Méthode pour revenir à la page précédente
    retourPagePrecedente() {
      this.$router.go(-1);
    },
    // Méthode pour récupérer les détails de l'entreprise depuis l'API
    async fetchCompanyDetails() {
      try {
        // Récupère l'ID de l'entreprise depuis les paramètres de la route
        const companyId = this.$route.params.id;
        // Appelle le service API pour obtenir les détails de l'entreprise
        const company = await apiService.get(`/companies/${companyId}`);
        this.company = company;
      } catch (error) {
        // Gestion des erreurs lors de la récupération des détails de l'entreprise
        console.error(
          "Erreur lors de la récupération des détails de l'entreprise:",
          error
        );
      }
    },
    // Méthode pour fermer le modal d'ajout de POI
    closePOIModal() {
      this.showPOIModal = false;
      // Réinitialise les données du nouveau POI
      this.newPOI = {
        name: "",
        address: "",
        description: "",
        lat: null,
        lon: null,
        categoryId: null,
        companyId: null
      };
      this.addressOptions = [];
      this.showAddressSuggestions = false;
    },
    // Méthode pour ajouter un POI à l'entreprise
    async addPOI() {
      try {
        // Assigne l'ID de l'entreprise au nouveau POI
        this.newPOI.companyId = this.company.id;
        // Appelle le service API pour ajouter le POI
        await apiService.post(`/poi`, this.newPOI);
        // Ferme le modal après ajout
        this.closePOIModal();
        // Recharge les détails de l'entreprise pour inclure le nouveau POI
        await this.fetchCompanyDetails();
      } catch (error) {
        // Gestion des erreurs lors de l'ajout du POI
        console.error("Erreur lors de l'ajout du POI:", error);
      }
    },
    // Méthode pour rechercher des options d'adresses avec debounce
    async searchAddressOptions() {
      const address = this.newPOI.address;
      if (address.length < 3) {
        this.addressOptions = [];
        return;
      }
      try {
        // Appelle le service de recherche d'adresses pour obtenir les options
        const options = await mapApiService.searchLocation(address);
        this.addressOptions = options;
        this.showAddressSuggestions = true;
      } catch (error) {
        // Gestion des erreurs lors de la recherche des adresses
        console.error("Erreur lors de la recherche des adresses:", error);
      }
    },
    // Méthode pour sélectionner une adresse parmi les suggestions
    selectAddress(option) {
      this.newPOI.address = option.label;
      this.newPOI.lat = option.coordinates[1];
      this.newPOI.lon = option.coordinates[0];
      this.showAddressSuggestions = false;
    },
    // Méthode pour récupérer les catégories depuis l'API
    async fetchCategories() {
      try {
        // Appelle le service API pour obtenir la liste des catégories
        const categories = await apiService.get("/categories");
        this.categories = categories;
      } catch (error) {
        // Gestion des erreurs lors de la récupération des catégories
        console.error("Erreur lors de la récupération des catégories:", error);
      }
    },
  },
  async mounted() {
    // Appelle les méthodes pour récupérer les détails de l'entreprise et les catégories après le montage du composant
    await this.fetchCompanyDetails();
    await this.fetchCategories();
  },
  created() {
    // Configure la recherche d'adresses avec un debounce de 500ms pour limiter le nombre de requêtes
    this.debouncedSearchAddressOptions = debounce(
      this.searchAddressOptions,
      500
    );
  },
};
</script>


<style scoped>
.return-button {
  margin-bottom: 20px;
}

.poi-card {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-direction: column;

  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.title {
  display: flex;
    flex-direction: row;
    align-items: baseline;
    justify-content: flex-start;
}

.address-suggestions {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  z-index: 10;
}

.list-element {
  padding: 10px;
  cursor: pointer;
  transition: background 0.3s;
}

.list-element:hover {
  background: #f0f0f0;
}

.header-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.header-title {
  margin: 0;
}

.poi-category {
  margin-left: auto;
}
</style>
