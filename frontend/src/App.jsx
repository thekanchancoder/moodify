import { RouterProvider } from "react-router"
import { router } from "./app.routes"
import "./features/shared/styles/Global.scss"
import { AuthProvider } from "./features/auth/auth.context"
import { SongProvider } from "./features/home/song.context"

function App() {


  return (
    <AuthProvider>
      <SongProvider>
        <RouterProvider router={router} />
      </SongProvider>

    </AuthProvider>
  )
}

export default App
