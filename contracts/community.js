/* global ContractAssert, ContractError */

import checkRoleOps, { hasAdminPrivileges } from './roles'
import { getPayload, checkPayload, isNotPreviousChild, setTimeStamp } from './utils'
import {
  SET_ACCESS,
  ADD_CHILD,
  REMOVE_CHILD
} from 'outpost-protocol/functionTypes'

export async function handle (state, action) {
  const payload = await getPayload(action.input, action.ipfs)

  // ensure the payload has the correct nonce and contract id. This prevents reusing a signature.
  checkPayload(state, payload)

  setTimeStamp(state, payload)

  const op = checkRoleOps(state, payload)
  if (op.isRoleOp) return { state: op.state }

  const { input } = payload

  if (input.function === SET_ACCESS) {
    ContractAssert(hasAdminPrivileges(payload.iss, state), 'Must have admin privileges to set access')

    state.isOpen = input.isOpen
    return { state }
  }

  if (input.function === ADD_CHILD) {
    // can be called by anyone if the community has not previously been removed
    // otherwise must be called by admin
    ContractAssert(isNotPreviousChild(input.communityId, state) || hasAdminPrivileges(payload.iss, state),
      'A community that has been removed can only be added back with admin privileges')

    // add check to make sure communityId is an arweave contract, will need access to arweave.transaction
    // get the transaction and then check to make sure it's App-Name is SmartWeaveContract

    state.children[input.communityId] = true

    return { state }
  }

  if (input.function === REMOVE_CHILD) {
    ContractAssert(hasAdminPrivileges(payload.iss, state), 'Caller must have admin privileges to remove a community')

    state.children[input.communityId] = false

    return { state }
  }

  throw new ContractError(`No function supplied or function not recognised: "${input.function}"`)
}
