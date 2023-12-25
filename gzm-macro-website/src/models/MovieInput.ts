import Z64Controller from "./Z64Controller";

export default interface MovieInput { 
    raw: Z64Controller;
    pad_delta: number;
}