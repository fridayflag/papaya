import { Currency } from '@/schema/support/currency'
import { Model } from '@/schema/support/orm/Model'
import { z } from 'zod'

const [CreateBaseFigure, BaseFigure] = Model.fromSchema({
  kind: z.literal('papaya:figure'),
  currency: Currency,
  amount: z.number(),
})

export const CreateFigure = CreateBaseFigure.extend({
  get convertedFrom() {
    return CreateBaseFigure.optional()
  },
})
export type CreateFigure = z.output<typeof CreateFigure>

export const Figure = BaseFigure.extend({
  get convertedFrom() {
    return BaseFigure.optional()
  },
})
export type Figure = z.output<typeof Figure>
