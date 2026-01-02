import z from "zod";

/**
 * Fallback sync strategys
 */
export const NoneSyncStrategy = z.object({
  syncType: z.literal('NONE'),
})
export type NoneSyncStrategy = z.output<typeof NoneSyncStrategy>

export const LocalSyncStrategy = z.object({
  syncType: z.literal('LOCAL'),
})
export type LocalSyncStrategy = z.output<typeof LocalSyncStrategy>

export const ServerSyncStrategy = z.object({
  syncType: z.literal('SERVER'),
  server: z.any(),
  connection: z.object({
    username: z.string(),
    couchDbUrl: z.string(),
    databaseName: z.string(),
  })
})
export type ServerSyncStrategy = z.output<typeof ServerSyncStrategy>

export const SyncStrategy = z.discriminatedUnion(
  'syncType',
  [
    NoneSyncStrategy,
    LocalSyncStrategy,
    ServerSyncStrategy,
  ]
)
export type SyncStrategy = z.output<typeof SyncStrategy>
