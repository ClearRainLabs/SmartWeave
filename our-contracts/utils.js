/* global SmartWeave, ContractAssert, ContractError */

import { verifyJWT, decodeJWT } from 'did-jwt'
import { Resolver } from 'did-resolver'
import { getResolver } from '3id-resolver'

export function checkPayload (state, payload) {
  const caller = payload.iss
  const prevNonce = state.nonces[caller] || 0
  ContractAssert(prevNonce + 1 === payload.nonce, 'Nonce provided in payload is invalid')

  const contractId = getTag('Contract')

  /*
   * make sure the contractId is not false. It shouldn't be if we assume interactions are queried based
   * on the contract Id but if that changes, we want to prevent the insecure workaround of setting no contractId
   * and setting payload.contractId to false
   */
  ContractAssert(contractId, 'No contract ID provided.')
  ContractAssert(contractId === payload.contractId, 'The contract ID provided is invalid.')
}

export function isNotPreviousChild (communityId, state) {
  return typeof state.children[communityId] === 'undefined'
}

// short term fix for a problem with DID verification so we can continue building
export async function getPayloadNoVerify (jwt) {
  return decodeJWT(jwt).payload
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

function getTag (name) {
  const tags = SmartWeave.transaction.tags

  if (tags[name]) return tags[name]

  return false
}
