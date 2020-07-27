import fs from 'fs'
import path from 'path'
import TestHelper from '../helpers'
import getBatches from './txBatches'
import { createContractFromTx } from '../../src/contract-create'
import initialState from '../../initialState.json'
import { testKeys, REMOTE_CONTRACT_ID } from '../helpers/constants'
import Arweave from 'arweave/node'
const { argv } = require('yargs')

require('dotenv').config()

const CONTRACT_SRC = 'rP7vAXZeZ7f-4AJUeBjPr03QrF7w1_KP1M5q5VrJHKE'

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

// const willCreateContract = Boolean(argv.createContract)

/*
postInteractions(willCreateContract)
  .then(contractId => {
    console.log(contractId, 'THE CONTRACT ID RETURNED FROM FIRST RUN')
    postInteractions(true, contractId)
  })
  */

postInteractions(true, 'RaSbcDvwLwkauh_1O2BBzyBZ-Onu_LzGzcB7p-7GGXs')
  .then(() => console.log('FINISHED'))

export async function postInteractions (create = true, childContract) {
  let contractId

  if (create) {
    contractId = await createContract()
    console.log('Contract created successfully.')
  }

  helper = new TestHelper(true, contractId)
  const accounts = await helper.setupEnv(testKeys)
  batches = getBatches(accounts, childContract)

  console.log('Posting transactions...')
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    await postNWait(batch)
  }

  helper.stopIPFS()
  return contractId || REMOTE_CONTRACT_ID
}

async function createContract () {
  console.log(`Creating contract with source ${CONTRACT_SRC}...`)
  const contractId = await createContractFromTx(arweave, devWallet, CONTRACT_SRC, JSON.stringify(initialState))

  let txStatus = await arweave.transactions.getStatus(contractId)

  while (txStatus.confirmed === null) {
    console.log('Waiting for contract creation to be confirmed...')
    await delay(45)
    txStatus = await arweave.transactions.getStatus(contractId)
  }

  console.log(`Contract created with id ${contractId}`)

  return contractId
}

// post batch of transactions and wait for them to be confirmed
async function postNWait (batch) {
  console.log('Posting batch of transactions...')
  let someId
  for (let i = 0; i < batch.length; i++) {
    const call = batch[i]

    const jwt = await helper.package(call.interaction, call.caller)
    someId = await postTx(jwt)
  }

  let txStatus = await arweave.transactions.getStatus(someId)

  while (txStatus.confirmed === null) {
    console.log('Waiting for transaction to be confirmed...')
    await delay(60)
    txStatus = await arweave.transactions.getStatus(someId)
  }
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
  return interactionTx.id
}

const delay = (seconds) => {
  const ms = seconds * 1000
  return new Promise(resolve => setTimeout(resolve, ms))
}
