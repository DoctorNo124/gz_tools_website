import FormattedMovieSeed from "./FormattedMovieSeed";
import GzMacro from "./GzMacro";
import MovieInput from "./MovieInput";

export default interface GzMacroWrapper { 
    macro: GzMacro;
    inputs: MovieInput[];
    seeds: FormattedMovieSeed[];
}