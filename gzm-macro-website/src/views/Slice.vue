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
        <v-text-field type="number" label="Frame Start" v-model="frameStart"></v-text-field>
        <v-text-field type="number" label="Frame End" v-model="frameEnd"></v-text-field>
        <v-text-field v-model="filename" label="Output Filename" >
        </v-text-field>
        <v-btn @click="sliceMacro" :disabled="files.length === 0 || !frameStart || !frameEnd || !filename || filename === ''">Slice Macro</v-btn>
    </v-container>
</template>
  
<script lang="ts" setup>
import { ref } from 'vue';
import { fileToBase64 } from 'file64';
import download from 'downloadjs';

const files = ref<File[]>([]);
const frameStart = ref<number>();
const frameEnd = ref<number>();
const filename = ref<string>();

const sliceMacro = async () => { 
    const base64 = (await fileToBase64(files.value[0])).split('base64,')[1];
    const response = (await fetch(import.meta.env.VITE_API_URL + '/GzMacro/slice', 
    { 
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ base64: base64, frameStart: frameStart.value, frameEnd: frameEnd.value }),
    }));
    const blob = await response.blob();
    download(blob, filename.value ?? 'test.gzm', 'application/octet-stream');
};

</script>