import React, { useState } from 'react';
import BootStrap from './BootStrap';
// import Aggrid from './Aggrid';
import Serverside from './Serverside';


function App() {
  const [activeView, setActiveView] = useState('BootStrap'); // Default

  return (
    <div className="App">
      <h1>Search UI</h1>

      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => setActiveView('BootStrap')}>ClientSide</button>
        <button onClick={() => setActiveView('Serverside')}>Serverside</button>
        {/* <button onClick={() => setActiveView('Aggrid')}>Ag-grid</button> */}
      </div>

      <div>
        {activeView === 'BootStrap' && <BootStrap />}
         {activeView === 'Serverside' && <Serverside />}
        {/* {activeView === 'Aggrid' && <Aggrid />} */}
      </div>
    </div>
  );
}

export default App;
