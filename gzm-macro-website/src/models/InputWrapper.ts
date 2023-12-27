import InputButtons from "./InputButtons";

export default interface InputWrapper {
    inputButtons: InputButtons[];
    frameIndex: number; 
    x: number; 
    y: number;
    padDelta: number;
}