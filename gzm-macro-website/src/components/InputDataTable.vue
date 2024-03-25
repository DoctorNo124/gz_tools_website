<template>
    <v-data-table v-if="inputs.length > 0" :headers="headers" :items-per-page="itemsPerPage">
        <template #body>
            <tr v-for="(item, index) in arrayChunkedInputs[page - 1]">
                <td><v-btn @click="addItem(item, getActualIndex(index))"><v-icon icon="mdi-plus"></v-icon></v-btn></td>
                <td>{{ getActualIndex(index) }}</td>
                <td contenteditable="true" @input="event => editItemX(item, getActualIndex(index), event)"> {{ item.xStr }}</td>
                <td contenteditable="true" @input="event => editItemY(item, getActualIndex(index), event)"> {{ item.yStr }}</td>
                <td contenteditable="true" @input="event => editItemPadDelta(item, getActualIndex(index), event)"> {{ item.padDeltaStr }}</td>
                <td v-for="(button) in item.inputButtons" :key="item.frameIndex + '_' + button.buttonType">
                    <v-checkbox v-model="button.isButtonPressed" @update:modelValue = "event => editItemCheckbox(item, getActualIndex(index))"></v-checkbox>
                </td>
                <td v-if="showActions">
                        <v-icon
                            size="small"
                            @click="deleteItem(item, getActualIndex(index))"
                        >
                            mdi-delete
                        </v-icon>
                        <v-icon
                            size="small"
                            @click="cloneItem(item, getActualIndex(index))"
                        >
                            mdi-content-copy
                        </v-icon>
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
import { computed, onMounted, ref } from 'vue';

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

const emits = defineEmits(["edit-item", "delete-item", "add-item", "clone-item"]);

const deleteItem = (item: InputWrapper, index: number) => { 
    emits("delete-item", item, index);
}

const addItem = (item: InputWrapper, index: number) => { 
    emits("add-item", item, index);
}

const editItemX = (item: InputWrapper, index: number, event: Event) => { 
    item.xStr = (event.target as HTMLTableCellElement).innerHTML;
    emits("edit-item", item, index);
}

const editItemY = (item: InputWrapper, index: number, event: Event) => { 
    item.yStr = (event.target as HTMLTableCellElement).innerHTML;
    emits("edit-item", item, index);
}

const editItemPadDelta = (item: InputWrapper, index: number, event: Event) => { 
    item.padDeltaStr = (event.target as HTMLTableCellElement).innerHTML;
    emits("edit-item", item, index);
}

const cloneItem = (item: InputWrapper, index: number) => { 
    emits("clone-item", item, index);
}

const editItemCheckbox = (item: InputWrapper, index: number) => { 
    emits("edit-item", item, index);
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