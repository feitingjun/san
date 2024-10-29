// @ts-nocheck
import { defineRuntime } from '../../lib/index'
import { useMemo } from 'react'
import { Provider } from './context'
import { models as rawModels } from './model'

function ModelProviderWrapper(props: any) {
  const models = useMemo(() => {
    return Object.keys(rawModels).reduce((memo, key) => {
      memo[rawModels[key].namespace] = rawModels[key].model
      return memo
    }, {})
  }, [])
  return <Provider models={models} {...props}>{ props.children }</Provider>
}

export default defineRuntime(({
  addProvider
}) => {
  addProvider(({ children }) => {
    return <ModelProviderWrapper>{children}</ModelProviderWrapper>
  })
})