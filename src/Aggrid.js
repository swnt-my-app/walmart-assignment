import React, { useState, useRef, useCallback, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const API_URL = 'https://search-api-backend-production.up.railway.Aggrid/api/items';
const PAGE_SIZE = 10;

function Aggrid() {
  const [query, setQuery] = useState('');
  const gridRef = useRef();

  const columnDefs = useMemo(() => [
    { headerName: 'Name', field: 'name', flex: 1 },
    { headerName: 'Description', field: 'description', flex: 2 },
    {
      headerName: 'Price ($)',
      field: 'price',
      flex: 1,
      valueFormatter: ({ value }) => `$${parseFloat(value || 0).toFixed(2)}`
    }
  ], []);

  const getDataSource = useCallback((searchQuery) => ({
    getRows: async (params) => {
      const offset = params.startRow;
      const limit = PAGE_SIZE;

      try {
        const res = await fetch(`${API_URL}?offset=${offset}&limit=${limit}`);
        const data = await res.json();

        const filtered = data.filter(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const lastRow = filtered.length < PAGE_SIZE ? offset + filtered.length : -1;
        params.successCallback(filtered, lastRow);
      } catch (err) {
        console.error("API Fetch Failed", err);
        params.failCallback();
      }
    }
  }), []);

  const onGridReady = useCallback((params) => {
    gridRef.current = params.api;
    params.api.setDatasource(getDataSource(query));
  }, [getDataSource, query]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);

    setTimeout(() => {
      if (gridRef.current) {
        gridRef.current.setDatasource(getDataSource(value));
      }
    }, 200);
  };

  return (
    <div className="Aggrid">
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Search by name"
        style={{ marginBottom: 10, padding: 6, width: 250 }}
      />

      <div className="ag-theme-alpine" style={{ height: 400, width: '80%' }}>
        <AgGridReact
          columnDefs={columnDefs}
          rowModelType="infinite" // ✅ This enables setDatasource
          cacheBlockSize={PAGE_SIZE}
          paginationPageSize={PAGE_SIZE}
          onGridReady={onGridReady}
        />
      </div>
    </div>
  );
}

export default Aggrid;
