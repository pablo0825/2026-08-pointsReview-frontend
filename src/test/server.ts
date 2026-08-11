import { setupServer } from 'msw/node'

import { publicApplicationInstructionsHandlers } from './handlers/public-application-instructions'

export const server = setupServer(...publicApplicationInstructionsHandlers)
