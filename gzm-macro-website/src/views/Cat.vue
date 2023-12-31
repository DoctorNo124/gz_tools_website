<template>
  <v-container>
      <v-file-input
          v-model="files"
          :rules="[(v) => v.length != 0 || 'File cannot be empty']"
          clearable
          label="Macro 1"
          append-inner-icon="mdi-paperclip"
          >
      </v-file-input>
      <v-file-input
          v-model="files2"
          :rules="[(v) => v.length != 0 || 'File cannot be empty']"
          clearable
          label="Macro 2"
          append-inner-icon="mdi-paperclip"
          >
      </v-file-input>
      <v-text-field v-model="filename" label="Output Filename" >
      </v-text-field>
      <v-btn @click="concatenate" :disabled="files.length === 0 || files2.length === 0 || !filename || filename === ''">Concatenate</v-btn>
  </v-container>
</template>
  
<script lang="ts" setup>
import { fileToBase64 } from 'file64';
import { ref } from 'vue';
import download from 'downloadjs';

const files = ref<File[]>([]);
const files2= ref<File[]>([]);
const filename = ref<string>();

const concatenate = async () => { 
  const base64_1 = (await fileToBase64(files.value[0])).split('base64,')[1];
  const base64_2 = (await fileToBase64(files2.value[0])).split('base64,')[1];
  const response = (await fetch(import.meta.env.VITE_API_URL + '/GzMacro/cat', 
  {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ gzm1Base64: base64_1, gzm2Base64: base64_2 })
  }));
  const blob = await response.blob();
  download(blob, filename.value ?? 'test.gzm', 'application/octet-stream');
}

</script>