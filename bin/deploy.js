const fs = require('fs')
const path = require('path')
const Arweave = require('arweave/node')
const { createInitState } = require('outpost-protocol')
const smartweave = require('../src')
const { OWNER, DEV_NAME, IS_OPEN, PROD_OWNER, PROD_NAME } = require('../test/helpers/constants')

require('dotenv').config()

const devWalletPath = path.resolve(__dirname, `../${process.env.DEV_WALLET}`)
const rawWallet = fs.readFileSync(devWalletPath)
const wallet = JSON.parse(rawWallet)

const srcPath = path.resolve(__dirname, '../build/community.js')
const contractSrc = fs.readFileSync(srcPath)

const isProduction = process.env.NODE_ENV === 'production'

const initState = isProduction ? createInitState(PROD_OWNER, PROD_NAME, IS_OPEN)
  : createInitState(OWNER, DEV_NAME, IS_OPEN)

const initStateString = JSON.stringify(initState)

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
})

smartweave.createContract(arweave, wallet, contractSrc, initStateString).then(
  (contractID) => {
    console.log('Contract created in TX: ' + contractID)
  }
)
