import InputButtons from "./InputButtons";

export default interface InputWrapper {
    inputButtons: InputButtons[];
    frameIndex?: number; 
    x: number; 
    y: number;
    xStr: string;
    yStr: string;
    padDeltaStr: string;
    isDelete: boolean;
    isAdd: boolean;
    isModify: boolean;
    padDelta: number;
    bitPadDelta?: string;
    id: string;
}