import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const useFetchData = (collectionName) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        if (!collectionName) return;
        
        try {
            setLoading(true);
            setError(null);
            const querySnapshot = await getDocs(collection(db, collectionName));
            const dataList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setData(dataList);
        } catch (err) {
            console.error(`Error fetching ${collectionName}: `, err);
            setError(err);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [collectionName]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
};

export default useFetchData;
