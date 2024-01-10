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
import { Wasi } from '@/assets/wasi';

const files = ref<File[]>([]);
const end = ref<number>();
const filename = ref<string>();

const wasi = new Wasi({
    __memory_base: 0,
    __table_base: 0,
    memory: new WebAssembly.Memory({initial: 1})
  }, "stdio", [])
const trimMacro = async () => { 
    const { instance } = await WebAssembly.instantiateStreaming(fetch("pleasework.wasm"), { wasi_snapshot_preview1: wasi
} as any);

    // eslint-disable-next-line
    const api = {
        trim_gzmacro: Module.cwrap("_Z12trim_gzmacroPhmj", "number", ["number", "number", "number"])
    }
    debugger;
    const buffer = await files.value[0].arrayBuffer();
    const bytes = new Uint8Array(buffer);
    var heapSpace = Module._malloc(bytes.length, bytes.BYTES_PER_ELEMENT);
    Module.HEAP8.set(bytes, heapSpace)
    const n_bytes = Module.__Z21get_trim_gzmacro_sizePhmj(heapSpace, bytes.length, end.value)
    const newBytesPtr = Module.__Z27get_trim_gzmacro_size_bytesPhmj(heapSpace, bytes.length, end.value)
    const newArray = Module.HEAPU8.subarray(newBytesPtr, newBytesPtr + n_bytes)
    const blob = new Blob([newArray]);
    download(blob, filename.value ?? 'test.gzm', 'application/octet-stream')
};

</script>