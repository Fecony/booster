/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  rawEventsToEnvelopes,
  storeEvents,
  readEntityLatestSnapshot,
  readEntityEventsSince,
} from './library/events-adapter'
import { fetchReadModel, storeReadModel, rawReadModelEventsToEnvelopes } from './library/read-model-adapter'
import { rawGraphQLRequestToEnvelope } from './library/graphql-adapter'
import { DynamoDB, CognitoIdentityServiceProvider } from 'aws-sdk'
import { ProviderInfrastructure, ProviderLibrary, PluginDescriptor } from '@boostercloud/framework-types'
import { requestFailed, requestSucceeded } from './library/api-gateway-io'
import { searchReadModel } from './library/searcher-adapter'
import {
  deleteAllSubscriptions,
  deleteSubscription,
  fetchSubscriptions,
  subscribeToReadModel,
} from './library/subscription-adapter'
import { handleSignUpResult, rawSignUpDataToUserEnvelope, userEnvelopeFromAuthToken } from './library/auth-adapter'
import {
  deleteConnectionData,
  fetchConnectionData,
  sendMessageToConnection,
  storeConnectionData,
} from './library/connections-adapter'

const dynamoDB: DynamoDB.DocumentClient = new DynamoDB.DocumentClient()
const userPool = new CognitoIdentityServiceProvider()

/* We load the infrastructure package dinamically here to avoid including it in the
 * dependences that are deployed in the lambda functions. The infrastructure
 * package is only used during the deploy.
 */
function loadInfrastructurePackage(): { Infrastructure: (plugins?: PluginDescriptor[]) => ProviderInfrastructure } {
  return require(require('../package.json').name + '-infrastructure')
}

/**
 * `AWSProvider` is a function that accepts a list of plugin names and returns an
 * object compatible with the `ProviderLibrary` defined in the `framework-types` package.
 * The plugin names are passed to the infrastructure package, which loads them dynamically
 * to extend the AWS functionality. Plugins are typically distributed in separate npm packages.
 */
export const AWSProvider = (plugins?: PluginDescriptor[]): ProviderLibrary => {
  return {
    // ProviderEventsLibrary
    events: {
      rawToEnvelopes: rawEventsToEnvelopes,
      forEntitySince: readEntityEventsSince.bind(null, dynamoDB),
      latestEntitySnapshot: readEntityLatestSnapshot.bind(null, dynamoDB),
      store: storeEvents.bind(null, dynamoDB),
    },
    // ProviderReadModelsLibrary
    readModels: {
      rawToEnvelopes: rawReadModelEventsToEnvelopes,
      fetch: fetchReadModel.bind(null, dynamoDB),
      search: searchReadModel.bind(null, dynamoDB),
      store: storeReadModel.bind(null, dynamoDB),
      subscribe: subscribeToReadModel.bind(null, dynamoDB),
      fetchSubscriptions: fetchSubscriptions.bind(null, dynamoDB),
      deleteSubscription: deleteSubscription.bind(null, dynamoDB),
      deleteAllSubscriptions: deleteAllSubscriptions.bind(null, dynamoDB),
    },
    // ProviderGraphQLLibrary
    graphQL: {
      rawToEnvelope: rawGraphQLRequestToEnvelope.bind(null, userPool),
      handleResult: requestSucceeded,
    },
    // ProviderAuthLibrary
    auth: {
      rawToEnvelope: rawSignUpDataToUserEnvelope,
      fromAuthToken: userEnvelopeFromAuthToken.bind(null, userPool),
      handleSignUpResult: handleSignUpResult,
    },
    // ProviderAPIHandling
    api: {
      requestSucceeded,
      requestFailed,
    },
    connections: {
      storeData: storeConnectionData.bind(null, dynamoDB),
      fetchData: fetchConnectionData.bind(null, dynamoDB),
      deleteData: deleteConnectionData.bind(null, dynamoDB),
      sendMessage: sendMessageToConnection,
    },
    // ProviderInfrastructureGetter
    infrastructure: () => loadInfrastructurePackage().Infrastructure(plugins),
  }
}

export * from './constants'
