import { StateProvider } from 'stores/state.jsx';
import StateSummary from '@/StateSummary';
import Sidebar from '@/Sidebar';
import Game from '@/Game';

function App() {
  return (
    <StateProvider>
      {/* <StateSummary/> */}
      <Sidebar/>
      <Game/>
    </StateProvider>
  );
}

export default App;
