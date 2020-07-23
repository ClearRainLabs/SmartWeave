import interactions from '../helpers/interactions'
import { OWNER } from '../helpers/constants'

/*
The accounts are ordered as follows

const ADMIN = accounts[0]
const MOD = accounts[1]
const MEMBER = accounts[2]
const MEMBER2 = accounts[3]
const NEW_OWNER = accounts[4]
*/

export default function getBatches (accounts, communityId) {
  if (communityId) {
    return batchesWChildren(accounts, communityId)
  }

  return batchesNoChildren(accounts)
}

function batchesNoChildren (accounts) {
  return [
    batchOne(accounts),
    batchTwo(accounts),
    batchThree(accounts)
  ]
}

function batchesWChildren (accounts, communityId) {
  const ADMIN = accounts[0]
  const MEMBER = accounts[2]
  const NEW_OWNER = accounts[4]

  return [
    [
      ...batchOne(accounts),
      // add child by anyone
      {
        interaction: {
          ...interactions.children.add,
          communityId
        },
        caller: MEMBER
      }
    ],
    [
      ...batchTwo(accounts),
      // remove child
      {
        interaction: {
          ...interactions.children.remove,
          communityId
        },
        caller: ADMIN
      }
    ],
    [
      ...batchThree(accounts),
      // add child
      {
        interaction: {
          ...interactions.children.add,
          communityId
        },
        caller: NEW_OWNER
      }
    ]
  ]
}

const batchOne = (accounts) => {
  const ADMIN = accounts[0]
  const MOD = accounts[1]
  const MEMBER = accounts[2]

  return [
    // close access
    {
      interaction: interactions.access.close,
      caller: OWNER
    },
    // add admin
    {
      interaction: {
        ...interactions.admins.add,
        admin: ADMIN
      },
      caller: OWNER
    },
    // add moderator
    {
      interaction: {
        ...interactions.moderators.add,
        moderator: MOD
      },
      caller: OWNER
    },
    // add member
    {
      interaction: {
        ...interactions.members.add,
        member: MEMBER
      },
      caller: OWNER
    }
  ]
}

const batchTwo = (accounts) => {
  const ADMIN = accounts[0]
  const MOD = accounts[1]
  const NEW_OWNER = accounts[4]

  return [
    // transfer ownership
    {
      interaction: {
        ...interactions.ownership,
        newOwner: NEW_OWNER
      },
      caller: OWNER
    },
    // change access
    {
      interaction: interactions.access.open,
      caller: ADMIN
    },
    // remove moderator
    {
      interaction: {
        ...interactions.moderators.remove,
        moderator: MOD
      },
      caller: ADMIN
    }
  ]
}

const batchThree = (accounts) => {
  const ADMIN = accounts[0]
  const MOD = accounts[1]
  const MEMBER2 = accounts[3]
  const NEW_OWNER = accounts[4]

  return [
    // member 2 adds themself
    {
      interaction: {
        ...interactions.members.add,
        member: MEMBER2
      },
      caller: MEMBER2
    },
    // new owner removes ADMIN
    {
      interaction: {
        ...interactions.admins.remove,
        admin: ADMIN
      },
      caller: NEW_OWNER
    },
    // add moderator back
    {
      interaction: {
        ...interactions.moderators.add,
        moderator: MOD
      },
      caller: NEW_OWNER
    }
  ]
}
