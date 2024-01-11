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
                <v-card v-if="macro">
                    <v-card-title>{{ files[0].name }} Macro Stats</v-card-title>
                    <v-card-text>Number of inputs: {{ macro.n_input }}</v-card-text>
                    <v-card-text>Number of seeds: {{ macro.n_seed }}</v-card-text>
                    <v-card-text>Number of ocarina inputs: {{ macro.n_oca_input }}</v-card-text>
                    <v-card-text>Number of ocarina syncs: {{ macro.n_oca_sync }}</v-card-text>
                    <v-card-text>Number of room loads: {{ macro.n_room_load }}</v-card-text>
                    <v-card-text>Rerecords: {{ macro.rerecords }}</v-card-text>
                    <v-card-text>Last recorded frame: {{ macro.last_recorded_frame }}</v-card-text>
                </v-card>
            </v-col>
            <v-col class="flex-grow-0">
                <h4>Seeds</h4>
                <v-data-table v-if="macro" :items="seeds"></v-data-table>
            </v-col>
        </v-row>
    </v-container>
</template>
  
<script lang="ts" setup>
import { ref } from 'vue';
import { GzMacro } from '@/models'
import { getFileAsGZM } from '@/util/GZMHelpers';
import { computed } from 'vue';


const files = ref<File[]>([]);
const macro = ref<GzMacro>();

const showStats = async () => { 
    macro.value = await getFileAsGZM(files.value[0]);
};

const seeds = computed(() => { 
    if(macro.value) { 
        return macro.value.seeds.map(
            seeds => { 
                return { 
                    "Frame": seeds.frame_idx,
                    "Old Seed": `0x${seeds.old_seed.toString(16)}`,
                    "New Seed": `0x${seeds.new_seed.toString(16)}`
                }
            }
        )
    }
    return [];
});

</script>