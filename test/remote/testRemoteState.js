import Arweave from 'arweave/node'
import IPFS from 'ipfs'
import { readOutpostContract } from '../../src/readOutpostContract'
import { localRun } from './localRun'
import { REMOTE_CONTRACT_ID, DID_PINNING_ADDR } from '../helpers/constants'
import { isEqual } from 'lodash'

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
})

async function run () {
  const ipfs = await IPFS.create()
  await ipfs.swarm.connect(DID_PINNING_ADDR)

  console.log('getting local state...')
  const localState = await localRun(ipfs)
  console.log('getting remote state...')
  const remoteState = await readOutpostContract(arweave, REMOTE_CONTRACT_ID, ipfs)

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
