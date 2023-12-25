#pragma once
extern "C" {
	#include "gzm.h"
}
class GzmStructUtils {
public: 
	static gz_macro CreateEmptyGzMacro() {
		struct gz_macro gzm = gz_macro();
		gzm.n_input = 0;
		gzm.n_seed = 0;
		z64_controller_t inputStart = z64_controller_t();
		inputStart.pad = 0;
		inputStart.x = 0;
		inputStart.y = 0;
		gzm.input_start = inputStart;
		gzm.input = nullptr;
		gzm.seed = nullptr;
		gzm.n_oca_input = 0;
		gzm.n_oca_sync = 0;
		gzm.n_room_load = 0;
		gzm.oca_input = nullptr;
		gzm.oca_sync = nullptr;
		gzm.room_load = nullptr; 
		gzm.rerecords = 0;
		gzm.last_recorded_frame = 0;
		return gzm;
	}
};