import { createRoot } from 'react-dom/client'
import { Router } from './Router'

const start = () => {
    const container = document.querySelector('#root')

    if (!container) {
        throw new Error('Missing #root container')
    }

    createRoot(container).render(<Router />)
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start)
} else {
    start()
}
