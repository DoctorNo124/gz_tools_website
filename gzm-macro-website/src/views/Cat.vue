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
import { ref } from 'vue';
import download from 'downloadjs';

const files = ref<File[]>([]);
const files2= ref<File[]>([]);
const filename = ref<string>();

const concatenate = async () => { 
  const buffer = await files.value[0].arrayBuffer();
  const bytes = new Uint8Array(buffer);

  const buffer2 = await files2.value[0].arrayBuffer();
  const bytes2 = new Uint8Array(buffer2);

  const bytesVector = Module.cat_gzmacro(bytes, bytes.length, bytes2, bytes2.length);
  const newArray = new Uint8Array(bytesVector.size()).fill(0).map((_, id) => bytesVector.get(id));
  const blob = new Blob([newArray]);
  download(blob, filename.value ?? 'test.gzm', 'application/octet-stream')
}

</script>