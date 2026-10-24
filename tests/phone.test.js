import assert from 'node:assert/strict'
import test from 'node:test'

import { normalizeCameroonPhone } from '../src/utils/phone.js'

test('keeps a nine-digit Cameroon local number unchanged', () => {
  assert.equal(normalizeCameroonPhone('655 500 001'), '655500001')
})

test('removes the Cameroon country code when a full international number is pasted', () => {
  assert.equal(normalizeCameroonPhone('+237 655 500 001'), '655500001')
  assert.equal(normalizeCameroonPhone('00237 655 500 001'), '655500001')
})

test('limits input to the local number field length', () => {
  assert.equal(normalizeCameroonPhone('65550000199'), '655500001')
})
