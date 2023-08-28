import { StateProvider } from 'stores/state.jsx';
import Sidebar from '@/Sidebar';
import Modals from '@/Modals';
import Game from '@/Game';

function App() {
  return (
    <StateProvider>
      <Sidebar/>
      <Modals/>
      <Game/>
    </StateProvider>
  );
}

export default App;
