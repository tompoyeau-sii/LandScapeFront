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
    >
    </v-data-table>
  </v-card>
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
      headers: [
        { title: "Nom", align: "start", key: "name" },
        { title: "Prenom", align: "start", key: "firstName" },
        { title: "Date de naissance", align: "start", key: "birthdate" },
        { title: "Droit", align: "start", key: "right.label" },
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
    async updateUserRight(user) {
      try {
        const selectedRight = this.rights.find(right => right.label === user.right.label);
        if (selectedRight) {
          const updatedUser = { ...user, right: { id: selectedRight.id, label: selectedRight.label } };
          await apiService.put(`/users/${user.id}`, updatedUser);
          console.log("Droit mis à jour pour l'utilisateur:", user);
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour des droits:", error);
      }
    },
  },
};
</script>

<style>
</style>
