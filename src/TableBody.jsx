import React from 'react';

const TableBody = ({ items, lastItemRef }) => (
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
);

export default TableBody;
