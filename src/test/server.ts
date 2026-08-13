import { setupServer } from 'msw/node'

import { publicApplicationInstructionsHandlers } from './handlers/public-application-instructions'
import { publicCompetitionApplicationHandlers } from './handlers/public-competition-application'

export const server = setupServer(
  ...publicApplicationInstructionsHandlers,
  ...publicCompetitionApplicationHandlers,
)
