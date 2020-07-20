import TestHelper from '../helpers'
import getBatches from './txBatches'
import { initState, testKeys } from '../helpers/constants'

let state
let helper
let batches
let counter = 1

dryRun()

async function dryRun () {
  await runSetup()

  for (let i = 0; i < batches.length; i++) {
    await testBatch(batches, i)
  }

  process.exit()
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
    console.log(`executing test ${counter++}...`)
    const call = batch[j]

    const res = await helper.packageNExecute(call.interaction, state, call.caller)
    if (res.type !== 'ok') console.error(res, 'THE INTERACTION DID NOT SUCCEED.')
    state = res.state
  }
}
