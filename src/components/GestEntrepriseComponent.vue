<template>
    <div class="body">
        <div class="container">
            <v-card class="mx-auto pa-12 profil" rounded="lg">
                <v-btn class="ma-5 back-btn" variant="text" @click="retourPagePrecedente" icon="mdi-arrow-left"></v-btn>
                <div class="head">
                    <h1 class="title text-capitalize">
                        {{ currentUser.firstName }} {{ currentUser.name }}
                    </h1>
                </div>

                <!-- Bouton pour ouvrir la modal d'ajout d'entreprise -->
                <v-btn class="ma-5" color="primary" @click="openAddCompanyModal">Ajouter une entreprise</v-btn>

                <div v-if="currentUser.companies.length">
                    <v-expansion-panels>
                        <v-expansion-panel v-for="company in currentUser.companies" :key="company.id">
                            <v-expansion-panel-title>
                                {{ company.name }}
                            </v-expansion-panel-title>
                            <v-expansion-panel-text>
                                <div class="company-info">
                                    <span><strong>Siège social:</strong> {{ company.headOffice }}</span>
                                    <span><strong>SIRET:</strong> {{ company.siret }}</span>
                                </div>

                                <div v-if="company.pois && company.pois.length">
                                    <h3>Points of Interest (POI)</h3>
                                    <ul>
                                        <li v-for="poi in company.pois" :key="poi.id" class="company-info">
                                            <span><strong>Nom:</strong> {{ poi.name }}</span>
                                            <span><strong>Adresse:</strong> {{ poi.address }}</span>
                                            <v-btn class="delete-btn" @click="removePOI(poi.id)">Supprimer</v-btn>
                                        </li>
                                    </ul>
                                </div>
                                <div v-else>
                                    <p>Aucun POI associé à cette entreprise.</p>
                                </div>

                                <!-- Bouton pour ajouter un POI -->
                                <v-btn @click="openAddPOIModal(company.id)">Ajouter un POI</v-btn>
                            </v-expansion-panel-text>
                        </v-expansion-panel>
                    </v-expansion-panels>
                </div>
                <div v-else>
                    <p>Aucune entreprise associée à cet utilisateur.</p>
                </div>
            </v-card>

            <!-- Modal pour ajouter un POI -->
            <v-dialog v-model="showPOIModal" max-width="500px">
                <v-card>
                    <v-card-title>
                        <span class="headline">Ajouter un POI</span>
                    </v-card-title>
                    <v-card-text>
                        <v-text-field v-model="newPOI.name" label="Nom" required></v-text-field>
                        <v-text-field v-model="newPOI.address" label="Adresse" @input="searchAddressOptions"
                            @focus="showAddressSuggestions = true"></v-text-field>
                        <div v-if="showAddressSuggestions && addressOptions.length" class="address-suggestions">
                            <p v-for="option in addressOptions" :key="option.place_id" @click="selectAddress(option)"
                                class="list-element">
                                {{ option.display_name }}
                            </p>
                        </div>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn text @click="closePOIModal">Annuler</v-btn>
                        <v-btn color="primary" @click="addPOI">Ajouter POI</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

            <!-- Modal pour ajouter une entreprise -->
            <v-dialog v-model="showCompanyModal" max-width="500px">
                <v-card>
                    <v-card-title>
                        <span class="headline">Ajouter une entreprise</span>
                    </v-card-title>
                    <v-card-text>
                        <v-text-field v-model="newCompany.name" label="Nom" required></v-text-field>
                        <v-text-field v-model="newCompany.headOffice" label="Siège social" required></v-text-field>
                        <v-text-field v-model="newCompany.siret" label="SIRET" required></v-text-field>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn text @click="closeAddCompanyModal">Annuler</v-btn>
                        <v-btn color="primary" @click="addCompany">Ajouter Entreprise</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import apiService from "@/services/apiService";
import mapApiService from "@/services/mapApiService";

export default {
    data() {
        return {
            showPOIModal: false,
            showCompanyModal: false, // Modal pour ajouter une entreprise
            newPOI: {
                name: '',
                address: '',
                latitude: null,
                longitude: null
            },
            newCompany: {
                name: '',
                headOffice: '',
                siret: ''
            },
            companyIdToAddPOI: null,
            showAddressSuggestions: false,
            addressOptions: []
        };
    },

    methods: {
        retourPagePrecedente() {
            this.$router.go(-1);
        },
        openAddPOIModal(companyId) {
            this.companyIdToAddPOI = companyId;
            this.showPOIModal = true;
            console.log(this.companyIdToAddPOI);
        },
        closePOIModal() {
            this.showPOIModal = false;
            this.newPOI = { name: '', address: '', latitude: null, longitude: null }; // Réinitialisez les champs de saisie
            this.addressOptions = []; // Réinitialisez les options d'adresse
            this.showAddressSuggestions = false;
        },
        async addPOI() {
            try {
                const { name, address, latitude, longitude } = this.newPOI;
                if (name && address && latitude !== null && longitude !== null && this.companyIdToAddPOI) {
                    const poi = {
                        name,
                        address,
                        latitude,
                        longitude,
                        picture: this.newPOI.picture || null, // Ajoutez l'URL de l'image si disponible
                        company: {
                            id: this.companyIdToAddPOI
                        }
                    };
                    console.log(poi);
                    await apiService.post(`/poi`, poi); // Utiliser la route POST appropriée
                    this.closePOIModal();
                    console.log("POI ajouté:", poi);
                    await this.updateCurrentUser(); // Met à jour currentUser après l'ajout du POI
                } else {
                    console.error("Les données du POI sont invalides ou l'identifiant de la compagnie est manquant.");
                }
            } catch (error) {
                console.error("Erreur lors de l'ajout du POI:", error);
            }
        },
        async removePOI(poiId) {
            console.log("POI supprimé:", poiId);
            try {
                await apiService.delete(`/poi/${poiId}`);
                await this.updateCurrentUser(); // Met à jour currentUser après la suppression du POI
            } catch (error) {
                console.error("Erreur lors de la suppression du POI:", error);
            }
        },
        async searchAddressOptions() {
            const address = this.newPOI.address;
            if (address.length < 3) {
                this.addressOptions = [];
                return;
            }
            try {
                const options = await mapApiService.searchLocation(address);
                this.addressOptions = options;
                this.showAddressSuggestions = true;
            } catch (error) {
                console.error("Erreur lors de la recherche des adresses:", error);
            }
        },
        selectAddress(option) {
            this.newPOI.address = option.display_name;
            this.newPOI.latitude = option.lat; // Stocker la latitude
            this.newPOI.longitude = option.lon; // Stocker la longitude
            this.addressOptions = [];
            this.showAddressSuggestions = false;

            // Afficher les données liées à l'adresse sélectionnée dans la console
            console.log("Adresse sélectionnée :", option);
            console.log("latitude:", option.lat);
            console.log("longitude:", option.lon);
        },
        async updateCurrentUser() {
            try {
                const updatedUser = await apiService.get(`/users/${this.currentUser.uId}`); // Remplacez `/users/${this.currentUser.uId}` par la route correcte
                this.$store.commit("setUser", updatedUser); // Met à jour currentUser dans le store Vuex
                console.log("currentUser mis à jour :", updatedUser);
            } catch (error) {
                console.error("Erreur lors de la mise à jour de currentUser:", error);
            }
        },
        openAddCompanyModal() {
            this.showCompanyModal = true;
            console.log(this.currentUser)
        },
        closeAddCompanyModal() {
            this.showCompanyModal = false;
            this.newCompany = { name: '', headOffice: '', siret: '' }; // Réinitialiser les champs
        },
        async addCompany() {
            try {
                const { name, headOffice, siret } = this.newCompany;
                if (name && headOffice && siret && this.currentUser.id) {
                    const company = {
                        name,
                        headOffice,
                        siret,
                        user: {
                            id: this.currentUser.id // Utilisez userId pour correspondre au DTO modifié
                        }
                       
                    };

                    console.log(company);
                    await apiService.post(`/companies`, company); // Utiliser la route POST appropriée
                    this.closeAddCompanyModal();
                    console.log("Entreprise ajoutée:", company);
                    await this.updateCurrentUser(); // Met à jour currentUser après l'ajout de l'entreprise
                } else {
                    console.error("Les données de l'entreprise sont invalides.");
                }
            } catch (error) {
                console.error("Erreur lors de l'ajout de l'entreprise:", error);
            }
        }
    },
    computed: {
        ...mapGetters({
            currentUser: "getUser",
        }),
    },
};
</script>

<style scoped>
html {
    overflow-y: hidden;
}

.back-btn {
    top: 0;
    position: absolute;
}

.body {
    background: linear-gradient(115deg, #4faaf5 0%, #1f30c9 100%) !important;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
}

.container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-content: center;
    align-items: center;
    height: 70vh;
    /* flex-direction: column; */
    border-radius: 8px !important;
    overflow: hidden;
    background-color: #f9f9f9;
}

.category>div {
    padding: 0 0.5rem;
    gap: 0.25rem;
    align-items: center;
}

.flex {
    display: flex;
    justify-content: center;
}

.profil {
    height: 100%;
    z-index: 10;
    padding: 0 !important;
    transition: max-width 0.5s ease;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 35vw;
    box-shadow: 0px 5px 5px -3px var(--v-shadow-key-umbra-opacity, rgba(0, 0, 0, 0.2)),
        0px 8px 10px 1px var(--v-shadow-key-penumbra-opacity, rgba(0, 0, 0, 0.14)),
        0px 3px 14px 2px var(--v-shadow-key-ambient-opacity, rgba(0, 0, 0, 0.12)) !important;
}

.categories {
    height: 100%;
    width: 0vw;
    box-shadow: none !important;
    z-index: 1;
    transition: width 0.5s ease;
}

.categories-expanded {
    background-color: #f9f9f9;
    width: 35vw !important;
}

.scrollable-categories {
    overflow-y: auto;
    overflow-x: hidden;
}

.category {
    cursor: pointer;
    color: white;
    background: linear-gradient(115deg, #4faaf5 0%, #1f30c9 100%) !important;
    align-content: stretch;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    flex-direction: column;
}

.category:hover {
    transition: 0.3s ease;
    opacity: 0.8;
}

.hobbies {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.5s ease, padding 0.5s ease;
}

.hobbies.show {
    border-top: 0.5px white solid;
    max-height: 500px;
    /* Vous pouvez ajuster cette valeur en fonction de la hauteur maximale que vos hobbies peuvent atteindre */
    padding: 10px;
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

.company-info {
    display: flex;
    gap: 15px;
    /* Espace entre les éléments */
    justify-content: flex-start;
    align-items: center;
}

.address-suggestions {
    border: 1px solid #ccc;
    /* Bordure autour des suggestions */
    border-radius: 4px;
    background: #fff;
    max-height: 200px;
    /* Hauteur maximale pour faire défiler si nécessaire */
    overflow-y: auto;
    margin-top: 10px;
}

.list-element {
    padding: 10px;
    cursor: pointer;
    border-bottom: 1px solid #eee;
    /* Bordure entre les éléments */
}

.list-element:hover {
    background-color: #f0f0f0;
}

.delete-btn {
    background-color: #be605e !important;
    /* Rouge clair */
    color: #ffffff;
    /* Couleur du texte */
    font-size: 10px;
    /* Plus petit */
    padding: 4px 4px;
    /* Ajuster la taille du bouton */
    min-width: 0px;
    /* Empêche le bouton d'avoir une largeur minimale par défaut */
}

.delete-btn:hover {
    background-color: #ff9999 !important;
    /* Rouge un peu plus foncé lors du survol */
}
</style>
