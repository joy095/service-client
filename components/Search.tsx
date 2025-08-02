// components/SearchBar.tsx
'use client';

import { Search } from "lucide-react";
import styles from '@/css/SearchBar.module.css';

export default function SearchBar() {
    return (
        <div className={styles.bar}>
            <div className={styles.location}>
                <p className={styles.label}>Location</p>
                <input
                    type="text"
                    placeholder="Where are you going?"
                    className={styles.inputField}
                />
            </div>
            <div className={styles.checkIn}>
                <p className={styles.label}>Check in</p>
                <input
                    type="text"
                    placeholder="Add dates"
                    className={styles.inputField}
                />
            </div>
            <div className={styles.checkOut}>
                <p className={styles.label}>Check out</p>
                <input
                    type="text"
                    placeholder="Add dates"
                    className={styles.inputField}
                />
            </div>
            <div className={styles.guests}>
                <p className={styles.label}>Guests</p>
                <input
                    type="text"
                    placeholder="Add guests"
                    className={styles.inputField}
                />
                <span className={styles.searchIcon}>
                    <Search size={16} />
                </span>
            </div>
        </div>
    );
}