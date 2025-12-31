type PapayaUrnNamespace = `papaya:${string}`;

export const JournalNamespace = 'papaya:journal' as const satisfies PapayaUrnNamespace;

export const EntryNamespace = 'papaya:entry' as const satisfies PapayaUrnNamespace;

export const PersonNamespace = 'papaya:person' as const satisfies PapayaUrnNamespace;

const _StemNamespace = `${EntryNamespace}:stem` as const satisfies PapayaUrnNamespace;

export const TopicSetStemNamespace = `${_StemNamespace}:topiclist` as const satisfies PapayaUrnNamespace;
export const AttachmentStemNamespace = `${_StemNamespace}:attachment` as const satisfies PapayaUrnNamespace;
export const FlagStemNamespace = `${_StemNamespace}:flag` as const satisfies PapayaUrnNamespace;
export const ForkStemNamespace = `${_StemNamespace}:fork` as const satisfies PapayaUrnNamespace;
export const GratuityStemNamespace = `${_StemNamespace}:gratuity` as const satisfies PapayaUrnNamespace;
export const MentionStemNamespace = `${_StemNamespace}:mention` as const satisfies PapayaUrnNamespace;
export const NoteStemNamespace = `${_StemNamespace}:note` as const satisfies PapayaUrnNamespace;
export const ObligationStemNamespace = `${_StemNamespace}:obligation` as const satisfies PapayaUrnNamespace;
export const RecurrenceStemNamespace = `${_StemNamespace}:recurrence` as const satisfies PapayaUrnNamespace;
