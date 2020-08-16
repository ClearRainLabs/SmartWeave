import { CONTRACT_ID } from 'outpost-protocol'
import { REMOVE_CHILD } from 'outpost-protocol/functionTypes'
import { testKeys } from '../helpers/constants'
import { interactWrite } from '../../src/contract-interact'
import fs from 'fs'
import path from 'path'
import Arweave from 'arweave/node'
import TestHelper from '../helpers'

require('dotenv').config()

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
})

const devWalletPath = path.resolve(__dirname, `../../${process.env.DEV_WALLET}`)
const rawWallet = fs.readFileSync(devWalletPath)
const devWallet = JSON.parse(rawWallet)

// change the contract input for different functions
const CONTRACT_INPUT = {
  function: REMOVE_CHILD,
  communityId: 'YWDxNRSuJUI-S76VbLBhqxpim-IFlI6PSNf9R1GDxkA'
}

async function postInteraction () {
  const helper = new TestHelper(true, CONTRACT_ID)
  const accounts = await helper.setupEnv(testKeys)

  const NEW_OWNER = accounts[4]

  const jwt = await helper.package(CONTRACT_INPUT, NEW_OWNER)

  const txId = await interactWrite(arweave, devWallet, CONTRACT_ID, jwt)

  console.log(`Interaction posted at ${txId}`)
  await helper.stopIPFS()
}

postInteraction()
