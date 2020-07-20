import fs from 'fs'
import path from 'path'
import Arweave from 'arweave/node'
import { execute } from '../../../src/contract-step'
import DidTestHelper from '3id-test-helper'
import IPFS from 'ipfs'
import wallet from './test-wallet'
import { loadContract, createContractExecutionEnvironment } from '../../../src/contract-load'

require('dotenv').config()

const LOCAL_CONTRACT_ID = 'random id for testing'

const REMOTE_CONTRACT_ID = 'ZiBxuvFUNJlSx6tPlF2uvoAA9tA5NWW2-naLjXn7NAw'

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
})

const CONTRACT_PATH = path.resolve(__dirname, '../../../build/community.js')

const contractBuffer = fs.readFileSync(CONTRACT_PATH)
const contractSrc = contractBuffer.toString()

let ipfs
let didHelper
let handler
let swGlobal

export default class TestHelper {
  constructor (isRemote = false, remoteContract = REMOTE_CONTRACT_ID) {
    this.nonces = {}
    this.isRemote = Boolean(isRemote)
    this.contractId = isRemote ? remoteContract : LOCAL_CONTRACT_ID

    if (isRemote) {
      console.log(`Remote Contract ID: ${this.contractId}`)
    }
  }

  async setupEnv (testKeys) {
    let contractInfo
    if (this.isRemote) {
      contractInfo = await loadContract(arweave, this.contractId)
    } else {
      contractInfo = createContractExecutionEnvironment(arweave, contractSrc, this.contractId)
    }

    swGlobal = contractInfo.swGlobal
    handler = contractInfo.handler

    ipfs = await IPFS.create()
    didHelper = new DidTestHelper(ipfs)

    const accounts = await didHelper.generateAccounts(testKeys)
    await didHelper.getOwner() // sets the signer for the owner DID

    return accounts
  }

  getArweave () {
    return arweave
  }

  getRemoteContractId () {
    if (!this.isRemote) throw new Error('Is remote should be set to true if you need the remote contract ID.')
    return this.contractId
  }

  async package (input, caller) {
    const nonce = this.nonces[caller] ? this.nonces[caller] + 1 : 1

    this.nonces[caller] = nonce

    const interaction = {
      input,
      nonce,
      contractId: this.contractId
    }

    return await didHelper.createJWTFromDID(caller, interaction)
  }

  async packageNExecute (input, state, caller) {
    const jwt = await this.package(input, caller)

    swGlobal._activeTx = await this.getInteractionTx(jwt)

    const res = await execute(handler, { input: jwt /*, ipfs */ }, state)

    return res
  }

  // code taken mainly from interactWrite in contract-interact
  async getInteractionTx (input) {
    const interactionTx = await arweave.createTransaction(
      {
        data: Math.random()
          .toString()
          .slice(-4)
      },
      wallet
    )

    if (!input) {
      throw new Error(`Input should be a truthy value: ${JSON.stringify(input)}`)
    }

    interactionTx.addTag('App-Name', 'SmartWeaveAction')
    interactionTx.addTag('App-Version', '0.3.0')
    interactionTx.addTag('Contract', this.contractId)
    interactionTx.addTag('Input', JSON.stringify(input))

    // await arweave.transactions.sign(interactionTx, wallet)

    // interaction Tx needs to satisfy InteractionTx interface
    const fullTx = this.fillUnusedTxValues(interactionTx)
    return fullTx
  }

  fillUnusedTxValues (tx) {
    return {
      tx,
      info: {
        status: 200,
        confirmed: {
          block_indep_hash: 'some hash',
          block_height: 1,
          number_of_confirmations: 10
        }
      },
      id: '',
      sortKey: '',
      from: ''
    }
  }

  stopIPFS () {
    ipfs.stop()
  }
}
