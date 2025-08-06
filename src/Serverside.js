import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

const PAGE_SIZE = 10;

const Serverside = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [items, setItems] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const observer = useRef();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300); // 300ms debounce

    return () => clearTimeout(handler);
  }, [query]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        query: debouncedQuery,
        offset,
        limit: PAGE_SIZE
      });

      const res = await fetch(`https://search-api-backend-production.up.railway.app/api/items?${params.toString()}`);
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
  }, [offset, debouncedQuery]);

  
  useEffect(() => {
    setItems([]);
    setOffset(0);
    setHasMore(true);
  }, [debouncedQuery]);


  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const lastItemRef = useCallback(
    node => {
      if (loading || !hasMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          setOffset(prev => prev + PAGE_SIZE);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  return (
    <div className="App">
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{ marginBottom: '10px', padding: '8px', width: '250px' }}
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
            {items.map((item, idx) => {
              const isLastItem = idx === items.length - 1;
              return (
                <tr key={idx} ref={isLastItem ? lastItemRef : null}>
                  <td>{item.name}</td>
                  <td>{item.description}</td>
                  <td>{item.price.toFixed(2)}</td>
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
};

export default Serverside;
