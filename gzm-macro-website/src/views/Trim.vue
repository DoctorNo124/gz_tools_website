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
        <v-text-field type="number" label="End" v-model="end"></v-text-field>
        <v-text-field v-model="filename" label="Output Filename" >
        </v-text-field>
        <v-btn @click="trimMacro" :disabled="files.length === 0 || !end || !filename || filename === ''">Trim Macro</v-btn>
    </v-container>
</template>
  
<script lang="ts" setup>
import { ref } from 'vue';
import { fileToBase64 } from 'file64';
import axios from 'axios';

const files = ref<File[]>([]);
const end = ref<number>();
const filename = ref<string>();

const trimMacro = async () => { 
    const base64 = (await fileToBase64(files.value[0])).split('base64,')[1];
    const blob = (await axios.post(import.meta.env.VITE_API_URL + '/GzMacro/trim', { base64: base64, end: end.value }, { responseType: 'blob'})).data;
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl; 
    if(filename.value ) { 
        link.download = filename.value;
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

</script>