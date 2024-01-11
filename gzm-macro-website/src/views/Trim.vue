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
import download from 'downloadjs';

const files = ref<File[]>([]);
const end = ref<number>();
const filename = ref<string>();

const trimMacro = async () => { 
    // eslint-disable-next-line
    const buffer = await files.value[0].arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const bytesVector = Module.trim_gzmacro(bytes, bytes.length, Number(end.value));
    const newArray = new Uint8Array(bytesVector.size()).fill(0).map((_, id) => bytesVector.get(id));
    const blob = new Blob([newArray]);
    download(blob, filename.value ?? 'test.gzm', 'application/octet-stream')
};

</script>