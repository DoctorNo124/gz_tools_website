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
            <input-data-table :inputs="inputs" :headers="headers" :showActions="true" @add-item="addInput" @delete-item="deleteItem" @edit-item="editItem" @clone-item="cloneInput">
                <template #toolbar>
                    <!-- 
                    <v-col>
                        <v-text-field type="number" v-model="addNumber" label="Number of adds"></v-text-field>
                    </v-col>
                    <v-col>
                        <v-btn @click="batchAdds" class="mr-5">Batch Add</v-btn>
                    </v-col> -->
                    <v-col>
                        <v-btn @click="downloadNewFile" class="mr-5" :disabled="!macro">Download File</v-btn>
                    </v-col>
                </template>
            </input-data-table>
        </v-row>
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
const inputKeys = Object.keys(InputButtonType).filter((v) => isNaN(Number(v)));
const inputValues = Object.values(InputButtonType).filter((v) => !isNaN(Number(v))).sort((a, b) => Number(b) - Number(a));
const addNumber = ref<number>(0);

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
    xStr: "0", 
    yStr: "0", 
    padDeltaStr: "0",
    inputButtons: inputButtons, 
    isAdd: false, 
    isDelete: false, 
    isModify: false,
};

const batchAdds = () => { 
    for(let i: number = 0; i < addNumber.value; i++) { 
        const inputWrapperToAdd = cloneDeep(initialInputWrapper);
        inputWrapperToAdd.isAdd = true;
        inputWrapperToAdd.frameIndex = inputs.value.length + i;
        inputWrapperToAdd.id = uuidv4();
        inputs.value.push(inputWrapperToAdd);
    }
}



const addInput = (item: InputWrapper, index: number) => { 
    const inputWrapperToAdd = cloneDeep(initialInputWrapper);
    inputWrapperToAdd.isAdd = true;
    inputWrapperToAdd.frameIndex = index + 1;
    inputWrapperToAdd.id = uuidv4();
    inputs.value.splice(index + 1, 0, inputWrapperToAdd);
    updateInputs.value.push(inputWrapperToAdd);
}

const cloneInput = (item: InputWrapper, index: number) => { 
    const inputWrapperToAdd = cloneDeep(item);
    inputWrapperToAdd.frameIndex = index + 1;
    inputWrapperToAdd.isAdd = true;
    inputWrapperToAdd.id = uuidv4();
    inputs.value.splice(index + 1, 0, inputWrapperToAdd);
    updateInputs.value.push(inputWrapperToAdd);
}

const showAddDialog = ref(false);
const inputWrapperToAdd = ref<InputWrapper>();
 
const openAddDialog = () => { 
    showAddDialog.value = true;
    inputWrapperToAdd.value = cloneDeep(initialInputWrapper);
    inputWrapperToAdd.value.frameIndex = inputs.value.length;
}


const editItem = (item: InputWrapper, index: number) => { 
    item.frameIndex = index;
    const x = parseInt(item.xStr);
    const y = parseInt(item.yStr); 
    console.log(y);
    const padDelta = parseInt(item.padDeltaStr);
    if(!isNaN(x)) { 
        item.x = x;
    }
    else { 
        item.xStr = item.x.toString();
    }
    if(!isNaN(y)) { 
        console.log(y);
        item.y = y;
    }
    else { 
        item.yStr = item.y.toString();
    }
    console.log(item.yStr);
    if(!isNaN(padDelta)) { 
        item.padDelta = padDelta;
    }
    else { 
        item.padDeltaStr = padDelta.toString();
    }
    if(item.bitPadDelta) { 
        item.padDelta = parseInt(item.bitPadDelta, 2);
    }
    if(!item.isAdd) { 
        item.isModify = true;
    }
    if (item.isModify) { 
        if(!updateInputs.value.some((input) => input.id === item.id)) { 
            updateInputs.value.push(item);
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
            xStr: input.raw.x.toString(), 
            yStr: input.raw.y.toString(), 
            padDeltaStr: input.pad_delta.toString(),
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