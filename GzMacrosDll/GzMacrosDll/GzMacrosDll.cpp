// GzMacrosDll.cpp : Defines the exported functions for the DLL.
//
extern "C"
{
#include "gzm.h"
}
#include <stdio.h>
#include <emscripten/bind.h>
#include <emscripten/emscripten.h>
#include <emscripten/val.h>

#define EXTERN EMSCRIPTEN_KEEPALIVE

class Test
{
public:
    Test(int i, int j)
    {
        _i = i;
        _j = j;
    }
    int _i;
    int _j;

    int getI() const
    {
        return _i;
    }

    int getJ() const
    {
        return _j;
    }
};

EXTERN int
set_gzmacro(uint8_t *data, struct gz_macro *gzm, size_t size)
{
    gzm_read(gzm, data, size);

    return 0;
}

EXTERN int cat_gzmacro(uint8_t *gzmData1, size_t gzmDataSize1, uint8_t *gzmData2, size_t gzmDataSize2)
{

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

EXTERN int update_inputs_gzmacro(struct gz_macro *gzm, struct movie_input *input, uint8_t *bytes)
{
    gzm_update_inputs(gzm, input);
    struct file_output output;
    gzm_write(gzm, &output);
    return 0;
}

EXTERN int get_trim_gzmacro_size(uint8_t *data, size_t size, uint32_t end)
{
    struct gz_macro gzm;

    gzm_read(&gzm, data, size);

    gzm_trim(&gzm, end);

    struct file_output output;
    gzm_write(&gzm, &output);

    return output.n_bytes;
}

std::vector<uint8_t> trim_gzmacro(uint8_t *data, int size, uint32_t end)
{
    struct gz_macro gzm;

    gzm_read(&gzm, data, size);

    gzm_trim(&gzm, end);

    struct file_output output;
    gzm_write(&gzm, &output);
    std::vector<uint8_t> vector;
    for (int i = 0; i < output.n_bytes; i++)
    {
        vector.push_back(output.bytes[i]);
    }
    return vector;
}

std::vector<uint8_t> trim_gzmacro(intptr_t data, int size, double end)
{
    return trim_gzmacro(reinterpret_cast<uint8_t *>(data), size, static_cast<uint32_t>(end));
}

int test_function(const movie_input *inputs)
{
    return 0;
}

int test_function(intptr_t inputs)
{
    return test_function((movie_input *)(inputs));
}

int test_function2(const emscripten::val &arrayObject)
{
    int length = arrayObject["length"].as<int>();
    auto testValue = arrayObject[0];
    int j = testValue["j"].as<int>();
    auto data = arrayObject.data();
    return length;
}

EMSCRIPTEN_BINDINGS(new_file_output)
{
    emscripten::register_vector<uint8_t>("vector<uint8_t>");
    emscripten::function("trim_gzmacro", emscripten::select_overload<std::vector<uint8_t>(intptr_t, int, double)>(&trim_gzmacro));
    emscripten::value_object<z64_controller_t>("z64_controller_t")
        .field("pad", &z64_controller_t::pad)
        .field("x", &z64_controller_t::x)
        .field("y", &z64_controller_t::y);
    emscripten::value_object<movie_input>("movie_seed")
        .field("raw", &movie_input::raw)
        .field("pad_delta", &movie_input::pad_delta);
    emscripten::function("test_function", emscripten::select_overload<int(intptr_t)>(&test_function));
    emscripten::class_<Test>("Test")
        .constructor<int, int>()
        .property("i", &Test::getI)
        .property("j", &Test::getJ);
    emscripten::function("test_function2", &test_function2);
}

EXTERN uint8_t *get_trim_gzmacro_size_bytes(uint8_t *data, size_t size, uint32_t end)
{
    struct gz_macro gzm;

    gzm_read(&gzm, data, size);

    gzm_trim(&gzm, end);

    struct file_output output;
    gzm_write(&gzm, &output);

    return output.bytes;
}

EXTERN int slice_gzmacro(uint8_t *data, size_t size, uint32_t frame_start, uint32_t frame_end)
{
    struct gz_macro gzm;
    struct gz_macro outputGzm;

    gzm_read(&gzm, data, size);

    gzm_slice(&outputGzm, &gzm, frame_start, frame_end);
    struct file_output output;
    gzm_write(&outputGzm, &output);

    return 0;
}
