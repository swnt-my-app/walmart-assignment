import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

const PAGE_SIZE = 10;

function App() {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const observer = useRef();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://search-api-backend-production.up.railway.app/api/items?offset=${offset}&limit=${PAGE_SIZE}`);
      const data = await res.json();

      if (data.length < PAGE_SIZE) {
        setHasMore(false);
      }

      setItems(prev => [...prev, ...data]);
    } catch (err) {
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  }, [offset]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const lastItemRef = useCallback(
    node => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          setOffset(prevOffset => prevOffset + PAGE_SIZE);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="App">
      <h1>Search Items</h1>
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Price ($)</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, idx) => {
              const isLastItem = idx === filteredItems.length - 1;
              return (
                <tr key={idx} ref={isLastItem ? lastItemRef : null}>
                  <td>{item.name}</td>
                  <td>{item.description}</td>
                  <td>{item.price.toFixed(2)}</td>
                  {/* <td>
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: '20px', height: 'auto' }}
                    />
                  </td> */}
                </tr>
              );
            })}
          </tbody>
        </table>
        {loading && <p>Loading more items...</p>}
        {!hasMore && <p>No more items to load.</p>}
      </div>
    </div>
  );
}

export default App;
