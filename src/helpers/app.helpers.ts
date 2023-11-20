import { NEW_ORDER_STEP } from 'src/constants/app.constants'

export function getNewOrder(
  start: number | null,
  finish: number | null,
): number {
  if (!start && finish) {
    return finish - NEW_ORDER_STEP
  }

  if (start && !finish) {
    return start + NEW_ORDER_STEP
  }

  if (!start && !finish) {
    return NEW_ORDER_STEP
  }

  return (start + finish) / 2
}

export function getTime(): string {
  const timestamp = new Date().getTime()
  const timestampString = timestamp.toString()

  return timestampString.slice(-4)
}
