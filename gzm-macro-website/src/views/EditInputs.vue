<template>
    <v-container>
        <v-row :class="{ 'mt-10': macro }">
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
                        <v-btn @click="downloadNewFile" class="mr-5" :disabled="!macro">Download File</v-btn>
                    </v-col>
                </template>
            </input-data-table>
        </v-row>
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
import { GzMacro, InputButtonType, InputButtons, InputWrapper } from '@/models'
import { cloneDeep } from 'lodash';
import InputDataTable from '@/components/InputDataTable.vue';
import { v4 as uuidv4 } from 'uuid';
import download from 'downloadjs';
import { getFileAsGZM, getBytesAsGZM } from '@/util/GZMHelpers';

const files = ref<File[]>([]);
const macro = ref<GzMacro>();
const uint8Array = ref<Uint8Array>();
const inputs = ref<InputWrapper[]>([]);
const updateInputs = ref<InputWrapper[]>([]);
const originalModifyInputs = ref<InputWrapper[]>([]);
const inputKeys = Object.keys(InputButtonType).filter((v) => isNaN(Number(v)));
const inputValues = Object.values(InputButtonType).filter((v) => !isNaN(Number(v))).sort((a, b) => Number(b) - Number(a));

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
    isAdd: false, 
    isDelete: false, 
    isModify: false,
};


const addInput = (item: InputWrapper, index: number) => { 
    const inputWrapperToAdd = cloneDeep(initialInputWrapper);
    inputWrapperToAdd.isAdd = true;
    inputWrapperToAdd.id = uuidv4();
    inputs.value.splice(index + 1, 0, inputWrapperToAdd);
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
        inputWrapperToAdd.value.isAdd = true;
        updateInputs.value.push(inputWrapperToAdd.value);
        inputs.value.push(inputWrapperToAdd.value);
        closeAddDialog();
    }
}

const modifyInput = (item: InputWrapper) => { 
    const originalModifyInput = cloneDeep(item);
    item.isEditable = true;
    originalModifyInputs.value.push(originalModifyInput);
    if(item.isAdd) { 
        item.isEditingAdd = true;
    }
    else { 
        item.isModify = true;
    }
}

const saveItem = (item: InputWrapper, index: number) => { 
    item.frameIndex = index;
    item.x = Number(item.x);
    item.y = Number(item.y);
    item.padDelta = Number(item.padDelta);
    if(item.bitPadDelta) { 
        item.padDelta = parseInt(item.bitPadDelta, 2);
    }
    item.isEditable = false;
    if(item.isAdd) {
        if(!item.isEditingAdd) { 
            updateInputs.value.push(item);
        }
    }
    else if (item.isModify) { 
        if(!updateInputs.value.some((input) => input.id === item.id)) { 
            updateInputs.value.push(item);
        }
        const originalModifyInputIndex = originalModifyInputs.value.findIndex((input) => input.id === item.id);
        originalModifyInputs.value.splice(originalModifyInputIndex, 1);
    }
    item.isEditable = false;
}

const cancelItem = (item: InputWrapper, index: number) => { 
    if(item.isAdd) { 
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
            const matchingUpdateInputIndex = updateInputs.value.findIndex((input) => input.id === item.id);
            if(matchingUpdateInputIndex !== -1) { 
                updateInputs.value[matchingUpdateInputIndex] = matchingOriginalModifyInput;
            }
            originalModifyInputs.value.splice(matchingOriginalModifyInputIndex, 1);
        }
    }
}

const getMacroFromFile = async (newFiles: File[]) => { 
    macro.value = await getFileAsGZM(newFiles[0])
    const buffer = await files.value[0].arrayBuffer()
    uint8Array.value = new Uint8Array(buffer);
    resetInputs();
};

const resetInputs = () => { 
    updateInputs.value = [];
    originalModifyInputs.value = [];
    inputs.value = [];
    populateInputs();
}

const populateInputs = () => { 
    macro.value?.inputs.forEach((input, index) => { 
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
            isAdd: false,
            isDelete: false,
            isModify: false,
        })
    });
}

const deleteItem = (item: InputWrapper, index: number) => { 
    inputs.value.splice(index, 1);
    if(item.isAdd) { 
        const matchingAddInputsIndex = updateInputs.value.findIndex((input) => item.id === input.id);
        if(matchingAddInputsIndex !== -1) { 
            updateInputs.value.splice(matchingAddInputsIndex, 1);
        }
    }
    else { 
        if (item.isModify) { 
            const matchingModifyInputsIndex = updateInputs.value.findIndex((input) => item.id === input.id);
            if(matchingModifyInputsIndex !== -1) {
                updateInputs.value.splice(matchingModifyInputsIndex, 1);
            }
        }
        item.isDelete = true;
        item.frameIndex = index;
        updateInputs.value.push(item);
    }
};

const downloadNewFile = async () => { 
    // const macro = gzMacroWrapper.value?.macro;
    // for(const modifyRequest of modifyInputs.value) { 
    //     gzMacroWrapper.value?.inputs[]
    // }
    if(uint8Array.value) { 
        const bytes = uint8Array.value;
        
        const bytesVector = Module.update_inputs_gzmacro(bytes, bytes.length, {
            updateInputs: updateInputs.value
        });
        const newArray = new Uint8Array(bytesVector.size()).fill(0).map((_, id) => bytesVector.get(id));
        uint8Array.value = newArray;
        const dv = new DataView(newArray.buffer, newArray.byteOffset, newArray.byteLength);
        macro.value = getBytesAsGZM(dv);

        resetInputs();

        const blob = new Blob([newArray]);
        download(blob, files.value[0].name, 'application/octet-stream');
    }
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