


int set_gzmacro(uint8_t* data, struct gz_macro* gzm, size_t size);
int cat_gzmacro(uint8_t* gzmData1, size_t gzmDataSize1, uint8_t* gzmData2, size_t gzmDataSize2);
int update_inputs_gzmacro(struct gz_macro* gzm, struct movie_input* input, uint8_t* bytes);
FileOutput trim_gzmacro(uint8_t* data, size_t size, uint32_t end);
int slice_gzmacro(uint8_t* data, size_t size, uint32_t frame_start, uint32_t frame_end);
