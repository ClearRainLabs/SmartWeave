import fs from 'fs'
import path from 'path'
import TestHelper from '../helpers'
import getBatches from './txBatches'
import { createContractFromTx } from '../../../src/contract-create'
import initialState from '../../../initialState.json'
import { testKeys } from '../helpers/constants'
import Arweave from 'arweave/node'
const { argv } = require('yargs')

require('dotenv').config()

let helper
let batches
let counter = 1

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
})

const devWalletPath = path.resolve(__dirname, process.env.DEV_WALLET)
const rawWallet = fs.readFileSync(devWalletPath)
const devWallet = JSON.parse(rawWallet)

const willCreateContract = Boolean(argv.createContract)

postInteractions(willCreateContract)

export async function postInteractions (create = false) {
  let contractId
  let blockHeight = 0

  if (create) {
    blockHeight = await createContract()
    console.log(`Contract created at height ${blockHeight}`)
  }

  helper = new TestHelper(true, contractId)
  const accounts = await helper.setupEnv(testKeys)
  batches = getBatches(accounts)

  console.log('Posting transactions...')
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    blockHeight = await postOnNewBlock(batch, blockHeight)
  }

  process.exit()
}

async function createContract () {
  const CONTRACT_SRC = 'Bv9CBpJ1TQBLLYxMZpOwS51uoZeXyFeuDUbQzpcizA8'

  const contractId = await createContractFromTx(arweave, devWallet, CONTRACT_SRC, JSON.stringify(initialState))

  let txStatus = await arweave.transactions.getStatus(contractId)

  while (txStatus.confirmed === null) {
    console.log('Waiting for contract creation to be confirmed...')
    await delay(45)
    txStatus = await arweave.transactions.getStatus(contractId)
  }

  console.log(`Contract created with id ${contractId}`)

  return txStatus.confirmed.block_height
}

async function postOnNewBlock (batch, prevHeight) {
  const getCurrentHeight = async () => {
    const networkInfo = await arweave.network.getInfo()
    return networkInfo.height
  }
  let currentHeight = await getCurrentHeight()

  while (currentHeight <= prevHeight) {
    console.log('Waiting for new block...')
    await delay(45)
    currentHeight = await getCurrentHeight()
    console.log(`Block height: ${currentHeight}`)
  }

  console.log(`Posting batch at block height ${currentHeight}...`)
  for (let i = 0; i < batch.length; i++) {
    const call = batch[i]
    const jwt = await helper.package(call.interaction, call.caller)
    await postTx(jwt)
  }

  return currentHeight
}

async function postTx (input) {
  const interactionTx = await arweave.createTransaction(
    {
      data: Math.random()
        .toString()
        .slice(-4)
    },
    devWallet
  )

  if (!input) {
    throw new Error(`Input should be a truthy value: ${JSON.stringify(input)}`)
  }

  interactionTx.addTag('App-Name', 'SmartWeaveAction')
  interactionTx.addTag('App-Version', '0.3.0')
  interactionTx.addTag('Contract', helper.getRemoteContractId())
  interactionTx.addTag('Input', JSON.stringify(input))

  await arweave.transactions.sign(interactionTx, devWallet)

  const response = await arweave.transactions.post(interactionTx)
  console.log(`Posted tx #${counter++} with status ${response.status}`)
}

const delay = (seconds) => {
  const ms = seconds * 1000
  return new Promise(resolve => setTimeout(resolve, ms))
}
