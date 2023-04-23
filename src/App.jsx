import logo from 'assets/logo.svg';
import styles from 'css/App.module.css';
import { StateProvider } from 'stores/state.jsx';
import StateSummary from '@/StateSummary.jsx';

function App() {
  return (
    <StateProvider>
      <StateSummary></StateSummary>
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
