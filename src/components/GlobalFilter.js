import React, { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';

const GlobalFilter = ({ filter, setFilter }) => {
    const [value, setValue] = useState(filter);
    const [debouncedValue] = useDebounce(value, 500);

    useEffect(() => {
        setFilter(debouncedValue);
    }, [debouncedValue, setFilter]);

    return (
        <input
            value={value || ''}
            onChange={e => setValue(e.target.value)}
            placeholder="Search..."
        />
    );
};

export default GlobalFilter;