import { interactWrite } from '../../src/contract-interact'
import { outpostDryRun } from '../../src/outpostDryRun'
import fs from 'fs'
import path from 'path'
import Arweave from 'arweave/node'
import { PROD_CONTRACT_ID } from 'outpost-protocol'
import IPFS from 'ipfs'

const IPFS_PINNING_ADDR = '/dnsaddr/ipfs.3box.io/tcp/443/wss/ipfs/QmZvxEpiVNjmNbEKyQGvFzAY1BwmGuuvdUTmcTstQPhyVC'

require('dotenv').config()

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
})

const devWalletPath = path.resolve(__dirname, `../../${process.env.DEV_WALLET}`)
const rawWallet = fs.readFileSync(devWalletPath)
const devWallet = JSON.parse(rawWallet)

const batch = [
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpYXQiOjE1OTc0MDc1OTcsImNvbnRyYWN0SWQiOiJCWENFQktUdi1GdmFuMG04MmFFaTduamRuUnNGRGx1RmtmTjh2cldHNUZJIiwiaW5wdXQiOnsiZnVuY3Rpb24iOiJyZW1vdmVNZW1iZXIiLCJtZW1iZXIiOiJkaWQ6MzpiYWZ5cmVpY3RrdXEzbDI3ZWtscmZkYXRod2hseW5mZnRidGp1aGt5amRhdm9qbndhNXFwNTJqaGRxaSJ9LCJpc3MiOiJkaWQ6MzpiYWZ5cmVpYWdrNmhsYmhkbnU1Z2x2bGxwcmdmbHd4aWIzeHo0bDM1bGI3NGljdGt3aGljZ2JudmY2ZSJ9.37Q6h7pRydtylJNegMGrdQg0-kmFTEmm255fzJuQFtMqyomen_E4NX2SzrjkoJWptlwHB1OOIGrORyo18tUs3A',
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpYXQiOjE1OTc0MDc4NDUsImNvbnRyYWN0SWQiOiJCWENFQktUdi1GdmFuMG04MmFFaTduamRuUnNGRGx1RmtmTjh2cldHNUZJIiwiaW5wdXQiOnsiZnVuY3Rpb24iOiJyZW1vdmVNZW1iZXIiLCJtZW1iZXIiOiJkaWQ6MzpiYWZ5cmVpY2tiYnVibHpkcDdqeGxxZW51MjdjZ2tqYzJmYmRlNGZmYWszN2ZxbWxwcG5jbTdmdjZ2ZSJ9LCJpc3MiOiJkaWQ6MzpiYWZ5cmVpYWdrNmhsYmhkbnU1Z2x2bGxwcmdmbHd4aWIzeHo0bDM1bGI3NGljdGt3aGljZ2JudmY2ZSJ9.xS8WepZpZPmTQ2kiObm1UxIpFkx9lrQYII2MaKpQXrZWXV2JtStIre6xq2PdNmJJjiqpHSfwzXYTPu9Zq7oxSQ',
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpYXQiOjE1OTc0MDgwMTAsImNvbnRyYWN0SWQiOiJCWENFQktUdi1GdmFuMG04MmFFaTduamRuUnNGRGx1RmtmTjh2cldHNUZJIiwiaW5wdXQiOnsiZnVuY3Rpb24iOiJhZGRNb2RlcmF0b3IiLCJtb2RlcmF0b3IiOiJkaWQ6MzpiYWZ5cmVpZHNhcTQ1cG9hNHZkd253ZHd3cXpvMjJ2c25qdGd1c2V1d3lzYmU1ajNpbnFhZ3ZvanlweSJ9LCJpc3MiOiJkaWQ6MzpiYWZ5cmVpYWdrNmhsYmhkbnU1Z2x2bGxwcmdmbHd4aWIzeHo0bDM1bGI3NGljdGt3aGljZ2JudmY2ZSJ9.vf1ABbrmtFbL3X-6iS1pU01p9kBdMDJO8A5KrYXElbGrrLmMmiT4C5XJptFi-v2ywp5t6qHXvDDpEPPtp8t1oA',
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpYXQiOjE1OTc0MDgwOTIsImNvbnRyYWN0SWQiOiJCWENFQktUdi1GdmFuMG04MmFFaTduamRuUnNGRGx1RmtmTjh2cldHNUZJIiwiaW5wdXQiOnsiZnVuY3Rpb24iOiJhZGRBZG1pbiIsImFkbWluIjoiZGlkOjM6YmFmeXJlaWRzYXE0NXBvYTR2ZHdud2R3d3F6bzIydnNuanRndXNldXd5c2JlNWozaW5xYWd2b2p5cHkifSwiaXNzIjoiZGlkOjM6YmFmeXJlaWFnazZobGJoZG51NWdsdmxscHJnZmx3eGliM3h6NGwzNWxiNzRpY3Rrd2hpY2dibnZmNmUifQ.0-QCrYwQJ7TMwBz5lsaCOmXB3bV3Tl92HCtCyG52W6dgu6ZQqeSE-U3_wczcmk3ZRU1Sj4y6mJOaEGQJ-Gyzkg',
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpYXQiOjE1OTc0MDgxODAsImNvbnRyYWN0SWQiOiJCWENFQktUdi1GdmFuMG04MmFFaTduamRuUnNGRGx1RmtmTjh2cldHNUZJIiwiaW5wdXQiOnsiZnVuY3Rpb24iOiJhZGRNb2RlcmF0b3IiLCJtb2RlcmF0b3IiOiJkaWQ6MzpiYWZ5cmVpZjVjZDZ0MmN3em5jY2p1dGN1NTNzNWpwdnl4cXNqZ3FndHdndGR4a210eXh1ZGJjc24yZSJ9LCJpc3MiOiJkaWQ6MzpiYWZ5cmVpYWdrNmhsYmhkbnU1Z2x2bGxwcmdmbHd4aWIzeHo0bDM1bGI3NGljdGt3aGljZ2JudmY2ZSJ9.2SbRT2xLRp1pgiixDulz8Dyaml-TKhGd62-6dMNkj4nc-9tpNj57OA0mzFEIxPe3Dvr5e4CI2jqi5YcRcgOFzw'
]

// remove sam
// remove samuel
// add jack as mod
// add jack as admin
// add abhay as mod

export async function postBatch (batch) {
  for (let i = 0; i < batch.length; i++) {
    const jwt = batch[i]

    const txId = await interactWrite(arweave, devWallet, PROD_CONTRACT_ID, jwt)
    console.log(`Posted ${txId} for jwt #${i}`)
  }
}

export async function postInteraction (jwt) {
  const txId = await interactWrite(arweave, devWallet, PROD_CONTRACT_ID, jwt)

  console.log(`Interaction posted at ${txId}`)
}

export async function testInteraction (jwt) {
  const ipfs = await IPFS.create()
  await ipfs.swarm.connect(IPFS_PINNING_ADDR)

  const status = await outpostDryRun(arweave, devWallet, PROD_CONTRACT_ID, jwt, ipfs)
  console.log(status, 'THE RESULT OF THE TRANSACTION')

  await ipfs.stop()
}

const jwt = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpYXQiOjE1OTc2MTY2MDcsImNvbnRyYWN0SWQiOiJCWENFQktUdi1GdmFuMG04MmFFaTduamRuUnNGRGx1RmtmTjh2cldHNUZJIiwiaW5wdXQiOnsiZnVuY3Rpb24iOiJhZGRDaGlsZCIsImNvbW11bml0eUlkIjoiMmtrNkpjZ2g4b211dEJ1T3J5TG5xbDFHeGhadlJtakpGeXZoZzV6NUt5byJ9LCJpc3MiOiJkaWQ6MzpiYWZ5cmVpYWdrNmhsYmhkbnU1Z2x2bGxwcmdmbHd4aWIzeHo0bDM1bGI3NGljdGt3aGljZ2JudmY2ZSJ9.WDOgQ1qInU_mgAteGix9YsmuzzeLOAEn_kxHPdZcDdnStG-HO2IUl29_v-mVSu3NiF_wWjno5IsKeOvKzGlJWQ'
postInteraction(jwt)
