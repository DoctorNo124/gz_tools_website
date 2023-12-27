<template>
    <v-container>
        <v-row>
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
        <v-row v-if="gzMacroWrapper">
            <v-btn @click="openAddDialog" class="mr-5">Add Input</v-btn>
            <v-btn @click="commitChanges" :disabled="commitDisabled" class="mr-5">Commit Changes</v-btn>
            <v-btn @click="downloadNewFile" class="mr-5" :disabled="!blobToDownload">Download New File</v-btn>
            <v-btn @click="showChangesDialog = true">Show Changes</v-btn>
        </v-row>
        <v-row>
            <input-data-table :inputs="inputs" :headers="headers" :showActions="true" @edit-item="openModifyDialog" @delete-item="deleteItem"></input-data-table>
        </v-row>
        <v-dialog v-if="inputWrapperToAdd" v-model ="showAddDialog">
            <v-card>
                <v-card-title>Add Input</v-card-title>
                <div class="pl-5 pr-5 pt-5 pb-5">
                    <v-checkbox v-for="(inputButton, index) in inputWrapperToAdd.inputButtons" :key="inputButton.buttonType" v-model="inputButton.isButtonPressed" :label="inputKeys[index]">
                    </v-checkbox>
                    <v-text-field type="number" v-model="inputWrapperToAdd.frameIndex" label="Frame Index"></v-text-field>
                    <v-text-field type="number" v-model="inputWrapperToAdd.x" label="Analog X"></v-text-field>
                    <v-text-field type="number" v-model="inputWrapperToAdd.y" label="Analog Y"></v-text-field>
                    <v-text-field type="number" v-model="inputWrapperToAdd.padDelta" label="Pad Delta"></v-text-field>
                    <v-btn class="mr-5" @click="addInput">Submit</v-btn>
                    <v-btn @click="closeAddDialog">Close</v-btn>
                </div>
            </v-card>
        </v-dialog>
        <v-dialog v-if="inputWrapperToModify" v-model ="showModifyDialog">
            <v-card>
                <v-card-title>Modify Input</v-card-title>
                <div class="pl-5 pr-5 pt-5 pb-5">
                    <v-checkbox v-for="(inputButton, index) in inputWrapperToModify.inputButtons" :key="inputButton.buttonType" v-model="inputButton.isButtonPressed" :label="inputKeys[index]">
                    </v-checkbox>
                    <v-text-field type="number" v-model="inputWrapperToModify.x" label="Analog X"></v-text-field>
                    <v-text-field type="number" v-model="inputWrapperToModify.y" label="Analog Y"></v-text-field>
                    <v-text-field type="number" v-model="inputWrapperToModify.padDelta" label="Pad Delta"></v-text-field>
                    <v-btn class="mr-5" @click="modifyInput" >Submit</v-btn>
                    <v-btn @click="closeModifyDialog">Close</v-btn>
                </div>
            </v-card>
        </v-dialog>
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
    </v-container>
</template>
  
<script lang="ts" setup>
import { computed, ref } from 'vue';
import { fileToBase64 } from 'file64';
import { GzMacroWrapper, InputButtonType, InputButtons, InputWrapper } from '@/models'
import axios from 'axios';
import { cloneDeep, forIn } from 'lodash';
import InputDataTable from '@/components/InputDataTable.vue';
import { blob } from 'stream/consumers';

const files = ref<File[]>([]);
const gzMacroWrapper = ref<GzMacroWrapper>();
const inputs = ref<InputWrapper[]>([]);
const addInputs = ref<InputWrapper[]>([]);
const deleteInputs = ref<number[]>([]);
const modifyInputs = ref<InputWrapper[]>([]);
const inputKeys = Object.keys(InputButtonType).filter((v) => isNaN(Number(v)));
const inputValues = Object.values(InputButtonType).filter((v) => !isNaN(Number(v))).sort((a, b) => Number(b) - Number(a));
const tentativeInputCount = ref(0);
const blobToDownload = ref<Blob>();

const inputButtons: InputButtons[] = [];
inputKeys.forEach((key => { 
    inputButtons.push({
        isButtonPressed: false, 
        buttonType: InputButtonType[key as keyof typeof InputButtonType]
    })
}));
const initialInputWrapper: InputWrapper =  {
    frameIndex: 0, 
    x: 0, 
    y: 0, 
    padDelta: 0, 
    inputButtons: inputButtons
};

const showAddDialog = ref(false);
const inputWrapperToAdd = ref<InputWrapper>();

const openAddDialog = () => { 
    showAddDialog.value = true;
    inputWrapperToAdd.value = cloneDeep(initialInputWrapper);
}
const closeAddDialog = () => { 
    showAddDialog.value = false; 
    inputWrapperToAdd.value = undefined;
}
const addInput = () => { 
    if(inputWrapperToAdd.value) { 
        addInputs.value.push(inputWrapperToAdd.value);
        tentativeInputCount.value++;
        closeAddDialog();
    }
}

const showModifyDialog = ref(false); 
const inputWrapperToModify = ref<InputWrapper>();

const openModifyDialog = (item: InputWrapper) => { 
    showModifyDialog.value = true;
    inputWrapperToModify.value = item;
}
const closeModifyDialog = () => { 
    showModifyDialog.value = false; 
    inputWrapperToModify.value = undefined;
}
const modifyInput = () => { 
    if(inputWrapperToModify.value) { 
        modifyInputs.value.push(inputWrapperToModify.value);
        closeModifyDialog();
    }
}


const showChangesDialog = ref(false);

const getMacroFromFile = async (newFiles: File[]) => { 
    const base64 = (await fileToBase64(newFiles[0])).split('base64,')[1];
    await getMacro(base64);
    blobToDownload.value = undefined;
};

const getMacro = async (base64: string) => { 
    addInputs.value = [];
    deleteInputs.value = []; 
    modifyInputs.value = [];
    inputs.value = [];
    const axiosResponse = (await axios.post<GzMacroWrapper>(import.meta.env.VITE_API_URL + '/GzMacro/stats', { base64: base64 }));
    gzMacroWrapper.value = axiosResponse.data;
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
            inputButtons: inputButtons, 
            frameIndex: index,
            x: input.raw.x,
            y: input.raw.y, 
            padDelta: input.pad_delta,
        })
    });
    tentativeInputCount.value = gzMacroWrapper.value.macro.n_input;

}

const deleteItem = (item: InputWrapper) => { 
    deleteInputs.value.push(item.frameIndex);
};

const commitChanges = async () => { 
    const base64 = (await fileToBase64(files.value[0])).split('base64,')[1];
    const newFile = (await axios.post(import.meta.env.VITE_API_URL + '/GzMacro/inputs',
    {
        base64: base64, 
        addInputs: addInputs.value, 
        modifyInputs: modifyInputs.value, 
        deleteInputsFrameIndexes: deleteInputs.value,
    }, { responseType: 'blob'})).data;
    blobToDownload.value = newFile;
    const newBase64 = (await fileToBase64(newFile)).split('base64,')[1];
    await getMacro(newBase64);
}

const commitDisabled = computed(() => { 
    return addInputs.value.length === 0 
        && modifyInputs.value.length === 0
        && deleteInputs.value.length === 0
});

const downloadNewFile = () => { 
    if(blobToDownload.value) { 
        const blobUrl = URL.createObjectURL(blobToDownload.value);
        const link = document.createElement('a');
        link.href = blobUrl; 
        link.download = files.value[0].name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

const headers = [
    {
        title: "Frame"
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
    }, 
    {
        title: 'Analog X',
    },
    {
        title: 'Analog Y',
    }, 
    {
        title: 'Pad Delta',
    }
]


</script>