/* eslint-disable node/no-unpublished-import */
import ReactDOM from 'react-dom/client'
import App from './App'
import { ContextProvider, defaultContext } from './exports'
import './styles.css'

// Add strict mode if you want to, not using it personally.
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<ContextProvider value={defaultContext}>
		<App />
	</ContextProvider>
)
