import * as request from 'supertest'

type CallbackHandler = (res: request.Response) => any
const GRAPHQL_ENDPOINT = '/graphql'

type GraphqlOfCtx = {
  query: string
  expect?: CallbackHandler
  for: (cb: CallbackHandler) => void
  go: (
    app: any,
    setFields?: Map<string, string>
  ) => request.Test
}

export const graphqlOf = (query: string) => {
  const ctx: GraphqlOfCtx = {
    query,
    for(cb: CallbackHandler) {
      ctx.expect = cb
    },
    go(app: any, setFields?: Map<string, string>) {
      const req = request(app).post(GRAPHQL_ENDPOINT)
      if (!!setFields) {
        ;[...setFields.entries()].forEach(([key, val]) => {
          req.set(key, val)
        })
      }
      return req
        .send({ query: ctx.query })
        .expect(200)
        .expect((res) => {
          ctx?.expect(res)
        })
    }
  }

  return ctx
}
