<template>
  <v-app-bar flat>
    <router-link class="app-title-router-link" to="/">
      <v-app-bar-title>
        Gz Macro Website
      </v-app-bar-title>
   </router-link>
    <template v-slot:append>
        <v-btn to="/cat"><v-icon icon="mdi-plus"></v-icon>Concatenate</v-btn>
        <v-btn to="/stats"><v-icon icon="mdi-math-norm"></v-icon>Statistics</v-btn>
        <v-btn to="/inputs"><v-icon icon="mdi-gamepad"></v-icon>Inputs</v-btn>
        <v-btn to="/trim"><v-icon icon="mdi-content-cut"></v-icon>Trim</v-btn>
        <v-btn to="/slice"><v-icon icon="mdi-knife"></v-icon>Slice</v-btn>
    </template>
  </v-app-bar>
</template>

<script lang="ts" setup>
  //
</script>

<style lang="css">

.app-title-router-link { 
  text-decoration: none;
}

</style>
