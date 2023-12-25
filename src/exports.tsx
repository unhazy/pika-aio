/* eslint-disable node/no-unpublished-import */
import { Dispatch, SetStateAction, createContext, useContext, useState } from 'react'
import io, { Socket } from 'socket.io-client'

interface GlobalInterface {
	isLoading: boolean
	httpServer: Socket
	processID: number
}

// @ts-expect-error -- Will deal with later. (https://github.com/DefinitelyTyped/DefinitelyTyped/pull/24509#issuecomment-382213106)
const globalContext = createContext<GlobalInterface>()
// @ts-expect-error -- Will deal with later. (https://github.com/DefinitelyTyped/DefinitelyTyped/pull/24509#issuecomment-382213106)
const updateContext = createContext<Dispatch<SetStateAction<GlobalInterface>>>()

export const useGlobal = () => {
	return useContext(globalContext)
}

export const setGlobal = () => {
	return useContext(updateContext)
}

export const ContextProvider = ({ value, children }: { value: GlobalInterface; children: React.ReactNode }) => {
	const [key, setKey] = useState(value)
	return (
		<globalContext.Provider value={key}>
			<updateContext.Provider value={setKey}>{children}</updateContext.Provider>
		</globalContext.Provider>
	)
}

export const defaultContext: GlobalInterface = {
	isLoading: true,
	httpServer: io('http://localhost:8080'),
	processID: -1
}

export interface Settings {
	ign: string
	pass: string
	mode: 'opp' | 'opsb' | 'opf' | 'kpvp'
	kit_module: boolean
	collect_once: boolean
	main_online: boolean
	first_join: boolean
	is_async: boolean
	is_afk: boolean
}

export const defaultSettings: Settings = {
	ign: 'Default',
	pass: 'Default',
	mode: 'opp',
	kit_module: false,
	collect_once: false,
	main_online: false,
	first_join: false,
	is_async: false,
	is_afk: false
}
