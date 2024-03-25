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
        <v-btn @click="sliceMacro" :disabled="files.length === 0 || !frameStart || !frameEnd">Slice Macro</v-btn>
    </v-container>
</template>
  
<script lang="ts" setup>
import { ref } from 'vue';
import download from 'downloadjs';

const files = ref<File[]>([]);
const frameStart = ref<number>();
const frameEnd = ref<number>();
const filename = ref<string>('macro');

const sliceMacro = async () => { 
    const buffer = await files.value[0].arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const bytesVector = Module.slice_gzmacro(bytes, bytes.length, Number(frameStart.value), Number(frameEnd.value));
    const newArray = new Uint8Array(bytesVector.size()).fill(0).map((_, id) => bytesVector.get(id));
    const blob = new Blob([newArray]);
    download(blob, filename.value !== '' ? (filename.value + '.gzm') : 'macro.gzm', 'application/octet-stream');
};

</script>