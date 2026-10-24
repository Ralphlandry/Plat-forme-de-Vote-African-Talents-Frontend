export function normalizeCameroonPhone(value) {
  let digits = String(value ?? '').replace(/\D/g, '')

  if (digits.startsWith('00237')) {
    digits = digits.slice(5)
  } else if (digits.startsWith('237') && digits.length > 9) {
    digits = digits.slice(3)
  }

  return digits.slice(0, 9)
}
