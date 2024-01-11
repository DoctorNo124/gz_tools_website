import InputWrapper from "./InputWrapper";

export default interface UpdateInputsRequest {
    addInputs: InputWrapper[];
    modifyInputs: InputWrapper[];
    deleteInputsFrameIndexes: number[];
}

