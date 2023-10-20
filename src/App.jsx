import { createEffect } from 'solid-js';
import { Routes, Route, useSearchParams } from "@solidjs/router";
import { StateProvider, useState } from 'stores/state.jsx';
import Sidebar from '@/Sidebar';
import Modals from '@/Modals';
import Game from '@/Game';

function App() {
  return (
    <StateProvider>
      <Routes>
        <Route path="/apps/turf/" component={MainScreen} />
      </Routes>
    </StateProvider>
  );
}

function MainScreen() {
  const state = useState();
  const [searchParams, setSearchParams] = useSearchParams();

  createEffect(() => {
    let invite;
    if (invite = searchParams.invite) {
      state.mist.acceptInviteCode(invite);
      setSearchParams({ invite: null }, { replace: true });
    }
  });

  return (<>
    <Sidebar/>
    <Modals/>
    <Game/>
  </>);
}

export default App;
