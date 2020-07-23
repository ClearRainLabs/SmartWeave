import { localRun } from './localRun'

localRun().then(state => {
  console.log('The final state of the run:', state)
  process.exit()
})
