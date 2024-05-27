import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 模拟数据生成函数
const generateFakeData = (page, itemsPerPage) => {
    const totalItems = 150; // 假设总共有150个项目
    const data = Array.from({ length: totalItems }, (_, i) => ({
        id: i + 1,
        name: `Item ${i + 1}`,
    }));
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return data.slice(start, end);
};

// 模拟的API调用
const fetchFakeData = async (page, itemsPerPage) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(generateFakeData(page, itemsPerPage));
        }, 500); // 模拟网络延迟
    });
};

const ListComponent = () => {
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cachedData, setCachedData] = useState({});

    const ITEMS_PER_PAGE = 30;

    useEffect(() => {
        const fetchData = async () => {
            if (cachedData[page]) {
                setData(cachedData[page]);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const newData = await fetchFakeData(page, ITEMS_PER_PAGE);
                setData(newData);
                setCachedData((prev) => ({ ...prev, [page]: newData }));
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Error fetching data. Please try again later.');
            }

            setLoading(false);
        };

        fetchData();
    }, [page, cachedData]);

    const handleNextPage = () => {
        setPage((prevPage) => prevPage + 1);
    };

    const handlePrevPage = () => {
        if (page > 1) {
            setPage((prevPage) => prevPage - 1);
        }
    };

    return (
        <div>
            <h1>列表项</h1>
            {loading && <p>加载中...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <ul>
                {data.map((item) => (
                    <li key={item.id}>{item.name}</li>
                ))}
            </ul>
            <div>
                <button onClick={handlePrevPage} disabled={loading || page === 1}>
                    上一页
                </button>
                <button onClick={handleNextPage} disabled={loading}>
                    下一页
                </button>
            </div>
        </div>
    );
};

export default ListComponent;
