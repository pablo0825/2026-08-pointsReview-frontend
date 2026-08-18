import { setupServer } from 'msw/node'

import { publicApplicationInstructionsHandlers } from './handlers/public-application-instructions'
import { publicCompetitionApplicationHandlers } from './handlers/public-competition-application'
import { publicExhibitionApplicationHandlers } from './handlers/public-exhibition-application'
import { publicProjectParticipationApplicationHandlers } from './handlers/public-project-participation-application'

export const server = setupServer(
  ...publicApplicationInstructionsHandlers,
  ...publicProjectParticipationApplicationHandlers,
  ...publicCompetitionApplicationHandlers,
  ...publicExhibitionApplicationHandlers,
)
