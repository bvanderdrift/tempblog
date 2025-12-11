import { NoOp } from 'convex-helpers/server/customFunctions'
import { zCustomMutation, zCustomQuery } from 'convex-helpers/server/zod4'
import { mutation, query } from './_generated/server'

export const zMutation = zCustomMutation(mutation, NoOp)
export const zQuery = zCustomQuery(query, NoOp)
