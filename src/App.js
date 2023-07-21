import './styles/App.css';
import Info from './components/Info';
import MintNFT from './components/MintNFT';
import Bet from './components/Bet';

import {
  createBrowserRouter,
  RouterProvider,
  Routes
} from "react-router-dom";

const router = createBrowserRouter([
  { path : "*", Component: Root},
  { path : "/", Component: Info},
  { path : "/mint", Component: MintNFT},
  { path : "/bet", Component: Bet}
  
]);

function Root() {
  return(
  <Routes>
  </Routes>
  )
}
function App() {
  return (
    <RouterProvider router={router}/>
  )
    
}

export default App;
