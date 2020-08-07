/*
 * Test the batches of transactions locally before posting them to a remote contract.
 * This script will print out any errors.
 */

import TestHelper from '../helpers'
import getBatches from './txBatches'
import { OWNER, DEV_NAME, IS_OPEN, testKeys, OTHER_COMMUNITY } from '../helpers/constants'
import debug from 'debug'
import { createInitState } from 'outpost-protocol'

const log = debug('localRun')

let state
let helper
let batches
let counter = 1

export async function localRun (ipfs) {
  await runSetup(ipfs)

  let endState
  for (let i = 0; i < batches.length; i++) {
    endState = await testBatch(batches, i)
  }

  return endState
}

async function runSetup (ipfs) {
  helper = new TestHelper()
  const accounts = await helper.setupEnv(testKeys, ipfs)
  batches = getBatches(accounts, OTHER_COMMUNITY)

  const initState = createInitState(OWNER, DEV_NAME, IS_OPEN)
  state = Object.assign({}, initState)
}

async function testBatch (batches, i) {
  const batch = batches[i]

  for (let j = batch.length - 1; j >= 0; j--) {
    log(`executing test ${counter++}...`)
    const call = batch[j]

    const res = await helper.packageNExecute(call.interaction, state, call.caller)
    if (res.type !== 'ok') console.error('\nERROR: The following interaction did not succeed:', res)
    state = res.state
  }

  return state
}
