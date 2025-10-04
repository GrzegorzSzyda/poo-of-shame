import { createRoot } from 'react-dom/client'
import { App } from './App'

const start = () => {
    const container = document.querySelector('#root')

    if (!container) {
        throw new Error('Missing #root container')
    }

    createRoot(container).render(<App />)
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start)
} else {
    start()
}
