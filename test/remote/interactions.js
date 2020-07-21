import * as functionTypes from 'clearrain/functionTypes'
import { OTHER_COMMUNITY } from '../helpers/constants'

const interactions = {
  access: {
    close: {
      function: functionTypes.SET_ACCESS,
      isOpen: false
    },
    open: {
      function: functionTypes.SET_ACCESS,
      isOpen: true
    }
  },
  children: {
    add: {
      function: functionTypes.ADD_CHILD,
      communityId: OTHER_COMMUNITY
    },
    remove: {
      function: functionTypes.REMOVE_CHILD,
      communityId: OTHER_COMMUNITY
    }
  },
  ownership: {
    function: functionTypes.TRANSFER_OWNERSHIP // must specifiy did in test
  },
  admins: {
    add: {
      function: functionTypes.ADMIN_ADD
    },
    remove: {
      function: functionTypes.ADMIN_REMOVE
    }
  },
  moderators: {
    add: {
      function: functionTypes.MOD_ADD
    },
    remove: {
      function: functionTypes.MOD_REMOVE
    }
  },
  members: {
    add: {
      function: functionTypes.MEMBER_ADD
    },
    remove: {
      function: functionTypes.MEMBER_REMOVE
    }
  }
}

export default interactions
