import { GzMacro } from "@/models";


export class GZMError extends Error {
  constructor(m: string) {
    super(m);
    Object.setPrototypeOf(this, GZMError.prototype);
  }
}

export const EXTENSION = '.gzm';
const N_INPUT_ADDR = 0;
const N_SEED_ADDR = 0x4;
const STARTING_INPUT_ADDR = 0x8;
const INPUTS_ADDR = 0xc;
const INPUT_LENGTH = 0x6;
const SEED_LENGTH = 0xc;
const N_OCA_INPUT_OFFSET = 0;
const N_OCA_SYNC_OFFSET = 0x4;
const N_ROOM_LOAD_OFFSET = 0xc;
const OCA_INPUT_OFFSET = 0xc;
const OCA_INPUT_LENGTH = 0x8;
const OCA_SYNC_LENGTH = 0x8; 
const ROOM_LOAD_LENGTH = 0x4;
const LAST_RECORDED_FRAME_OFFSET = 0x4;

const getSeedsAddr = (totalInputs: number): number =>
  INPUTS_ADDR + totalInputs * INPUT_LENGTH;

const getMetaAddr = (seedsAddr: number, totalSeeds: number): number =>
  seedsAddr + totalSeeds * SEED_LENGTH;

const getOcaSyncAddr = (ocaInputAddr: number, totalOcaInputs: number): number => 
  ocaInputAddr + totalOcaInputs * OCA_INPUT_LENGTH; 

const getRoomLoadAddr = (ocaSyncAddr: number, totalOcaSyncs: number): number => 
  ocaSyncAddr + totalOcaSyncs * OCA_SYNC_LENGTH; 

const getRerecordAddr = (roomLoadAddr: number, totalRoomLoads: number): number => 
  roomLoadAddr + totalRoomLoads * ROOM_LOAD_LENGTH;


// convert GZM file to GZM object
export const getFileAsGZM = async (file: File): Promise<GzMacro> => {
  if (!file.name.endsWith(EXTENSION)) {
    throw new GZMError(`Filename must end with ${EXTENSION}`);
  }
  const filename = file.name.slice(0, -EXTENSION.length);
  const bytes = new DataView(await file.arrayBuffer());

  return getBytesAsGZM(bytes);
};

// convert bytes to GZM object
export const getBytesAsGZM = (bytes: DataView): GzMacro => {
  const totalInputs = bytes.getUint32(N_INPUT_ADDR);
  const totalSeeds = bytes.getUint32(N_SEED_ADDR);
  const seedsAddr = getSeedsAddr(totalInputs);
  const metaAddr = getMetaAddr(seedsAddr, totalSeeds);
  let nOcaInput = 0;
  let nOcaSync = 0;
  let nRoomLoad = 0;
  const ocaInputs = [];
  const ocaSyncs = [];
  const roomLoads = [];
  let rerecords = 0;
  let lastRecordedFrame = 0;
  try { 
    nOcaInput = bytes.getUint32(metaAddr + N_OCA_INPUT_OFFSET);
    nOcaSync = bytes.getUint32(metaAddr + N_OCA_SYNC_OFFSET);
    nRoomLoad = bytes.getUint32(metaAddr + N_ROOM_LOAD_OFFSET);
    const ocaInputAddr = metaAddr + OCA_INPUT_OFFSET;
    const ocaSyncAddr = getOcaSyncAddr(ocaInputAddr, nOcaInput);
    const roomLoadAddr = getRoomLoadAddr(ocaSyncAddr, nOcaSync);
    for (let i = ocaInputAddr; i < ocaSyncAddr; i += OCA_INPUT_LENGTH) { 
      ocaInputs.push({ 
        frame_idx: bytes.getInt32(i), 
        pad: bytes.getUint16(i + 4), 
        adjusted_x: bytes.getInt8(i + 6), 
        adjusted_y: bytes.getInt8(i + 7)
      });
    }
    for (let i = ocaSyncAddr; i < roomLoadAddr; i += OCA_SYNC_LENGTH) { 
      ocaSyncs.push({ 
        frame_idx: bytes.getInt32(i), 
        audio_frames: bytes.getInt32(i + 4), 
      });
    }
    for (let i = roomLoadAddr; i < (roomLoadAddr + nRoomLoad * ROOM_LOAD_LENGTH); i += ROOM_LOAD_LENGTH) { 
      roomLoads.push({ 
        frame_idx: bytes.getInt32(i), 
      });
    }  
    const rerecordsAddr = getRerecordAddr(roomLoadAddr, nRoomLoad);
    rerecords = bytes.getUint32(rerecordsAddr);
  }
  catch(error) { 
    try { 
      rerecords = bytes.getUint32(metaAddr);
      lastRecordedFrame = bytes.getUint32(metaAddr + LAST_RECORDED_FRAME_OFFSET);
    }
    catch(error){}
  }

  const startingInput = {
      pad: bytes.getUint16(STARTING_INPUT_ADDR),
      x: bytes.getUint8(STARTING_INPUT_ADDR + 2),
      y: bytes.getUint8(STARTING_INPUT_ADDR + 3)
  };

  const inputs = [];
  for (let i = INPUTS_ADDR; i < seedsAddr; i += INPUT_LENGTH) {
    inputs.push({
      raw: { 
        pad: bytes.getUint16(i),
        x: bytes.getInt8(i + 2),
        y: bytes.getInt8(i + 3),
      },
      pad_delta: bytes.getUint16(i + 4)
    });
  }

  const seeds = [];
  for (let i = seedsAddr; i < metaAddr; i += SEED_LENGTH) {
    seeds.push({
      frame_idx: bytes.getUint32(i),
      old_seed: bytes.getUint32(i + 4),
      new_seed: bytes.getUint32(i + 8)
    });
  }


  return {
    n_input: totalInputs,
    n_seed: totalSeeds,
    input_start: startingInput,
    inputs: inputs,
    seeds: seeds,
    n_oca_input: nOcaInput, 
    n_oca_sync: nOcaSync, 
    n_room_load: nRoomLoad,
    oca_input: ocaInputs, 
    oca_sync: ocaSyncs, 
    room_load: roomLoads, 
    rerecords: rerecords,
    last_recorded_frame: lastRecordedFrame
  };
};

// convert GZM object back to bytes
export const getGZMAsBytes = (gzm: GzMacro): DataView => {
  const byteLength =
    INPUTS_ADDR +
    gzm.n_input * INPUT_LENGTH +
    gzm.n_seed * SEED_LENGTH +
    (LAST_RECORDED_FRAME_OFFSET + 4);
  const bytes = new DataView(new ArrayBuffer(byteLength));
  const seedsAddr = getSeedsAddr(gzm.n_input);
  const metaAddr = getMetaAddr(seedsAddr, gzm.n_seed);
  const ocaInputAddr = metaAddr + OCA_INPUT_OFFSET;
  const ocaSyncAddr = getOcaSyncAddr(ocaInputAddr, gzm.n_oca_input);
  const roomLoadAddr = getRoomLoadAddr(ocaSyncAddr, gzm.n_oca_sync);
  const rerecordAddr = getRerecordAddr(roomLoadAddr, gzm.n_room_load);

  bytes.setUint32(N_INPUT_ADDR, gzm.n_input);
  bytes.setUint32(N_SEED_ADDR, gzm.n_seed);
  bytes.setUint16(STARTING_INPUT_ADDR, gzm.input_start.pad);
  bytes.setUint8(STARTING_INPUT_ADDR + 2, gzm.input_start.x);
  bytes.setUint8(STARTING_INPUT_ADDR + 3, gzm.input_start.y);
  gzm.inputs.forEach((input, index) => {
    // TODO reuse getSeedsAddr
    const offset = INPUTS_ADDR + index * INPUT_LENGTH;
    bytes.setUint16(offset, input.raw.pad);
    bytes.setUint8(offset + 2, input.raw.x);
    bytes.setUint8(offset + 3, input.raw.y);
    bytes.setUint16(offset + 4, input.pad_delta);
  });
  gzm.seeds.forEach((seed, index) => {
    const offset = seedsAddr + index * SEED_LENGTH;
    bytes.setUint32(offset, seed.frame_idx);
    bytes.setUint32(offset + 4, seed.old_seed);
    bytes.setUint32(offset + 8, seed.new_seed);
  });
  bytes.setUint32(metaAddr + N_OCA_INPUT_OFFSET, gzm.n_oca_input);
  bytes.setUint32(metaAddr + N_OCA_SYNC_OFFSET, gzm.n_oca_sync);
  bytes.setUint32(metaAddr + N_ROOM_LOAD_OFFSET, gzm.n_room_load);
  gzm.oca_input.forEach((ocaInput, index) => { 
    const offset = ocaInputAddr + index * OCA_INPUT_LENGTH;
    bytes.setInt32(offset, ocaInput.frame_idx);
    bytes.setUint16(offset + 4, ocaInput.pad);
    bytes.setInt8(offset + 6, ocaInput.adjusted_x);
    bytes.setInt8(offset + 7, ocaInput.adjusted_y);
  });
  gzm.oca_sync.forEach((ocaSync, index) => { 
    const offset = ocaSyncAddr + index * OCA_SYNC_LENGTH;
    bytes.setInt32(offset, ocaSync.frame_idx);
    bytes.setInt32(offset + 4, ocaSync.audio_frames);
  });
  gzm.room_load.forEach((roomLoad, index) => { 
    const offset = roomLoadAddr + index * ROOM_LOAD_LENGTH;
    bytes.setInt32(offset, roomLoad.frame_idx);
  });
  bytes.setUint32(rerecordAddr, gzm.rerecords);
  bytes.setUint32(rerecordAddr + LAST_RECORDED_FRAME_OFFSET, gzm.last_recorded_frame);
  return bytes;
};
