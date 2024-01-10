import MovieInput from "./MovieInput";
import MovieSeed from "./MovieSeed";
import Z64Controller from "./Z64Controller";

export default interface GzMacro { 
    n_input: number;
    n_seed: number; 
    input_start: Z64Controller; 
    inputs: MovieInput[];
    seeds: MovieSeed[];
    n_oca_input: number; 
    n_oca_sync: number;
    n_room_load: number;
    rerecords: number; 
    last_recorded_frame: number;
}