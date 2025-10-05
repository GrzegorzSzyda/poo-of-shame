import { Outlet } from "@tanstack/react-router"
import { Header } from "~/layout/Header"
import "./index.css"

export const App = () => (
    <div className="min-h-screen">
        <Header />
        <main>
            <Outlet />
        </main>
    </div>
)
