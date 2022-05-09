export enum EEnvKeys {
  EZNFT_LOG_LEVEL = 'EZNFT_LOG_LEVEL',
  PINATA_API_KEY = 'PINATA_API_KEY',
  PINATA_SECRET_API_KEY = 'PINATA_SECRET_API_KEY',
}

export type EEnvKeysType = keyof typeof EEnvKeys;
