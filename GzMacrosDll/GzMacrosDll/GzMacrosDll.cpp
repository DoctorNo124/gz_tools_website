// GzMacrosDll.cpp : Defines the exported functions for the DLL.
//
extern "C" { 
	#include "gzm.h"
}
#include <stdio.h>
#include <emscripten/bind.h>
#include <emscripten/emscripten.h>

#define EXTERN EMSCRIPTEN_KEEPALIVE

class FileOutput {
private:
	uint8_t* bytes;
	uint32_t n_bytes;
	
public: 
	FileOutput() { 

	}
	FileOutput(uint8_t* _bytes, uint32_t _n_bytes): bytes(_bytes), n_bytes(_n_bytes) { 

	}

	uint8_t* getBytes() const { 
		return bytes; 
	}

	uint32_t getNBytes() const { 
		return n_bytes;
	}
};	

EXTERN int set_gzmacro(uint8_t* data, struct gz_macro* gzm, size_t size) {
    gzm_read(gzm, data, size);

    return 0;
}

EXTERN int cat_gzmacro(uint8_t* gzmData1, size_t gzmDataSize1, uint8_t* gzmData2, size_t gzmDataSize2) {

    struct gz_macro gzm1;
    struct gz_macro gzm2;
    struct gz_macro outputGzm;

    gzm_read(&gzm1, gzmData1, gzmDataSize1);
    gzm_read(&gzm2, gzmData2, gzmDataSize2);

    gzm_cat_r(&outputGzm, &gzm1, &gzm2);
    struct file_output output;
    gzm_write(&outputGzm, &output);

    return 0;
}

EXTERN int update_inputs_gzmacro(struct gz_macro* gzm, struct movie_input* input, uint8_t* bytes) {
    gzm_update_inputs(gzm, input);
    struct file_output output;
    gzm_write(gzm, &output);
    return 0;
}

EXTERN int get_trim_gzmacro_size(uint8_t* data, size_t size, uint32_t end) {
    struct gz_macro gzm;

    gzm_read(&gzm, data, size);

    gzm_trim(&gzm, end);

    struct file_output output;
    gzm_write(&gzm, &output);

    return output.n_bytes;
}

EXTERN uint8_t* get_trim_gzmacro_size_bytes(uint8_t* data, size_t size, uint32_t end) {
    struct gz_macro gzm;

    gzm_read(&gzm, data, size);

    gzm_trim(&gzm, end);

    struct file_output output;
    gzm_write(&gzm, &output);

    return output.bytes;
}


EXTERN int slice_gzmacro(uint8_t* data, size_t size, uint32_t frame_start, uint32_t frame_end) {
    struct gz_macro gzm;
    struct gz_macro outputGzm;

    gzm_read(&gzm, data, size);

    gzm_slice(&outputGzm, &gzm, frame_start, frame_end);
    struct file_output output;
    gzm_write(&outputGzm, &output);

    return 0;
}

EMSCRIPTEN_BINDINGS(file_output) {
  emscripten::class_<FileOutput>("FileOutput")
    .constructor<>()
    .constructor<uint8_t*, uint32_t>()
    .property("n_bytes", &FileOutput::getNBytes)
    ;
}