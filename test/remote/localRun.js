import TestHelper from '../helpers'
import getBatches from './txBatches'
import { initState, testKeys } from '../helpers/constants'
import debug from 'debug'

const log = debug('localRun')

let state
let helper
let batches
let counter = 1

export async function localRun () {
  await runSetup()

  let endState
  for (let i = 0; i < batches.length; i++) {
    endState = await testBatch(batches, i)
  }

  return endState
}

async function runSetup () {
  helper = new TestHelper()
  const accounts = await helper.setupEnv(testKeys)
  batches = getBatches(accounts)

  state = Object.assign({}, initState)
}

async function testBatch (batches, i) {
  const batch = batches[i]

  for (let j = batch.length - 1; j >= 0; j--) {
    log(`executing test ${counter++}...`)
    const call = batch[j]

    const res = await helper.packageNExecute(call.interaction, state, call.caller)
    if (res.type !== 'ok') console.error('\nThe following interaction did not succeed:', res)
    state = res.state
  }

  return state
}
