// The following ifdef block is the standard way of creating macros which make exporting
// from a DLL simpler. All files within this DLL are compiled with the GZMACROSDLL_EXPORTS
// symbol defined on the command line. This symbol should not be defined on any project
// that uses this DLL. This way any other project whose source files include this file see
// GZMACROSDLL_API functions as being imported from a DLL, whereas this DLL sees symbols
// defined with this macro as being exported.
extern "C" {
    #include "gzm.h"
    int set_gzmacro(uint8_t* data, gz_macro* gzm, size_t size);
    int cat_gzmacro(uint8_t* gzmData1, size_t gzmDataSize1, uint8_t* gzmData2, size_t gzmDataSize2, file_output fileOutput);
    int update_inputs_gzmacro(gz_macro* gzm, struct movie_input* input, file_output fileOutput);
};
