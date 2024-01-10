<template>
    <v-btn @click="doThing">Test</v-btn>
</template>

<script lang="ts" setup>
import { MovieInput } from '@/models';

const movieInputs: MovieInput[] = [
    {
        raw: { 
            pad: 1, 
            x: 2, 
            y: 3
        },
        pad_delta: 3
    },
    {
        raw: { 
            pad: 1, 
            x: 2, 
            y: 3
        },
        pad_delta: 3
    }
]

const doThing = () => { 
    const array = [{ i: 1, j: 3190}, { i: 1, j: 2}];
    console.log(Module.test_function2([{ i: 1, j: 3190}, { i: 1, j: 2}]));
}

</script>