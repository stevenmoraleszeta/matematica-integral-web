import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const useFetchData = (collectionName) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        if (!collectionName) {
            setData([]);
            return;
        }

        const fetchData = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, collectionName));
                const dataList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setData(dataList);
            } catch (error) {
                console.error(`Error fetching ${collectionName}:`, error);
                setData([]);
            }
        };

        fetchData();
    }, [collectionName]);

    return data;
};

export default useFetchData;
