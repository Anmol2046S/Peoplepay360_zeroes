// Disable BullMQ/Redis for local dev to avoid connection crashes
export const connection = null as any;
export const payrunQueue = {
  add: async () => { console.log('Mock queue add'); }
} as any;
