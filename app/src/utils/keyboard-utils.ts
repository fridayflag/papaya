import { Keystroke } from '@/constants/keyboard'

export const getKeystrokeLabel = (keystroke: Keystroke): string => {
  return [
    keystroke.ctrlCmd ? 'Ctrl' : '',
    keystroke.altOpt ? 'Alt' : '',
    keystroke.shift ? 'Shift' : '',
    keystroke.symbol.toUpperCase(),
  ]
    .filter(Boolean)
    .join('+')
}

/**
 * Takes a string and appends a human-readible keystroke
 */
export const anotateTitleWithKeystroke = (title: string, keystroke: Keystroke) => {
  return [title, `[${getKeystrokeLabel(keystroke)}]`].filter(Boolean).join(' ')
}
