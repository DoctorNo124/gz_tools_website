// GzMacrosDll.cpp : Defines the exported functions for the DLL.
//

#include "framework.h"
#include <iostream>
#include "GzMacrosDll.h"
#include "gzm_struct_utils.h"

GZMACROSDLL_API int set_gzmacro(uint8_t* data, gz_macro* gzm, size_t size) {
    gzm_read(gzm, data, size);
    
    return 0;
}

GZMACROSDLL_API int cat_gzmacro(uint8_t* gzmData1, size_t gzmDataSize1, uint8_t* gzmData2, size_t gzmDataSize2, file_output fileOutput){

    struct gz_macro gzm1;
    struct gz_macro gzm2;
    struct gz_macro outputGzm;

    gzm_read(&gzm1, gzmData1, gzmDataSize1);
    gzm_read(&gzm2, gzmData2, gzmDataSize2);

    gzm_cat_r(&outputGzm, &gzm1, &gzm2);

    gzm_write(&outputGzm, &fileOutput);

    return 0;
}

GZMACROSDLL_API int update_inputs_gzmacro(gz_macro* gzm, struct movie_input* input, file_output fileOutput) {
    gzm_update_inputs(gzm, input);
    gzm_write(gzm, &fileOutput);
    return 0;
}

GZMACROSDLL_API int trim_gzmacro(uint8_t* data, size_t size, uint32_t end, file_output fileOutput) {
    struct gz_macro gzm;

    gzm_read(&gzm, data, size);

    gzm_trim(&gzm, end);

    gzm_write(&gzm, &fileOutput);

    return 0;
}

GZMACROSDLL_API int slice_gzmacro(uint8_t* data, size_t size, uint32_t frame_start, uint32_t frame_end, file_output fileOutput) {
    struct gz_macro gzm;
    struct gz_macro outputGzm;

    gzm_read(&gzm, data, size);

    gzm_slice(&outputGzm, &gzm, frame_start, frame_end);

    gzm_write(&outputGzm, &fileOutput);

    return 0;
}

