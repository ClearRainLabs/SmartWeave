/* global SmartWeave, ContractAssert, ContractError */

import { verifyJWT } from 'did-jwt'
import { Resolver } from 'did-resolver'
import { getResolver } from '3id-resolver'

export function checkPayload (state, payload) {
  const caller = payload.iss
  const prevNonce = state.nonces[caller] || 0
  ContractAssert(prevNonce + 1 === payload.nonce, 'Nonce provided in payload is invalid')

  const contractId = SmartWeave.contract.id

  ContractAssert(contractId, 'No contract ID provided.')
  ContractAssert(contractId === payload.contractId, 'The contract ID provided is invalid.')
}

export function isNotPreviousChild (communityId, state) {
  return typeof state.children[communityId] === 'undefined'
}

export async function getPayload (jwt, ipfs) {
  const threeIdResolver = getResolver(ipfs)
  const resolverWrapper = new Resolver(threeIdResolver)

  let verifiedJWT
  try {
    verifiedJWT = await verifyJWT(jwt, { resolver: resolverWrapper })
  } catch (e) {
    throw new ContractError(`JWT verification failed: ${e}`)
  }

  return verifiedJWT.payload
}
