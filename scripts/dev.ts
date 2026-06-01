const processes: Array<ReturnType<typeof Bun.spawn>> = []
let isShuttingDown = false

const commands = [
    ['convex', ['bun', 'run', 'convex:dev']],
    ['web', ['bun', 'run', 'dev:web']],
] as const

const stopAll = (exitCode: number) => {
    if (isShuttingDown) {
        return
    }

    isShuttingDown = true

    for (const child of processes) {
        child.kill()
    }

    setTimeout(() => process.exit(exitCode), 100)
}

for (const [name, command] of commands) {
    const child = Bun.spawn(command, {
        env: process.env,
        stderr: 'inherit',
        stdin: 'inherit',
        stdout: 'inherit',
    })

    processes.push(child)

    child.exited.then((exitCode) => {
        if (isShuttingDown || exitCode === 0) {
            return
        }

        console.error(`${name} exited with code ${exitCode}`)
        stopAll(exitCode)
    })
}

process.on('SIGINT', () => stopAll(0))
process.on('SIGTERM', () => stopAll(0))
