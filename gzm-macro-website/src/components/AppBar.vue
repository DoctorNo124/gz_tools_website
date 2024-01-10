<template>
  <v-app-bar scroll-behavior="hide" flat>
        <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        <router-link class="app-title-router-link" to="/">
          <v-app-bar-title class="ml-3">
            Gz Macro Website
          </v-app-bar-title>
        </router-link>
    <template v-slot:append>
      <div class="hidden-md-and-down">
        <v-btn to="/cat"><v-icon icon="mdi-plus"></v-icon>Concatenate</v-btn>
        <v-btn to="/stats"><v-icon icon="mdi-math-norm"></v-icon>Statistics</v-btn>
        <v-btn to="/inputs"><v-icon icon="mdi-gamepad"></v-icon>Inputs</v-btn>
        <v-btn to="/trim"><v-icon icon="mdi-content-cut"></v-icon>Trim</v-btn>
        <v-btn to="/slice"><v-icon icon="mdi-knife"></v-icon>Slice</v-btn>
        <v-btn to="/test"><v-icon icon="mdi-knife"></v-icon>Test</v-btn>
      </div>
    </template>
  </v-app-bar>
  <v-navigation-drawer
          v-model="drawer"
          location="bottom"
          temporary
        >
            <v-list
            >
              <v-list-item to="/cat">Concatenate</v-list-item>
              <v-list-item to="/stats">Statistics</v-list-item>
              <v-list-item to="/inputs">Inputs</v-list-item>
              <v-list-item to="/trim">Trim</v-list-item>
              <v-list-item to="/slice">Slice</v-list-item>
          </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

  //
const drawer = ref(false);
</script>

<style lang="css">

.app-title-router-link { 
  text-decoration: none;
}

</style>
