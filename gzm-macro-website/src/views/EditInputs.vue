<template>
    <v-container>
        <v-row :class="{ 'mt-10': gzMacroWrapper}">
            <v-file-input
                v-model="files"
                :rules="[(v) => v.length != 0 || 'File cannot be empty']"
                clearable
                label="Macro Upload"
                append-inner-icon="mdi-paperclip"
                @update:model-value="(files) => getMacroFromFile(files)"
                >
            </v-file-input>
        </v-row>
        <v-row>
            <input-data-table :inputs="inputs" :headers="headers" :showActions="true" @edit-item="modifyInput" @add-item="addInput" @delete-item="deleteItem" @save-item="saveItem" @cancel-item="cancelItem">
                <template #toolbar>
                    <v-col>
                        <v-btn @click="openAddDialog" class="mr-5">Add Input</v-btn>
                    </v-col>
                    <v-col>
                        <v-btn @click="downloadNewFile" class="mr-5" :disabled="!base64">Download File</v-btn>
                    </v-col>
                    <v-col>
                        <v-btn @click="showChangesDialog = true">Show Changes</v-btn>
                    </v-col>
                </template>
            </input-data-table>
        </v-row>
        <v-dialog v-model="showChangesDialog">
            <v-card>
                <v-card-title>Additions</v-card-title>
                <input-data-table class="mb-5" :inputs="addInputs" :headers="headers"></input-data-table>
                <v-card-title>Modifications</v-card-title>
                <input-data-table class="mb-5" :inputs="modifyInputs" :headers="headers"></input-data-table>
                <v-card-title>Deletions</v-card-title>
                <v-list :items="deleteInputs" class="mb-5"></v-list>
                <v-btn @click="showChangesDialog = false">Close</v-btn>
            </v-card>
        </v-dialog>
        <v-dialog v-if="inputWrapperToAdd" v-model ="showAddDialog">
           <v-card>
                <v-card-title>Add Input</v-card-title>
                <div class="pl-5 pr-5 pt-5 pb-5">
                    <v-checkbox v-for="(inputButton, index) in inputWrapperToAdd.inputButtons" :key="inputButton.buttonType" v-model="inputButton.isButtonPressed" :label="inputKeys[index]">
                    </v-checkbox>
                    <v-text-field type="number" v-model="inputWrapperToAdd.x" label="Analog X"></v-text-field>
                    <v-text-field type="number" v-model="inputWrapperToAdd.y" label="Analog Y"></v-text-field>
                    <v-text-field type="number" v-model="inputWrapperToAdd.padDelta" label="Pad Delta"></v-text-field>
                    <v-btn class="mr-5" @click="addInputFromDialog">Submit</v-btn>
                    <v-btn @click="closeAddDialog">Close</v-btn>
                </div>
            </v-card>
        </v-dialog>
    </v-container>
</template>
  
<script lang="ts" setup>
import { ref } from 'vue';
import { fileToBase64 } from 'file64';
import { GzMacroWrapper, InputButtonType, InputButtons, InputWrapper } from '@/models'
import axios from 'axios';
import { cloneDeep } from 'lodash';
import InputDataTable from '@/components/InputDataTable.vue';
import { v4 as uuidv4 } from 'uuid';
import download from 'downloadjs';

const files = ref<File[]>([]);
const gzMacroWrapper = ref<GzMacroWrapper>();
const inputs = ref<InputWrapper[]>([]);
const addInputs = ref<InputWrapper[]>([]);
const deleteInputs = ref<number[]>([]);
const modifyInputs = ref<InputWrapper[]>([]);
const originalModifyInputs = ref<InputWrapper[]>([]);
const inputKeys = Object.keys(InputButtonType).filter((v) => isNaN(Number(v)));
const inputValues = Object.values(InputButtonType).filter((v) => !isNaN(Number(v))).sort((a, b) => Number(b) - Number(a));
const base64 = ref<string>();

const inputButtons: InputButtons[] = [];
inputKeys.forEach((key => { 
    inputButtons.push({
        isButtonPressed: false, 
        buttonType: InputButtonType[key as keyof typeof InputButtonType]
    })
}));
const initialInputWrapper: InputWrapper =  {
    id: '',
    frameIndex: 0, 
    x: 0, 
    y: 0, 
    padDelta: 0, 
    inputButtons: inputButtons, 
    isEditable: true,
    isAdded: true,
};


const addInput = (item: InputWrapper, index: number) => { 
    const inputWrapperToAdd = cloneDeep(initialInputWrapper);
    inputWrapperToAdd.id = uuidv4();
    if(item.isAdded && item.addOrder) { 
        inputWrapperToAdd.addOrder = item.addOrder + 1;
    }
    else { 
        inputWrapperToAdd.addOrder = 1;
    }
    inputWrapperToAdd.frameIndex = index + 1;
    inputs.value.splice(inputWrapperToAdd.frameIndex, 0, inputWrapperToAdd);
}

const showAddDialog = ref(false);
const inputWrapperToAdd = ref<InputWrapper>();
 
const openAddDialog = () => { 
    showAddDialog.value = true;
    inputWrapperToAdd.value = cloneDeep(initialInputWrapper);
    inputWrapperToAdd.value.frameIndex = inputs.value.length;
}

const closeAddDialog = () => { 
    showAddDialog.value = false; 
    inputWrapperToAdd.value = undefined;
}
const addInputFromDialog = () => { 
    if(inputWrapperToAdd.value) { 
        addInputs.value.push(inputWrapperToAdd.value);
        inputs.value.push(inputWrapperToAdd.value);
        closeAddDialog();
    }
}

const modifyInput = (item: InputWrapper) => { 
    item.isEditable = true;
    const originalModifyInput = cloneDeep(item);
    originalModifyInputs.value.push(originalModifyInput);
    if(item.isAdded) { 
        item.isEditingAdd = true;
    }
}

const saveItem = (item: InputWrapper) => { 
    if(item.bitPadDelta) { 
        item.padDelta = parseInt(item.bitPadDelta, 2);
    }
    item.isEditable = false;
    if(item.isAdded && item.addOrder) {
        if(item.isEditingAdd) { 
            const matchingAddedInputIndex = addInputs.value.findIndex((addInput) => addInput.id === item.id);
            if(matchingAddedInputIndex !== -1) { 
                addInputs.value[matchingAddedInputIndex] = cloneDeep(item);
            }
        }
        else { 
            const inputToAdd = cloneDeep(item);
            if(inputToAdd.frameIndex) { 
                inputToAdd.frameIndex -= item.addOrder;
            }
            addInputs.value.push(inputToAdd);
        }
    }
    else { 
        const index = modifyInputs.value.findIndex((input) => input.id === item.id);
        if(index !== -1) { 
            modifyInputs.value[index] = item;
        }
        else { 
            modifyInputs.value.push(cloneDeep(item));
        }
        const originalModifyInputIndex = originalModifyInputs.value.findIndex((input) => input.id === item.id);
        originalModifyInputs.value.splice(originalModifyInputIndex, 1);
    }
    item.isEditable = false;
}

const cancelItem = (item: InputWrapper, index: number) => { 
    if(item.isAdded) { 
        inputs.value.splice(index, 1);
    }
    else { 
        const modifyIndex = inputs.value.findIndex((input) => input.id === item.id);
        let matchingOriginalModifyInputIndex = -1;
        let matchingOriginalModifyInput: InputWrapper | undefined= undefined;
        for(let i = 0; i < originalModifyInputs.value.length; i++) { 
            const originalModifyInput = originalModifyInputs.value[i];
            if(originalModifyInput.frameIndex === item.frameIndex) { 
                matchingOriginalModifyInputIndex = i;
                matchingOriginalModifyInput = originalModifyInput;
                break;
            }
        }
        if(matchingOriginalModifyInput) { 
            inputs.value[modifyIndex] = matchingOriginalModifyInput;
            originalModifyInputs.value.splice(matchingOriginalModifyInputIndex, 1);
        }
    }
}

const getMacroFromFile = async (newFiles: File[]) => { 
    base64.value = (await fileToBase64(newFiles[0])).split('base64,')[1];
    await getMacro();
};

const getMacro = async () => { 
    addInputs.value = [];
    deleteInputs.value = []; 
    modifyInputs.value = [];
    inputs.value = [];
    const axiosResponse = (await axios.post<GzMacroWrapper>(import.meta.env.VITE_API_URL + '/GzMacro/stats', { base64: base64.value }));
    gzMacroWrapper.value = axiosResponse.data;
    populateInputs();
}

const populateInputs = () => { 
    gzMacroWrapper.value?.inputs.forEach((input, index) => { 
        const inputButtons: InputButtons[] = [];
        const pad = input.raw.pad;
        inputValues.forEach((value, index) => { 
            const key = inputKeys[index];
            if((pad >> Number(value)) & 1) {
                inputButtons.push({
                    isButtonPressed: true, 
                    buttonType: InputButtonType[key as keyof typeof InputButtonType],
                });
            }
            else { 
                inputButtons.push({
                    isButtonPressed: false, 
                    buttonType: InputButtonType[key as keyof typeof InputButtonType],
                });
            }
        });
        inputs.value.push({
            id: uuidv4(),
            inputButtons: inputButtons, 
            frameIndex: index,
            x: input.raw.x,
            y: input.raw.y, 
            padDelta: input.pad_delta,
            isEditable: false,
        })
    });
}

const deleteItem = (item: InputWrapper, index: number) => { 
    inputs.value.splice(index, 1);
    if(item.isAdded) { 
        const matchingAddInputsIndex = addInputs.value.findIndex((input) => item.id === input.id);
        if(matchingAddInputsIndex !== -1) { 
            addInputs.value.splice(matchingAddInputsIndex, 1);
        }
    }
    else { 
        const matchingModifyInputsIndex = modifyInputs.value.findIndex((input) => item.id === input.id);
        if(matchingModifyInputsIndex !== -1) {
            modifyInputs.value.splice(matchingModifyInputsIndex, 1);
        }
        if(item.frameIndex) { 
            deleteInputs.value.push(item.frameIndex);
        }
    }
};

const showChangesDialog = ref(false);

const downloadNewFile = async () => { 
    const response = (await fetch(import.meta.env.VITE_API_URL + '/GzMacro/inputs',
    {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            base64: base64.value, 
            addInputs: addInputs.value, 
            modifyInputs: modifyInputs.value, 
            deleteInputsFrameIndexes: deleteInputs.value,
        }),
    }));
    const newFile = await response.blob();
    download(newFile, files.value[0].name, 'application/octet-stream')
}

const headers = [   
    {
        title: '',
    },
    {
        title: 'Frame Index',
    },
    {
        title: 'Analog X',
    },
    {
        title: 'Analog Y',
    }, 
    {
        title: 'Pad Delta',
    },
    {
        title: 'A', 
    },
    {
        title: 'B', 
    }, 
    {
        title: 'Z', 
    }, 
    {
        title: 'Start',
    },
    {
        title: 'DPadUp', 
    }, 
    {
        title: 'DPadDown',
    }, 
    {
        title: 'DPadLeft',
    }, 
    {
        title: 'DPadRight', 
    }, 
    {
        title: 'Reset',
    }, 
    {
        title: 'L',
    }, 
    {
        title: 'R',
    },
    {
        title: 'CUp',
    },
    {
        title: 'CDown',
    },
    {
        title: 'CLeft',
    },
    {
        title: 'CRight',
    }
]


</script>

<style lang="css">

</style>