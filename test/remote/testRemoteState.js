import Arweave from 'arweave/node'
import { readContract } from '../../src/contract-read'
import { localRun } from './localRun'
import { REMOTE_CONTRACT_ID } from '../helpers/constants'
import { isEqual } from 'lodash'

// const contractId = 'th76PmwfV5zgUsf3LLiI_qic7n8p4sHKarAIDqR-kG0'

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
})

async function run () {
  console.log('getting local state...')
  const localState = await localRun()
  console.log('getting remote state...')
  const remoteState = await readContract(arweave, REMOTE_CONTRACT_ID)

  const allGood = isEqual(localState, remoteState)
  if (allGood) {
    console.log('✨ Test completed successfully.')
  } else {
    console.error('Error: localState and remote state are unequal!')
    console.log('Local state:', localState)
    console.log('Remote state:', remoteState)
  }
}

run().then(() => process.exit())
