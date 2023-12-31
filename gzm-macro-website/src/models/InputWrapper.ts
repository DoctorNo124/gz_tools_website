import InputButtons from "./InputButtons";

export default interface InputWrapper {
    inputButtons: InputButtons[];
    frameIndex?: number; 
    x: number; 
    y: number;
    padDelta: number;
    bitPadDelta?: string;
    isEditable: boolean;
    isAdded?: boolean;
    addOrder?: number;
    isEditingAdd?: boolean;
    id: string;
}