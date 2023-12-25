<template>
    <v-container>
        <v-file-input
            v-model="files"
            :rules="[(v) => v.length != 0 || 'File cannot be empty']"
            clearable
            label="Macro Upload"
            append-inner-icon="mdi-paperclip"
            >
        </v-file-input>
        <v-btn @click="showStats" :disabled="files.length === 0">Show Stats</v-btn>
        <v-row class="justify-center">
            <v-col class="flex-grow-0">
                <v-card v-if="gzMacroWrapper">
                    <v-card-title>{{ files[0].name }} Macro Stats</v-card-title>
                    <v-card-text>Number of inputs: {{ gzMacroWrapper.macro.n_input }}</v-card-text>
                    <v-card-text>Number of seeds: {{ gzMacroWrapper.macro.n_seed }}</v-card-text>
                    <v-card-text>Number of ocarina inputs: {{ gzMacroWrapper.macro.n_oca_input }}</v-card-text>
                    <v-card-text>Number of ocarina syncs: {{ gzMacroWrapper.macro.n_oca_sync }}</v-card-text>
                    <v-card-text>Number of room loads: {{ gzMacroWrapper.macro.n_room_load }}</v-card-text>
                    <v-card-text>Rerecords: {{ gzMacroWrapper.macro.rerecords }}</v-card-text>
                    <v-card-text>Last recorded frame: {{ gzMacroWrapper.macro.last_recorded_frame }}</v-card-text>
                </v-card>
            </v-col>
            <v-col class="flex-grow-0">
                <h4>Seeds</h4>
                <v-data-table v-if="gzMacroWrapper" :items="gzMacroWrapper.seeds"></v-data-table>
            </v-col>
        </v-row>
    </v-container>
</template>
  
<script lang="ts" setup>
import { ref } from 'vue';
import { fileToBase64 } from 'file64';
import { GzMacroWrapper } from '@/models'
import axios from 'axios';

const files = ref<File[]>([]);
const gzMacroWrapper = ref<GzMacroWrapper>();

const showStats = async () => { 
    const base64 = (await fileToBase64(files.value[0])).split('base64,')[1];
    const axiosResponse = (await axios.post<GzMacroWrapper>(import.meta.env.VITE_API_URL + '/GzMacro/stats', { base64: base64 }));
    gzMacroWrapper.value = axiosResponse.data;
};

</script>