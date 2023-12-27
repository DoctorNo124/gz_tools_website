<template>
    <v-container class="w-75">
        <v-row class="justify-center justify-space-between">
            <v-col class="flex-grow-0" v-for="card in dashboardCards">
                <v-card height="300" width="300" class="d-flex flex-column align-center justify-center text-center" :to="card.path">
                    <v-card-title class="text-h4 mb-5 w-100"><v-icon :icon="card.icon"></v-icon>{{  card.name  }}</v-card-title>
                    <v-container class="h-75">
                        <v-row class="align-center justify-center h-75">
                            <v-col>
                                <v-card-text class="text-h5">{{ card.description }}</v-card-text>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts" setup>
    interface DashboardCard { 
        name: string;
        description: string;
        path: string;
        icon: string;
    }

    const dashboardCards: DashboardCard[] = [
        {
            name: "Concatenate",
            description: "Concatenate two macros into one.",
            path: "/cat",
            icon: "mdi-plus"
        },
        {
            name: "Statistics",
            description: "View stats of a macro",
            path: "/stats",
            icon: "mdi-math-norm"
        },
        {
            name: "Inputs",
            description: "View and edit inputs of a macro",
            path: "/inputs",
            icon: "mdi-gamepad"
        }
    ]
</script>

<style lang="css">
    .v-card-title { 
        background: blue;
        color: white;
    }
</style>