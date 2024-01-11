<template>
    <v-data-table v-if="inputs.length > 0" :headers="headers" :items-per-page="itemsPerPage">
        <template #body>
            <tr v-for="(item, index) in arrayChunkedInputs[page - 1]">
                <td><v-btn @click="addItem(item, getActualIndex(index))"><v-icon icon="mdi-plus"></v-icon></v-btn></td>
                <td>{{ getActualIndex(index) }}</td>
                <template v-if="item.isEditable">
                    <td><v-text-field type="number" v-model="item.x"></v-text-field> </td>
                    <td><v-text-field type="number" v-model="item.y"></v-text-field> </td>
                    <td><v-text-field :rules="[(value: string) => isNaN(Number(value)) ? 'Value must be valid bit string': '']" v-model="item.bitPadDelta"></v-text-field></td>
                </template>
                <template v-else>
                    <td> {{ item.x }}</td>
                    <td> {{ item.y }}</td>
                    <td> {{ item.padDelta }}</td>
                </template>
                <td v-for="(button) in item.inputButtons" :key="item.frameIndex + '_' + button.buttonType">
                    <v-checkbox v-model="button.isButtonPressed" :disabled="!item.isEditable"></v-checkbox>
                </td>
                <td v-if="showActions">
                    <template v-if="item.isEditable">
                        <v-icon
                        size="small"
                        class="me-2"
                        @click="saveItem(item, getActualIndex(index))"
                        >
                            mdi-content-save
                        </v-icon>
                        <v-icon
                        size="small"
                        class="me-2"
                        @click="cancelItem(item, getActualIndex(index))"
                        >
                            mdi-cancel
                        </v-icon>
                    </template>
                    <template v-else>
                        <v-icon
                        size="small"
                        class="me-2"
                        @click="editItem(item)"
                        >
                            mdi-pencil
                        </v-icon>
                        <v-icon
                            size="small"
                            @click="deleteItem(item, getActualIndex(index))"
                        >
                            mdi-delete
                            </v-icon>
                    </template>
                </td>
            </tr>
        </template>
        <template v-slot:top>
            <v-container class="text-center pt-2">
                <v-row>
                    <slot name="toolbar"></slot>
                    <v-col>
                        <v-pagination
                        v-model="page"
                        :length="pageCount"
                        :total-visible="10"
                        ></v-pagination>
                    </v-col>
                    <v-col>
                        <v-text-field
                            v-model="page"
                            class="pa-2"
                            hide-details
                            label="Jump to page"
                            min="1"
                            :max="pageCount"
                            type="number"
                        ></v-text-field>
                    </v-col>
                    <v-col>
                        <v-text-field
                            :model-value="itemsPerPage"
                            class="pa-2"
                            hide-details
                            label="Items per page"
                            min="1"
                            max="1000"
                            type="number"
                            @update:model-value="itemsPerPage = parseInt($event, 10)"
                        ></v-text-field>
                    </v-col>
                </v-row>
            </v-container>
        </template>
        <template v-slot:bottom>
            <v-container class="text-center pt-2">
                <v-row>
                    <v-col>
                        <v-pagination
                        v-model="page"
                        :length="pageCount"
                        :total-visible="20"
                        ></v-pagination>
                    </v-col>
                    <v-col>
                        <v-text-field
                            v-model="page"
                            class="pa-2"
                            hide-details
                            label="Jump to page"
                            min="1"
                            :max="pageCount"
                            type="number"
                        ></v-text-field>
                    </v-col>
                    <v-col>
                        <v-text-field
                            :model-value="itemsPerPage"
                            class="pa-2"
                            hide-details
                            label="Items per page"
                            min="1"
                            max="1000"
                            type="number"
                            @update:model-value="itemsPerPage = parseInt($event, 10)"
                        ></v-text-field>
                    </v-col>
                </v-row>
            </v-container>
        </template>
    </v-data-table>
</template>

<script lang="ts" setup>
import { InputWrapper } from '@/models';
import { computed, ref } from 'vue';

const page = ref(1);
const itemsPerPage = ref(10)
const pageCount = computed(() => { 
    return Math.ceil(props.inputs.length / itemsPerPage.value);
});

const props = defineProps<{
    inputs: InputWrapper[], 
    headers: any[], 
    showActions?: boolean,
}>();

const emits = defineEmits(["edit-item", "delete-item", "add-item", "save-item", "cancel-item"]);

const editItem = (item: InputWrapper) => { 
    emits("edit-item", item);
}

const deleteItem = (item: InputWrapper, index: number) => { 
    emits("delete-item", item, index);
}

const addItem = (item: InputWrapper, index: number) => { 
    emits("add-item", item, index);
}

const saveItem = (item: InputWrapper, index: number) => { 
    emits("save-item", item, index);
}

const cancelItem = (item: InputWrapper, index: number) => { 
    emits("cancel-item", item, index);
}

const getActualIndex = (index: number): number => { 
    return (page.value - 1)*itemsPerPage.value + index 
}

const arrayChunkedInputs = computed(() => { 
    const chunkedArray: InputWrapper[][] = [];
    for(let i = 0; i < pageCount.value; i++) { 
        const chunk = [];
        for(let j = 0; j < itemsPerPage.value; j++) { 
            const item = props.inputs[i * itemsPerPage.value + j];
            if(item) { 
                chunk.push(item);
            }
        }
        chunkedArray.push(chunk);
    }
    return chunkedArray;
});

</script>