<template>
  <v-dialog max-width="500">
    <template v-slot:activator="{ props: activatorProps }">
      <v-btn icon="fa-user" v-bind="activatorProps" class="account-button">
        <i :class="{ fas: true, 'fa-user': true }"></i>
      </v-btn>
    </template>

    <template v-slot:default="{ isActive }">
      <v-card class="mx-auto pa-12 pb-3" elevation="8" width="480" rounded="lg">
        <h2 class="pb-4 text-center">WecanScape | Connexion</h2>
        <div class="text-subtitle-1 text-medium-emphasis">Adresse mail</div>

        <v-text-field
          density="compact"
          placeholder="Adresse mail"
          prepend-inner-icon="mdi-email-outline"
          variant="outlined"
        ></v-text-field>

        <div
          class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between"
        >
          Mot de passe

          <a
            class="text-caption text-decoration-none text-blue"
            href="#"
            rel="noopener noreferrer"
            target="_blank"
          >
            Mot de passse oublié ?
          </a>
        </div>

        <v-text-field
          :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
          :type="visible ? 'text' : 'password'"
          density="compact"
          placeholder="Mot de passe"
          prepend-inner-icon="mdi-lock-outline"
          variant="outlined"
          @click:append-inner="visible = !visible"
        ></v-text-field>

        <v-btn
          class="mb-2"
          color="blue"
          size="large"
          variant="tonal"
          block
          @click="isActive.value = false"
        >
          Me connecter
        </v-btn>

        <v-card-text class="text-center">
          <a
            class="text-blue text-decoration-none"
            href="#"
            rel="noopener noreferrer"
            target="_blank"
          >
            Créez votre compte ici <v-icon icon="mdi-chevron-right"></v-icon>
          </a>
        </v-card-text>
      </v-card>
    </template>
  </v-dialog>
</template>

<script>
export default {
  data: () => ({
    visible: false,
  }),
};
</script>

<style>
.account-button {
  right: 0px;
  position: absolute;
  margin: 1%;
  z-index: 2;
}
</style>