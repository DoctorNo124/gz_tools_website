<template>
    <v-data-table v-if="inputs.length > 0" :items="inputs" :headers="headers">
        <template v-slot:item="{ item }">
            <tr>
                <td> {{  item.frameIndex  }}</td>
                <td v-for="(button) in item.inputButtons" :key="item.frameIndex + '_' + button.buttonType">
                    <template v-if="button.isButtonPressed">
                        <v-chip color="green">                    
                            {{  button.isButtonPressed }}
                        </v-chip>
                    </template>
                    <template v-else>
                        {{  button.isButtonPressed }}
                    </template>
                </td>
                <td> {{ item.x }}</td>
                <td> {{ item.y }}</td>
                <td> {{ item.padDelta }}</td>
                <td v-if="showActions">
                    <v-icon
                    size="small"
                    class="me-2"
                    @click="editItem(item)"
                    >
                        mdi-pencil
                    </v-icon>
                    <v-icon
                        size="small"
                        @click="deleteItem(item)"
                    >
                        mdi-delete
                        </v-icon>
                </td>
            </tr>
        </template>
    </v-data-table>

</template>

<script lang="ts" setup>
import { InputWrapper } from '@/models';


const props = defineProps<{
    inputs: InputWrapper[], 
    headers: any[], 
    showActions?: boolean,
}>();

const emits = defineEmits(["edit-item", "delete-item"]);

const editItem = (item: InputWrapper) => { 
    emits("edit-item", item);
}

const deleteItem = (item: InputWrapper) => { 
    emits("delete-item", item);
}

</script>