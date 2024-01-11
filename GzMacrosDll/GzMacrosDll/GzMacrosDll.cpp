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


std::vector<uint8_t> cat_gzmacro(std::string gzmData1, size_t gzmDataSize1, std::string gzmData2, size_t gzmDataSize2)
{

    struct gz_macro gzm1;
    struct gz_macro gzm2;
    struct gz_macro outputGzm;

    gzm_read(&gzm1, reinterpret_cast<uint8_t *>(&gzmData1[0]), gzmDataSize1);
    gzm_read(&gzm2, reinterpret_cast<uint8_t *>(&gzmData2[0]), gzmDataSize2);

    gzm_cat_r(&outputGzm, &gzm1, &gzm2);
    struct file_output output;
    gzm_write(&outputGzm, &output);
    std::vector<uint8_t> vector;
    for (int i = 0; i < output.n_bytes; i++)
    {
        vector.push_back(output.bytes[i]);
    }
    return vector;
}

static void set_input_wrappers(struct update_inputs_request* request, const emscripten::val &request_inputs) { 
    for(int i = 0; i < request->n_update_inputs; i++) {
        struct input_wrapper wrapper;
        auto request_input = request_inputs[i];
        bool isDelete = request_input["isDelete"].as<bool>();
        wrapper.is_delete = isDelete;
        wrapper.frame_index = request_input["frameIndex"].as<int>();
        if(isDelete) { 
            request->update_inputs[i] = wrapper;
            continue;
        }
        wrapper.is_modify = request_input["isModify"].as<bool>();
        wrapper.is_add = request_input["isAdd"].as<bool>();
        auto request_input_buttons = request_input["inputButtons"];
        wrapper.input_buttons = (struct input_button*)malloc(15*sizeof(input_button));
        for(int j = 0; j < 15; j++) {
            struct input_button button; 
            auto request_input_button = request_input_buttons[j];
            button.button_type = (uint16_t)(request_input_button["buttonType"].as<int>());
            button.is_button_pressed = request_input_button["isButtonPressed"].as<bool>();
            wrapper.input_buttons[j] = button;
        }
        wrapper.frame_index = request_input["frameIndex"].as<int>();
        wrapper.x = request_input["x"].as<int8_t>();
        wrapper.y = request_input["y"].as<int8_t>();
        wrapper.pad_delta = request_input["padDelta"].as<uint16_t>();
        request->update_inputs[i] = wrapper;
    }
}

std::vector<uint8_t> update_inputs_gzmacro(std::string data, int size, const emscripten::val &request)
{
    struct gz_macro gzm;

    gzm_read(&gzm, reinterpret_cast<uint8_t *>(&data[0]), size);

    struct update_inputs_request update_inputs_request;

    auto request_add_inputs = request["updateInputs"];
    update_inputs_request.n_update_inputs = request_add_inputs["length"].as<int>();
    update_inputs_request.update_inputs = (struct input_wrapper*)malloc(update_inputs_request.n_update_inputs*sizeof(struct input_wrapper));
    set_input_wrappers(&update_inputs_request, request_add_inputs);

    gzm_update_inputs(&gzm, &update_inputs_request);
    struct file_output output;
    gzm_write(&gzm, &output);
    std::vector<uint8_t> vector;
    for (int i = 0; i < output.n_bytes; i++)
    {
        vector.push_back(output.bytes[i]);
    }
    return vector;
}

std::vector<uint8_t> trim_gzmacro(std::string data, int size, uint32_t end)
{
    struct gz_macro gzm;

    gzm_read(&gzm, reinterpret_cast<uint8_t *>(&data[0]), size);

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

std::vector<uint8_t> slice_gzmacro(std::string data, size_t size, uint32_t frame_start, uint32_t frame_end)
{
    struct gz_macro gzm;
    struct gz_macro outputGzm;

    gzm_read(&gzm, reinterpret_cast<uint8_t *>(&data[0]), size);

    gzm_slice(&outputGzm, &gzm, frame_start, frame_end);
    struct file_output output;
    gzm_write(&outputGzm, &output);
    std::vector<uint8_t> vector;
    for (int i = 0; i < output.n_bytes; i++)
    {
        vector.push_back(output.bytes[i]);
    }
    return vector;
}

EMSCRIPTEN_BINDINGS(new_file_output)
{
    emscripten::register_vector<uint8_t>("vector<uint8_t>");
    emscripten::function("update_inputs_gzmacro", &update_inputs_gzmacro);
    emscripten::function("slice_gzmacro", &slice_gzmacro);
    emscripten::function("trim_gzmacro", &trim_gzmacro);
    emscripten::function("cat_gzmacro", &cat_gzmacro);
}

