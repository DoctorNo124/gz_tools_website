import InputWrapper from "./InputWrapper";

export default interface UpdateInputsRequest {
    base64: string;
    addInputs: InputWrapper[];
    modifyInputs: InputWrapper[];
    deleteInputsFrameIndexes: number;
}

