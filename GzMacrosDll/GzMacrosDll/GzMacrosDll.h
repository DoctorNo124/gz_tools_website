// The following ifdef block is the standard way of creating macros which make exporting
// from a DLL simpler. All files within this DLL are compiled with the GZMACROSDLL_EXPORTS
// symbol defined on the command line. This symbol should not be defined on any project
// that uses this DLL. This way any other project whose source files include this file see
// GZMACROSDLL_API functions as being imported from a DLL, whereas this DLL sees symbols
// defined with this macro as being exported.
#ifdef GZMACROSDLL_EXPORTS
#define GZMACROSDLL_API __declspec(dllexport)
#else
#define GZMACROSDLL_API __declspec(dllimport)
#endif
extern "C" {
    #include "gzm.h"
    GZMACROSDLL_API int set_gzmacro(uint8_t* data, gz_macro* gzm, size_t size);
    GZMACROSDLL_API int cat_gzmacro(uint8_t* gzmData1, size_t gzmDataSize1, uint8_t* gzmData2, size_t gzmDataSize2, file_output fileOutput);
    GZMACROSDLL_API int update_inputs_gzmacro(gz_macro* gzm, struct movie_input* input, file_output fileOutput);
    GZMACROSDLL_API int trim_gzmacro(uint8_t* data, size_t size, uint32_t end, file_output fileOutput);
    GZMACROSDLL_API int slice_gzmacro(uint8_t* data, size_t size, uint32_t frame_start, uint32_t frame_end, file_output fileOutput);
};
