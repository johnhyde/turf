// import { onMount, untrack, getOwner } from 'solid-js';
import { StateProvider } from 'stores/state.jsx';
import StateSummary from '@/StateSummary';
import Game from '@/Game';

// const game = document.getElementById('game');
// initEngine(null, game);
function App() {
  return (
    <StateProvider>
      <StateSummary/>
      <Game/>
    </StateProvider>
  );
}

export default App;


// function App() {
//   return (
//     <div class={styles.App}>
//       <header class={styles.header}>
//         <img src={logo} class={styles.logo} alt="logo" />
//         <p>
//           Edit <code>src/App.jsx</code> and save to reload.
//         </p>
//         <a
//           class={styles.link}
//           href="https://github.com/solidjs/solid"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn Solid
//         </a>
//       </header>
//     </div>
//   );
// }
