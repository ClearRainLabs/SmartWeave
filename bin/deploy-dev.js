const fs = require('fs')
const path = require('path')
const Arweave = require('arweave/node')
const { createInitState } = require('outpost-protocol')
const smartweave = require('../src')
const { OWNER, DEV_NAME, IS_OPEN } = require('../test/helpers/constants')

require('dotenv').config()

const devWalletPath = path.resolve(__dirname, `../${process.env.DEV_WALLET}`)
const rawWallet = fs.readFileSync(devWalletPath)
const wallet = JSON.parse(rawWallet)

const srcPath = path.resolve(__dirname, '../build/community.js')
const contractSrc = fs.readFileSync(srcPath)
const initState = createInitState(OWNER, DEV_NAME, IS_OPEN)

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
})

smartweave.createContract(arweave, wallet, contractSrc, initState).then(
  (contractID) => {
    console.log('Contract created in TX: ' + contractID)
  }
)
