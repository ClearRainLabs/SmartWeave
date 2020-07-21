import interactions from './interactions'
import { OWNER } from '../helpers/constants'

export default function getBatches (accounts) {
  const ADMIN = accounts[0]
  const MOD = accounts[1]
  const MEMBER = accounts[2]
  const MEMBER2 = accounts[3]
  const NEW_OWNER = accounts[4]

  return [
    [
      // close access
      {
        interaction: interactions.access.close,
        caller: OWNER
      },
      // add child by anyone
      {
        interaction: interactions.children.add,
        caller: MEMBER
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
    ],
    [
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
      // remove child
      {
        interaction: interactions.children.remove,
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
    ],
    [
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
      // add child
      {
        interaction: interactions.children.add,
        caller: NEW_OWNER
      },
      // add moderator
      {
        interaction: {
          ...interactions.moderators.add,
          moderator: MOD
        },
        caller: NEW_OWNER
      }
    ]
  ]
}
