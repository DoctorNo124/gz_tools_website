import InputButtons from "./InputButtons";

export default interface InputWrapper {
    inputButtons: InputButtons[];
    frameIndex?: number; 
    x: number; 
    y: number;
    isDelete: boolean;
    isAdd: boolean;
    isModify: boolean;
    padDelta: number;
    bitPadDelta?: string;
    isEditable: boolean;
    isEditingAdd?: boolean;
    id: string;
}