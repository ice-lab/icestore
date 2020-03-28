import Icestore from './icestore'
import * as T from './typings'
import mergeConfig from './utils/mergeConfig'

/**
 * global createModel
 *
 * creates a model for the given object
 * this is for autocomplete purposes only
 * returns the same object that was received as argument
 */
export function createModel<S = any, M extends T.ModelConfig<S> = any>(
	model: M
) {
	return model
}

// incrementer used to provide a store name if none exists
let count = 0

/**
 * init
 *
 * generates a Icestore
 * with a set configuration
 * @param config
 */
export const init = (initConfig: T.InitConfig = {}): T.Icestore => {
	const name = initConfig.name || count.toString()
	count += 1
	const config: T.Config = mergeConfig({ ...initConfig, name })
	return new Icestore(config).init()
}

export default {
	init,
}
